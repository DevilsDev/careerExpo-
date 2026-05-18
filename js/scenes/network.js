/**
 * Packet Network
 * Interactive network of nodes (routers / hosts) routing packets.
 * Click any two nodes to send a packet from A to B — it finds the
 * shortest path and animates hop-by-hop. Random background traffic
 * keeps things lively. Some packets drop (red flash) to simulate
 * real-world packet loss.
 */
window.SceneNetwork = (function () {
  let nodes = [];   // { id, x, y, label, kind }
  let edges = [];   // { a, b, weight }
  let adj = {};     // id -> [neighbour ids]
  let packets = []; // active in-flight packets

  let selected = null; // first node user clicked
  let sent = 0, delivered = 0, dropped = 0;
  let lastSpawn = 0;

  function buildTopology(p) {
    nodes = []; edges = []; adj = {}; packets = [];
    selected = null; sent = 0; delivered = 0; dropped = 0;

    const layout = [
      { id: 0, kind: "host",   label: "PC-1",  x: 0.08, y: 0.20 },
      { id: 1, kind: "host",   label: "PC-2",  x: 0.08, y: 0.80 },
      { id: 2, kind: "router", label: "R1",    x: 0.30, y: 0.50 },
      { id: 3, kind: "router", label: "R2",    x: 0.50, y: 0.25 },
      { id: 4, kind: "router", label: "R3",    x: 0.50, y: 0.75 },
      { id: 5, kind: "router", label: "R4",    x: 0.72, y: 0.50 },
      { id: 6, kind: "server", label: "WEB",   x: 0.92, y: 0.25 },
      { id: 7, kind: "server", label: "DB",    x: 0.92, y: 0.75 }
    ];
    for (const n of layout) {
      nodes.push({
        id: n.id,
        kind: n.kind,
        label: n.label,
        x: n.x * p.width,
        y: n.y * p.height
      });
      adj[n.id] = [];
    }

    const links = [
      [0, 2], [1, 2], [2, 3], [2, 4],
      [3, 4], [3, 5], [4, 5], [5, 6], [5, 7], [3, 6], [4, 7]
    ];
    for (const [a, b] of links) {
      const dx = nodes[a].x - nodes[b].x;
      const dy = nodes[a].y - nodes[b].y;
      const w = Math.round(Math.hypot(dx, dy) / 50);
      edges.push({ a, b, weight: w });
      adj[a].push(b);
      adj[b].push(a);
    }
  }

  // BFS shortest-hop path
  function shortestPath(src, dst) {
    if (src === dst) return [src];
    const prev = { [src]: null };
    const queue = [src];
    while (queue.length) {
      const cur = queue.shift();
      if (cur === dst) {
        const path = [];
        let n = dst;
        while (n !== null) { path.unshift(n); n = prev[n]; }
        return path;
      }
      for (const nb of adj[cur]) {
        if (!(nb in prev)) { prev[nb] = cur; queue.push(nb); }
      }
    }
    return null;
  }

  function sendPacket(p, src, dst, kind = "DATA") {
    const path = shortestPath(src, dst);
    if (!path || path.length < 2) return;
    const colByKind = {
      "SYN":     "#ffd166",
      "SYN-ACK": "#8a5cff",
      "ACK":     "#34d1bf",
      "DATA":    "#ff3b3b"
    };
    packets.push({
      path,
      kind,
      hop: 0,
      progress: 0,
      speed: 0.025 + p.random(0, 0.015),
      col: colByKind[kind] || "#ff3b3b",
      doomed: p.random() < 0.08, // 8% drop rate
      dropAt: 0
    });
    if (packets[packets.length - 1].doomed) {
      packets[packets.length - 1].dropAt = Math.floor(p.random(0, path.length - 1));
    }
    sent++;
  }

  function nodeAt(p, x, y) {
    for (const n of nodes) {
      if (p.dist(x, y, n.x, n.y) < 28) return n;
    }
    return null;
  }

  function nodeFill(n) {
    if (n.kind === "host") return "#34d1bf";
    if (n.kind === "server") return "#ff3b3b";
    return "#ffd166";
  }

  function drawNetwork(p) {
    // Edges
    for (const e of edges) {
      const a = nodes[e.a], b = nodes[e.b];
      p.stroke("#262b38");
      p.strokeWeight(2);
      p.line(a.x, a.y, b.x, b.y);
      // weight label
      p.noStroke();
      p.fill("#5a6178");
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(10);
      p.text(e.weight, (a.x + b.x) / 2, (a.y + b.y) / 2 - 10);
    }

    // Packets
    for (const pkt of packets) {
      const a = nodes[pkt.path[pkt.hop]];
      const b = nodes[pkt.path[pkt.hop + 1]];
      if (!b) continue;
      const x = p.lerp(a.x, b.x, pkt.progress);
      const y = p.lerp(a.y, b.y, pkt.progress);
      // tail
      p.noStroke();
      const tail = p.color(pkt.col);
      tail.setAlpha(80);
      p.fill(tail);
      const tx = p.lerp(a.x, b.x, Math.max(0, pkt.progress - 0.15));
      const ty = p.lerp(a.y, b.y, Math.max(0, pkt.progress - 0.15));
      p.line ? null : null;
      p.stroke(tail);
      p.strokeWeight(4);
      p.line(tx, ty, x, y);
      p.noStroke();
      // head
      p.fill(pkt.col);
      p.circle(x, y, 12);
      // label
      p.fill(11, 13, 18);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(8);
      p.textStyle(p.BOLD);
      p.text(pkt.kind, x, y);
      p.textStyle(p.NORMAL);
    }

    // Drop flashes
    for (const flash of packets.filter(p => p._flashing)) {
      const n = nodes[flash.path[flash.dropAt]];
      p.noFill();
      p.stroke(255, 59, 59, flash._flashing);
      p.strokeWeight(2);
      p.circle(n.x, n.y, 50 + (60 - flash._flashing));
    }

    // Nodes
    for (const n of nodes) {
      const isSel = selected && selected.id === n.id;
      p.noStroke();
      if (isSel) {
        p.fill(255, 255, 255, 40);
        p.circle(n.x, n.y, 56);
      }
      p.fill(nodeFill(n));
      p.circle(n.x, n.y, 36);
      p.fill(11, 13, 18);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(10);
      p.textStyle(p.BOLD);
      p.text(n.label, n.x, n.y);
      p.textStyle(p.NORMAL);
      // kind label below
      p.fill("#9aa3b6");
      p.textSize(9);
      p.text(n.kind.toUpperCase(), n.x, n.y + 26);
    }
  }

  function step(p) {
    for (let i = packets.length - 1; i >= 0; i--) {
      const pkt = packets[i];
      if (pkt._flashing) { pkt._flashing -= 4; if (pkt._flashing <= 0) packets.splice(i, 1); continue; }
      pkt.progress += pkt.speed;
      if (pkt.progress >= 1) {
        pkt.hop++;
        pkt.progress = 0;
        if (pkt.doomed && pkt.hop === pkt.dropAt) {
          pkt._flashing = 60;
          dropped++;
          continue;
        }
        if (pkt.hop >= pkt.path.length - 1) {
          delivered++;
          // RFC 793 three-way handshake: SYN -> SYN-ACK -> ACK
          if (pkt.kind === "SYN") {
            sendPacket(p, pkt.path[pkt.path.length - 1], pkt.path[0], "SYN-ACK");
          } else if (pkt.kind === "SYN-ACK") {
            sendPacket(p, pkt.path[pkt.path.length - 1], pkt.path[0], "ACK");
          }
          packets.splice(i, 1);
        }
      }
    }
  }

  return {
    title: "Packet Network",
    desc: "An eight-node network of PCs, routers, and servers. Click any two nodes to send a packet — it finds the shortest route via BFS, then triggers the full TCP 3-way handshake (SYN → SYN-ACK → ACK, per RFC 793). Background traffic keeps the wires busy; red flashes are dropped packets.",
    concepts: [
      "Graph data structures & adjacency lists",
      "Shortest-path routing (BFS)",
      "TCP 3-way handshake (SYN / SYN-ACK / ACK)",
      "Packet loss & retransmission"
    ],
    references: [
      { label: "RFC 793 — Transmission Control Protocol", url: "https://www.rfc-editor.org/rfc/rfc793" },
      { label: "RFC 9293 — TCP (updated 2022)", url: "https://www.rfc-editor.org/rfc/rfc9293" },
      { label: "Tanenbaum & Wetherall — Computer Networks (Pearson)", url: "https://www.pearson.com/en-us/subject-catalog/p/computer-networks/P200000003188" },
      { label: "MDN — Breadth-first search & graphs", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects" },
      { label: "How TCP works (Cloudflare Learning)", url: "https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/" }
    ],
    file: "network.js",
    code:
`// Breadth-first shortest path between two nodes
function shortestPath(src, dst) {
  const prev = { [src]: null };
  const queue = [src];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === dst) {
      const path = [];
      for (let n = dst; n !== null; n = prev[n]) path.unshift(n);
      return path;
    }
    for (const nb of adj[cur]) {
      if (!(nb in prev)) { prev[nb] = cur; queue.push(nb); }
    }
  }
}`,
    setup(p) {
      buildTopology(p);
      lastSpawn = 0;
      p.background(11, 13, 18);
    },
    draw(p) {
      // background gradient
      p.noStroke();
      for (let y = 0; y < p.height; y += 4) {
        const t = y / p.height;
        p.fill(p.lerpColor(p.color(11, 13, 18), p.color(15, 22, 35), t));
        p.rect(0, y, p.width, 4);
      }

      // Background traffic — spawn a random packet occasionally
      if (p.frameCount - lastSpawn > 70) {
        const src = nodes[Math.floor(p.random(nodes.length))].id;
        let dst = nodes[Math.floor(p.random(nodes.length))].id;
        if (dst !== src) sendPacket(p, src, dst, "DATA");
        lastSpawn = p.frameCount;
      }

      step(p);
      drawNetwork(p);

      // legend
      const lx = 18, ly = p.height - 86;
      p.noStroke();
      p.fill(0, 130);
      p.rect(lx - 6, ly - 6, 230, 80, 8);
      const legend = [
        { c: "#34d1bf", t: "Host (PC)" },
        { c: "#ffd166", t: "Router" },
        { c: "#ff3b3b", t: "Server" }
      ];
      for (let i = 0; i < legend.length; i++) {
        p.fill(legend[i].c);
        p.circle(lx + 8, ly + 6 + i * 22, 10);
        p.fill(255);
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(11);
        p.text(legend[i].t, lx + 22, ly + 6 + i * 22);
      }

      // instruction
      p.fill("#9aa3b6");
      p.textAlign(p.CENTER, p.BOTTOM);
      p.textSize(11);
      const msg = selected
        ? `Selected ${selected.label} — click another node to send a SYN packet`
        : "Click a node to start • Click two to send a packet • Click empty space to clear";
      p.text(msg, p.width / 2, p.height - 10);
    },
    onMousePressed(p) {
      const hit = nodeAt(p, p.mouseX, p.mouseY);
      if (!hit) { selected = null; return; }
      if (!selected) { selected = hit; return; }
      if (selected.id !== hit.id) {
        sendPacket(p, selected.id, hit.id, "SYN");
      }
      selected = null;
    },
    onKeyPressed(p) {
      if (p.key === ' ') {
        // burst of background traffic
        for (let i = 0; i < 6; i++) {
          const a = nodes[Math.floor(p.random(nodes.length))].id;
          let b = nodes[Math.floor(p.random(nodes.length))].id;
          if (b !== a) sendPacket(p, a, b, "DATA");
        }
      }
    },
    hud(p) {
      return [
        { label: "Sent", value: sent },
        { label: "OK", value: delivered },
        { label: "Dropped", value: dropped }
      ];
    },
    hint: "Click two nodes to send a packet • Spacebar = traffic burst",
    reset(p) {
      buildTopology(p);
      lastSpawn = 0;
      p.background(11, 13, 18);
    }
  };
})();
