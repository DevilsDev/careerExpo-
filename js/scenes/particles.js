/**
 * Particle Playground
 * Move the mouse to spawn colourful particles that obey gravity, drift, and fade.
 * Demonstrates: classes, arrays, vectors, colour, frame loops.
 */
window.SceneParticles = (function () {
  let particles = [];
  let pInst;
  let hue = 0;

  class Particle {
    constructor(x, y, vx, vy, col) {
      this.pos = pInst.createVector(x, y);
      this.vel = pInst.createVector(vx, vy);
      this.acc = pInst.createVector(0, 0.08);
      this.life = 255;
      this.size = pInst.random(6, 16);
      this.col = col;
    }
    update() {
      this.vel.add(this.acc);
      this.vel.mult(0.99);
      this.pos.add(this.vel);
      this.life -= 2.4;
      if (this.pos.y > pInst.height - this.size / 2) {
        this.pos.y = pInst.height - this.size / 2;
        this.vel.y *= -0.55;
        this.vel.x *= 0.9;
      }
    }
    draw() {
      pInst.noStroke();
      const c = pInst.color(this.col);
      c.setAlpha(this.life);
      pInst.fill(c);
      pInst.circle(this.pos.x, this.pos.y, this.size);
    }
    dead() { return this.life <= 0; }
  }

  function spawn(p, x, y) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(0.5, 3);
      // p5's HSL parser requires integer hue and a positive value (it returns white otherwise)
      const h = ((Math.floor(hue + p.random(-20, 20)) % 360) + 360) % 360;
      const col = p.color(`hsl(${h}, 85%, 60%)`);
      particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 1,
        col
      ));
    }
    hue = (hue + 4) % 360;
  }

  return {
    title: "Particle Playground",
    desc: "Move your mouse (or finger) across the canvas to spawn colourful particles. They obey gravity, bounce off the ground, and fade away — a tiny physics engine in 60 lines of code.",
    concepts: [
      "Object-oriented programming with classes",
      "Vectors for position, velocity, acceleration",
      "Arrays & the game loop",
      "Colour theory using HSL"
    ],
    references: [
      { label: "p5.Vector reference", url: "https://p5js.org/reference/#/p5.Vector" },
      { label: "Daniel Shiffman — The Nature of Code, Ch.2 Forces", url: "https://natureofcode.com/forces/" },
      { label: "MDN — JavaScript classes", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes" },
      { label: "MDN — HSL colour notation", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl" }
    ],
    file: "particles.js",
    code:
`class Particle {
  constructor(x, y, vx, vy, col) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx, vy);
    this.acc = createVector(0, 0.08); // gravity
    this.life = 255;
    this.col = col;
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.life -= 2.4;
  }
  draw() {
    noStroke();
    fill(this.col);
    circle(this.pos.x, this.pos.y, 12);
  }
}

function draw() {
  background(11, 13, 18, 40);
  particles.forEach(p => { p.update(); p.draw(); });
  particles = particles.filter(p => p.life > 0);
}

function mouseMoved() {
  particles.push(new Particle(mouseX, mouseY, 0, -1, '#ff3b3b'));
}`,
    setup(p) {
      pInst = p;
      particles = [];
      hue = 0;
      p.background(11, 13, 18);
      // Demo burst at center
      for (let i = 0; i < 80; i++) spawn(p, p.width / 2, p.height / 2);
    },
    draw(p) {
      pInst = p;
      p.background(11, 13, 18, 38);
      for (const part of particles) { part.update(); part.draw(); }
      particles = particles.filter(part => !part.dead());

      if (p.mouseIsPressed) {
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          spawn(p, p.mouseX, p.mouseY);
        }
      }
    },
    onMouseMoved(p) {
      if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
        spawn(p, p.mouseX, p.mouseY);
      }
    },
    onMousePressed(p) {
      for (let i = 0; i < 30; i++) spawn(p, p.mouseX, p.mouseY);
    },
    hud() { return [{ label: "Particles", value: particles.length }]; },
    hint: "Move your mouse or tap — click for fireworks!",
    reset(p) { particles = []; }
  };
})();
