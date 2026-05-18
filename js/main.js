/**
 * NMIT × p5.js — Scene Manager
 *
 * Wires the four interactive demos to a single p5 instance, manages the
 * info panel, code viewer, HUD chips, FPS, and the tab navigation.
 *
 * Each scene module exposes a small lifecycle:
 *   { title, desc, concepts[], file, code, hint,
 *     setup(p, host), draw(p), reset(p),
 *     onMousePressed(p)?, onMouseMoved(p)?, onKeyPressed(p)?,
 *     hud(p)? -> [{ label, value }] }
 */
(function () {
  const SCENES = {
    particles: window.SceneParticles,
    flowfield: window.SceneFlowfield,
    game: window.SceneGame,
    painter: window.ScenePainter,
    cpu: window.SceneCPU,
    network: window.SceneNetwork
  };

  let current = "particles";
  let p5Instance = null;

  const host = document.getElementById("canvas-host");
  const hintEl = document.getElementById("canvas-hint");
  const hudEl = document.getElementById("hud");
  const titleEl = document.getElementById("scene-title");
  const descEl = document.getElementById("scene-desc");
  const conceptsEl = document.getElementById("concept-list");
  const refsEl = document.getElementById("ref-list");
  const codeBtn = document.getElementById("code-btn");
  const resetBtn = document.getElementById("reset-btn");
  const codePanel = document.getElementById("code-panel");
  const codeBlock = document.getElementById("code-block");
  const codeFile = document.getElementById("code-file");
  const fpsEl = document.getElementById("fps");
  const tabs = document.querySelectorAll(".tab");

  function applyMeta(scene) {
    titleEl.textContent = scene.title;
    descEl.textContent = scene.desc;
    conceptsEl.innerHTML = "";
    for (const c of scene.concepts) {
      const li = document.createElement("li");
      li.textContent = c;
      conceptsEl.appendChild(li);
    }
    refsEl.innerHTML = "";
    const refs = scene.references || [];
    for (const r of refs) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = r.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = r.label;
      li.appendChild(a);
      refsEl.appendChild(li);
    }
    codeBlock.textContent = scene.code;
    codeFile.textContent = scene.file;
    hintEl.textContent = scene.hint || "";
  }

  function updateHud(scene, p) {
    if (!scene.hud) { hudEl.innerHTML = ""; return; }
    const items = scene.hud(p) || [];
    hudEl.innerHTML = items
      .map(i => `<span class="chip">${i.label}<strong>${i.value}</strong></span>`)
      .join("");
  }

  function selectScene(name) {
    if (!SCENES[name]) return;
    current = name;
    tabs.forEach(t => t.classList.toggle("is-active", t.dataset.scene === name));
    const scene = SCENES[name];
    applyMeta(scene);
    if (p5Instance) {
      // resize-aware re-init of the scene
      scene.setup(p5Instance, host);
    }
  }

  // p5 sketch in instance mode so we don't pollute globals
  const sketch = (p) => {
    let lastFpsUpdate = 0;

    function dims() {
      const rect = host.getBoundingClientRect();
      return {
        w: Math.max(320, Math.floor(rect.width) || 800),
        h: Math.max(540, Math.floor(rect.height) || 540)
      };
    }

    function fitCanvas() {
      const { w, h } = dims();
      p.resizeCanvas(w, h);
      const scene = SCENES[current];
      if (scene && scene.setup) scene.setup(p, host);
    }

    p.setup = function () {
      const { w, h } = dims();
      const c = p.createCanvas(w, h);
      c.parent(host);
      p.frameRate(60);
      SCENES[current].setup(p, host);
    };

    p.draw = function () {
      const scene = SCENES[current];
      scene.draw(p);
      updateHud(scene, p);

      if (p.millis() - lastFpsUpdate > 500) {
        fpsEl.textContent = Math.round(p.frameRate());
        lastFpsUpdate = p.millis();
      }
    };

    p.mousePressed = () => {
      const s = SCENES[current];
      if (s.onMousePressed) s.onMousePressed(p);
    };
    p.mouseMoved = () => {
      const s = SCENES[current];
      if (s.onMouseMoved) s.onMouseMoved(p);
    };
    p.keyPressed = () => {
      const s = SCENES[current];
      if (s.onKeyPressed) s.onKeyPressed(p);
    };
    p.windowResized = fitCanvas;
  };

  // --- UI wiring ---
  tabs.forEach(tab => {
    tab.addEventListener("click", () => selectScene(tab.dataset.scene));
  });

  resetBtn.addEventListener("click", () => {
    const scene = SCENES[current];
    if (scene.reset && p5Instance) scene.reset(p5Instance);
  });

  codeBtn.addEventListener("click", () => {
    const hidden = codePanel.hasAttribute("hidden");
    if (hidden) {
      codePanel.removeAttribute("hidden");
      codeBtn.setAttribute("aria-expanded", "true");
      codeBtn.textContent = "Hide the Code";
      // Scroll the revealed code into view inside the side panel
      requestAnimationFrame(() => {
        codePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } else {
      codePanel.setAttribute("hidden", "");
      codeBtn.setAttribute("aria-expanded", "false");
      codeBtn.textContent = "View the Code";
    }
  });

  // Apply initial metadata and boot p5
  applyMeta(SCENES[current]);
  p5Instance = new p5(sketch);
  window.__nmitP5 = p5Instance; // handy for tinkering from devtools
})();
