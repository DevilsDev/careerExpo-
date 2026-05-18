/**
 * Particle Playground
 * Move the mouse to spawn colourful particles that obey gravity, drift, and fade.
 * Demonstrates: classes, arrays, vectors, colour, frame loops.
 */
window.SceneParticles = (function () {
  let particles = [];
  let host;
  let hue = 0;

  class Particle {
    constructor(x, y, vx, vy, col) {
      this.pos = host.createVector(x, y);
      this.vel = host.createVector(vx, vy);
      this.acc = host.createVector(0, 0.08);
      this.life = 255;
      this.size = host.random(6, 16);
      this.col = col;
    }
    update() {
      this.vel.add(this.acc);
      this.vel.mult(0.99);
      this.pos.add(this.vel);
      this.life -= 2.4;
      if (this.pos.y > host.height - this.size / 2) {
        this.pos.y = host.height - this.size / 2;
        this.vel.y *= -0.55;
        this.vel.x *= 0.9;
      }
    }
    draw() {
      host.noStroke();
      const c = host.color(this.col);
      c.setAlpha(this.life);
      host.fill(c);
      host.circle(this.pos.x, this.pos.y, this.size);
    }
    dead() { return this.life <= 0; }
  }

  function spawn(p, x, y) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(0.5, 3);
      const col = p.color(`hsl(${(hue + p.random(-20, 20)) % 360}, 85%, 60%)`);
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
    setup(p, h) {
      host = h;
      particles = [];
      hue = 0;
      // Demo burst at center
      for (let i = 0; i < 80; i++) spawn(p, p.width / 2, p.height / 2);
    },
    draw(p) {
      p.background(11, 13, 18, 38);
      for (const part of particles) { part.update(); part.draw(); }
      particles = particles.filter(part => !part.dead());

      if (p.mouseIsPressed || (p.movedX !== 0 || p.movedY !== 0)) {
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
