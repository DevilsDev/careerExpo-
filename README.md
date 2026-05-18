# NMIT BIT × p5.js — Careers Expo Demo

An interactive booth demo built for the **NMIT careers expo**, designed to give high-school students a hands-on taste of what first-year **Bachelor of Information Technology** students learn — using [p5.js](https://p5js.org/), the same creative-coding library used in NZ design studios, museums, and tech classrooms worldwide.

## What it shows

Four interactive demos, each highlighting different programming concepts:

| Demo | Concepts Demonstrated |
| --- | --- |
| **Particle Playground** | Classes, vectors, physics, mouse interaction |
| **Flow Field Art** | Perlin noise, generative art, performance with 1,400+ entities |
| **Catch the Kiwi** | Game loop, collision detection, state machines, localStorage |
| **Rainbow Painter** | Drawing API, HSL colour theory, keyboard input, saving images |

Every demo has a **"View the Code"** button — students see the actual JavaScript powering what they're playing with.

## Run it

No build step. No npm. No server required.

```bash
# Option A — just open it
start index.html        # Windows
open  index.html        # macOS

# Option B — serve locally (recommended for the booth, avoids any file:// quirks)
python -m http.server 8000
# then visit http://localhost:8000
```

For the careers expo, project on a TV / use a touchscreen — it's all mouse + touch friendly.

## Project structure

```
careerExpo-/
├── index.html              # Single-page entry
├── css/styles.css          # Dark theme, NMIT red + teal accents
├── js/
│   ├── main.js             # Scene manager, UI wiring, p5 instance
│   └── scenes/
│       ├── particles.js    # Physics particles
│       ├── flowfield.js    # Perlin-noise generative art
│       ├── game.js         # Catch-the-kiwi mini game
│       └── painter.js      # Drawing canvas
└── README.md
```

## Why this represents NZ tech industry best practice

Things our first-year BIT students learn that this demo demonstrates:

- **Modular code** — each scene is a self-contained module with a small lifecycle contract
- **Vanilla JavaScript first** — understand the platform before reaching for frameworks
- **Progressive enhancement** — works on any modern browser, mobile, tablet, projector
- **Accessibility** — semantic HTML, ARIA labels, keyboard support, sufficient contrast
- **Version control** — every line shipped via git, just like at Xero, Trade Me, Datacom, and Rocket Lab
- **Read the docs** — [p5.js](https://p5js.org/reference) reference is the source of truth

## Want to build this yourself?

Come study **Bachelor of Information Technology** at **NMIT — Te Pukenga, Nelson Marlborough**.

You'll learn JavaScript, Python, C#, databases, design, agile delivery, and how to ship real software with real teams.

---

Built for the NMIT careers expo. p5.js is © its [contributors](https://p5js.org/about/), MIT licensed.
