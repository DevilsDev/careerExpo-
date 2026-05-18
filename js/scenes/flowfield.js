/**
 * Flow Field Art
 * A generative art piece using Perlin noise to steer thousands of agents.
 * Mouse position influences the field. Click to regenerate.
 */
window.SceneFlowfield = (function () {
  const NUM_AGENTS = 1400;
  let agents = [];
  let zOff = 0;
  let palette = [];

  function randomPalette(p) {
    const sets = [
      ["#ff3b3b", "#ffd166", "#34d1bf", "#8a5cff"],
      ["#ff6f91", "#f9f871", "#00c2a8", "#2c73d2"],
      ["#f25f5c", "#ffe066", "#70c1b3", "#247ba0"],
      ["#ff8e72", "#ffd23f", "#06d6a0", "#118ab2"]
    ];
    return sets[Math.floor(p.random(sets.length))];
  }

  class Agent {
    constructor(p) {
      this.p = p;
      this.reset(true);
    }
    reset(initial = false) {
      this.x = this.p.random(this.p.width);
      this.y = this.p.random(this.p.height);
      this.life = initial ? this.p.random(0, 200) : 0;
      this.maxLife = this.p.random(140, 260);
      this.col = this.p.color(palette[Math.floor(this.p.random(palette.length))]);
      this.col.setAlpha(45);
    }
    step() {
      const scale = 0.0025;
      const mouseInfluence = this.p.dist(this.x, this.y, this.p.mouseX, this.p.mouseY);
      const pull = this.p.map(this.p.constrain(mouseInfluence, 0, 220), 0, 220, 0.8, 0);
      const angle =
        this.p.noise(this.x * scale, this.y * scale, zOff) * this.p.TWO_PI * 2
        + pull * Math.atan2(this.p.mouseY - this.y, this.p.mouseX - this.x);
      const speed = 1.4;
      const nx = this.x + Math.cos(angle) * speed;
      const ny = this.y + Math.sin(angle) * speed;

      this.p.stroke(this.col);
      this.p.strokeWeight(1.1);
      this.p.line(this.x, this.y, nx, ny);

      this.x = nx;
      this.y = ny;
      this.life++;

      if (this.life > this.maxLife || this.x < 0 || this.y < 0 || this.x > this.p.width || this.y > this.p.height) {
        this.reset();
      }
    }
  }

  return {
    title: "Flow Field Art",
    desc: "1,400 tiny agents are drifting across an invisible Perlin-noise field, painting it as they go. Move your mouse to pull them — click anywhere to regenerate with a new colour palette.",
    concepts: [
      "Perlin noise for organic motion",
      "Vector math & trigonometry",
      "Generative / algorithmic art",
      "Performance with 1000+ entities"
    ],
    file: "flowfield.js",
    code:
`function draw() {
  for (const a of agents) {
    const angle = noise(a.x * 0.0025, a.y * 0.0025, zOff) * TWO_PI * 2;
    const nx = a.x + cos(angle) * 1.4;
    const ny = a.y + sin(angle) * 1.4;
    stroke(a.col);
    line(a.x, a.y, nx, ny);
    a.x = nx; a.y = ny;
    if (++a.life > a.maxLife) reset(a);
  }
  zOff += 0.0015;
}`,
    setup(p) {
      palette = randomPalette(p);
      agents = [];
      for (let i = 0; i < NUM_AGENTS; i++) agents.push(new Agent(p));
      p.background(11, 13, 18);
    },
    draw(p) {
      // Slow fade instead of clearing — builds painterly layers
      p.noStroke();
      p.fill(11, 13, 18, 6);
      p.rect(0, 0, p.width, p.height);

      for (const a of agents) a.step();
      zOff += 0.0015;
    },
    onMousePressed(p) {
      palette = randomPalette(p);
      agents.forEach(a => a.reset());
      p.background(11, 13, 18);
    },
    hud(p) { return [{ label: "Agents", value: NUM_AGENTS }]; },
    hint: "Hover to steer • Click anywhere to regenerate",
    reset(p) {
      palette = randomPalette(p);
      agents.forEach(a => a.reset());
      p.background(11, 13, 18);
    }
  };
})();
