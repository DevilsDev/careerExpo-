/**
 * Inside Your Computer
 * Friendly, high-school-friendly visualisation of how the parts of a computer
 * work together. Click a component to learn what it does, or run an action
 * ("Play a Game", "Save a Photo") and watch data fly between the parts.
 */
window.SceneCPU = (function () {
  const COMPONENTS = [
    { id: "cpu", label: "CPU", full: "Processor", icon: "🧠", color: "#ff3b3b",
      x: 0.50, y: 0.45,
      desc: "The brain. Does billions of tiny calculations every second to run everything you see." },
    { id: "ram", label: "RAM", full: "Memory", icon: "⚡", color: "#34d1bf",
      x: 0.22, y: 0.30,
      desc: "Super-fast short-term memory. Holds the apps you currently have open. Wiped when you turn off." },
    { id: "gpu", label: "GPU", full: "Graphics Card", icon: "🎮", color: "#8a5cff",
      x: 0.78, y: 0.30,
      desc: "The artist. Draws every pixel on your screen, 60+ times a second. Makes games look amazing." },
    { id: "ssd", label: "SSD", full: "Storage", icon: "💾", color: "#ffd166",
      x: 0.22, y: 0.70,
      desc: "Long-term memory. Your photos, music, schoolwork — everything you save lives here." },
    { id: "net", label: "NET", full: "Network Card", icon: "🌐", color: "#ff6f91",
      x: 0.78, y: 0.70,
      desc: "The messenger. Connects you to the internet over WiFi or Ethernet." }
  ];

  const BUSES = [
    ["cpu", "ram"], ["cpu", "gpu"], ["cpu", "ssd"], ["cpu", "net"],
    ["ram", "gpu"], ["ram", "ssd"]
  ];

  const ACTIONS = [
    { id: "browser",  label: "Open Browser",  icon: "🌐",
      steps: [
        ["ssd", "ram", "Browser app loaded from storage into memory"],
        ["ram", "cpu", "CPU starts running the browser code"],
        ["cpu", "net", "CPU asks the internet for the webpage"],
        ["net", "ram", "Webpage data arrives and lands in memory"],
        ["cpu", "gpu", "CPU tells GPU to draw the page on screen"]
      ]},
    { id: "game",     label: "Play a Game",   icon: "🎮",
      steps: [
        ["ssd", "ram", "Game loaded from storage into memory"],
        ["ram", "cpu", "CPU runs game logic & physics"],
        ["cpu", "gpu", "CPU sends draw commands to the GPU"],
        ["ram", "gpu", "GPU reads textures and draws the frame"]
      ]},
    { id: "save",     label: "Save a Photo",  icon: "📸",
      steps: [
        ["ram", "cpu", "CPU reads the photo from memory"],
        ["cpu", "ssd", "CPU writes the photo to storage"],
        ["ssd", "cpu", "Storage confirms the save is complete"]
      ]},
    { id: "download", label: "Download File", icon: "⬇️",
      steps: [
        ["cpu", "net", "CPU asks the internet for the file"],
        ["net", "ram", "File bits arrive and are buffered in memory"],
        ["ram", "ssd", "File is written from memory to storage"]
      ]}
  ];

  let positions = {};
  let packets = [];
  let activeAction = null;
  let actionStepIdx = 0;
  let lastStepTime = 0;
  let logMessage = "Click a part to learn about it, or pick an action below";
  let selectedId = null;
  let actionButtons = []; // { id, x, y, w, h }
  let pulses = {};        // componentId -> remaining pulse frames

  function layout(p) {
    positions = {};
    for (const c of COMPONENTS) {
      positions[c.id] = {
        x: c.x * p.width,
        y: c.y * (p.height - 130) + 30  // reserve space at the bottom for buttons
      };
    }
  }

  function compAt(p, x, y) {
    for (const c of COMPONENTS) {
      const pos = positions[c.id];
      if (p.dist(x, y, pos.x, pos.y) < 56) return c;
    }
    return null;
  }

  function actionAt(x, y) {
    for (const b of actionButtons) {
      if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) return b;
    }
    return null;
  }

  function startAction(p, actionId) {
    const a = ACTIONS.find(a => a.id === actionId);
    if (!a) return;
    activeAction = a;
    actionStepIdx = 0;
    lastStepTime = p.millis();
    runStep(p);
  }

  function runStep(p) {
    if (!activeAction) return;
    const step = activeAction.steps[actionStepIdx];
    if (!step) {
      logMessage = "✅ Done! Try another action.";
      activeAction = null;
      return;
    }
    const [from, to, msg] = step;
    logMessage = msg;
    pulses[from] = 30;
    sendPacket(p, from, to);
  }

  function sendPacket(p, from, to) {
    const c = COMPONENTS.find(x => x.id === from);
    packets.push({
      from, to,
      progress: 0,
      speed: 0.02,
      color: c.color
    });
  }

  function drawBackground(p) {
    p.noStroke();
    for (let y = 0; y < p.height; y += 4) {
      const t = y / p.height;
      p.fill(p.lerpColor(p.color(11, 13, 18), p.color(20, 26, 42), t));
      p.rect(0, y, p.width, 4);
    }

    // Faint grid that looks like a circuit board
    p.stroke(255, 12);
    p.strokeWeight(1);
    for (let x = 0; x < p.width; x += 30) p.line(x, 0, x, p.height - 130);
    for (let y = 0; y < p.height - 130; y += 30) p.line(0, y, p.width, y);
  }

  function drawBuses(p) {
    for (const [a, b] of BUSES) {
      const pa = positions[a], pb = positions[b];
      p.stroke(255, 40);
      p.strokeWeight(3);
      p.line(pa.x, pa.y, pb.x, pb.y);
      // dashed midline
      p.stroke(52, 209, 191, 80);
      p.strokeWeight(1);
      p.drawingContext.setLineDash([6, 8]);
      p.line(pa.x, pa.y, pb.x, pb.y);
      p.drawingContext.setLineDash([]);
    }
  }

  function drawComponent(p, c) {
    const pos = positions[c.id];
    const pulse = pulses[c.id] || 0;
    const r = 80 + pulse * 0.4;

    // Pulse halo
    if (pulse > 0) {
      const halo = p.color(c.color);
      halo.setAlpha(pulse * 4);
      p.noStroke();
      p.fill(halo);
      p.circle(pos.x, pos.y, r + 40);
      pulses[c.id]--;
    }

    // Card
    p.noStroke();
    p.fill(20, 24, 34);
    p.rect(pos.x - 56, pos.y - 50, 112, 100, 14);

    // Coloured top accent
    p.fill(c.color);
    p.rect(pos.x - 56, pos.y - 50, 112, 14, 14, 14, 0, 0);

    // Selection / hover ring
    if (selectedId === c.id) {
      p.noFill();
      p.stroke(c.color);
      p.strokeWeight(3);
      p.rect(pos.x - 58, pos.y - 52, 116, 104, 16);
    }

    // Icon
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(28);
    p.text(c.icon, pos.x, pos.y - 12);

    // Label
    p.fill(255);
    p.textSize(15);
    p.textStyle(p.BOLD);
    p.text(c.label, pos.x, pos.y + 16);
    p.textStyle(p.NORMAL);

    // Subtitle
    p.fill("#9aa3b6");
    p.textSize(10);
    p.text(c.full, pos.x, pos.y + 34);
  }

  function drawPackets(p) {
    for (let i = packets.length - 1; i >= 0; i--) {
      const pkt = packets[i];
      const a = positions[pkt.from], b = positions[pkt.to];
      const x = p.lerp(a.x, b.x, pkt.progress);
      const y = p.lerp(a.y, b.y, pkt.progress);

      // Glow tail
      const tail = p.color(pkt.color);
      tail.setAlpha(70);
      p.stroke(tail);
      p.strokeWeight(8);
      const tx = p.lerp(a.x, b.x, Math.max(0, pkt.progress - 0.18));
      const ty = p.lerp(a.y, b.y, Math.max(0, pkt.progress - 0.18));
      p.line(tx, ty, x, y);

      // Head
      p.noStroke();
      p.fill(pkt.color);
      p.circle(x, y, 14);
      p.fill(255, 220);
      p.circle(x, y, 6);

      pkt.progress += pkt.speed;
      if (pkt.progress >= 1) {
        pulses[pkt.to] = 30;
        packets.splice(i, 1);
      }
    }
  }

  function drawActionBar(p) {
    actionButtons = [];
    const barY = p.height - 110;
    const barH = 100;

    p.noStroke();
    p.fill(15, 18, 26, 230);
    p.rect(0, barY, p.width, barH);
    p.stroke("#262b38");
    p.strokeWeight(1);
    p.line(0, barY, p.width, barY);

    // Label
    p.noStroke();
    p.fill("#9aa3b6");
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(11);
    p.text("TRY AN ACTION", 24, barY + 12);

    // Status / log line
    p.fill(255);
    p.textSize(14);
    p.text(logMessage, 24, barY + 30);

    // Buttons
    const total = ACTIONS.length;
    const gap = 12;
    const btnW = 150;
    const startX = p.width - (btnW * total + gap * (total - 1)) - 24;
    const btnY = barY + 56;
    for (let i = 0; i < ACTIONS.length; i++) {
      const a = ACTIONS[i];
      const bx = startX + i * (btnW + gap);
      const by = btnY;
      const hovered = p.mouseX > bx && p.mouseX < bx + btnW && p.mouseY > by && p.mouseY < by + 36;
      const isActive = activeAction && activeAction.id === a.id;

      p.noStroke();
      p.fill(isActive ? "#34d1bf" : (hovered ? "#262b38" : "#1b1f2a"));
      p.rect(bx, by, btnW, 36, 8);
      if (!isActive) {
        p.stroke("#262b38");
        p.noFill();
        p.rect(bx, by, btnW, 36, 8);
      }

      p.noStroke();
      p.fill(isActive ? "#0b0d12" : "#fff");
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(13);
      p.text(`${a.icon}  ${a.label}`, bx + btnW / 2, by + 18);

      actionButtons.push({ id: a.id, x: bx, y: by, w: btnW, h: 36 });
    }
  }

  function drawSelectedCard(p) {
    if (!selectedId) return;
    const c = COMPONENTS.find(x => x.id === selectedId);
    if (!c) return;
    const pos = positions[selectedId];
    if (!pos) return;

    const cardW = Math.min(280, p.width * 0.34);
    const cardH = 88;
    const compR = 56;          // component card half-extent
    const gap = 12;
    const safeTop = 50;        // keep clear of HUD chips + hint pill
    const safeBottom = p.height - 110 - 12;  // keep clear of action bar

    // Default to the right of the component, vertically centred
    let cx = pos.x + compR + gap;
    let cy = pos.y - cardH / 2;

    // If it would overflow the right edge, place it to the left instead
    if (cx + cardW > p.width - 20) {
      cx = pos.x - compR - gap - cardW;
    }
    // Clamp horizontally (final safety)
    cx = Math.max(20, Math.min(p.width - cardW - 20, cx));
    // Clamp vertically so it doesn't overlap the HUD chips or the action bar
    cy = Math.max(safeTop, Math.min(safeBottom - cardH, cy));

    // Soft connector line from component to card edge so the relationship is obvious
    p.stroke(c.color);
    p.strokeWeight(1.5);
    p.drawingContext.setLineDash([3, 4]);
    const connectorX = cx < pos.x ? cx + cardW : cx;
    p.line(pos.x, pos.y, connectorX, cy + cardH / 2);
    p.drawingContext.setLineDash([]);

    // Card background + border
    p.noStroke();
    p.fill(11, 13, 18, 240);
    p.rect(cx, cy, cardW, cardH, 12);
    p.stroke(c.color);
    p.strokeWeight(2);
    p.noFill();
    p.rect(cx, cy, cardW, cardH, 12);

    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);
    p.fill(c.color);
    p.textSize(10);
    p.text(c.full.toUpperCase(), cx + 14, cy + 12);
    p.fill(255);
    p.textSize(16);
    p.textStyle(p.BOLD);
    p.text(`${c.icon}  ${c.label}`, cx + 14, cy + 26);
    p.textStyle(p.NORMAL);
    p.fill("#cbd1e0");
    p.textSize(11);
    p.text(c.desc, cx + 14, cy + 50, cardW - 28, cardH - 50);
  }

  function reset() {
    packets = [];
    activeAction = null;
    actionStepIdx = 0;
    lastStepTime = 0;
    selectedId = null;
    pulses = {};
    logMessage = "Click a part to learn about it, or pick an action below";
  }

  return {
    title: "Inside Your Computer",
    desc: "Every computer — your phone, your laptop, the PS5 — is made of the same handful of parts. Tap a part to find out what it does, or pick an action like \"Play a Game\" and watch the data fly between them.",
    concepts: [
      "What's a CPU, RAM, GPU, SSD, and NIC?",
      "How a computer runs an app",
      "Why some files load fast (RAM) and others slow (network)",
      "The hardware behind every game and website"
    ],
    references: [
      { label: "Patterson & Hennessy — Computer Organization and Design (Elsevier)", url: "https://www.elsevier.com/books/computer-organization-and-design-risc-v-edition/patterson/978-0-12-820331-6" },
      { label: "Khan Academy — How computers work", url: "https://www.khanacademy.org/computing/computers-and-internet/xcae6f4a7ff015e7d:computers" },
      { label: "MDN — Storage, memory & the browser", url: "https://developer.mozilla.org/en-US/docs/Learn/Performance/Measuring_performance" },
      { label: "Crash Course Computer Science (PBS)", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo" }
    ],
    file: "inside-your-computer.js",
    code:
`// Computers do everything by passing data between parts.
// Here's what happens when you "Play a Game":

const playGame = [
  ["ssd", "ram", "Game loaded from storage into memory"],
  ["ram", "cpu", "CPU runs game logic & physics"],
  ["cpu", "gpu", "CPU sends draw commands to the GPU"],
  ["ram", "gpu", "GPU reads textures and draws the frame"]
];

// Each step sends a packet [from, to, what's happening].
// The CPU is the conductor — it orchestrates every transfer.`,
    setup(p) {
      layout(p);
      reset();
      p.background(11, 13, 18);
    },
    draw(p) {
      // Re-layout in case canvas resized
      layout(p);

      drawBackground(p);
      drawBuses(p);
      drawPackets(p);
      for (const c of COMPONENTS) drawComponent(p, c);
      drawSelectedCard(p);
      drawActionBar(p);

      // Step the active action forward
      if (activeAction && packets.length === 0 && p.millis() - lastStepTime > 350) {
        actionStepIdx++;
        lastStepTime = p.millis();
        runStep(p);
      }
    },
    onMousePressed(p) {
      const btn = actionAt(p.mouseX, p.mouseY);
      if (btn) { startAction(p, btn.id); return; }
      const c = compAt(p, p.mouseX, p.mouseY);
      if (c) { selectedId = c.id; pulses[c.id] = 30; return; }
      selectedId = null;
    },
    hud(p) {
      return [
        { label: "Packets", value: packets.length },
        { label: "Doing", value: activeAction ? activeAction.label : "idle" }
      ];
    },
    hint: "Click a part to learn • Pick an action below to see data flow",
    reset(p) {
      reset();
      p.background(11, 13, 18);
    }
  };
})();
