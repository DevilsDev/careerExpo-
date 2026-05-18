/**
 * Catch the Kiwi
 * A tiny game — falling kiwifruit (and a few bombs!) drop from the top.
 * Move the basket (mouse) to catch them. Demonstrates: game loops, state,
 * collision detection, sprite emoji, difficulty curves.
 */
window.SceneGame = (function () {
  let items = [];
  let basketX = 0;
  const BASKET_W = 110;
  const BASKET_H = 30;
  let score = 0;
  let lives = 3;
  let spawnEvery = 60;
  let frameCounter = 0;
  let gameOver = false;
  let highScore = Number(localStorage.getItem("nmit_p5_high") || 0);

  // Bomb-reaction state
  let sparks = [];        // explosion shrapnel
  let popups = [];        // floating "-1 ❤️" text
  let flashAlpha = 0;     // red full-screen flash, fades each frame
  let shakeFrames = 0;    // screen shake countdown
  let basketShakeUntil = 0; // frame number when basket stops shaking

  function spawn(p) {
    const isBomb = p.random() < 0.12;
    items.push({
      x: p.random(30, p.width - 30),
      y: -30,
      vy: p.random(2.2, 4.4) + score * 0.02,
      r: 22,
      kind: isBomb ? "bomb" : "kiwi",
      rot: p.random(p.TWO_PI),
      spin: p.random(-0.05, 0.05)
    });
  }

  function drawBasket(p) {
    p.push();
    // Wobble basket briefly after a bomb hit
    let shakeX = 0;
    if (frameCounter < basketShakeUntil) {
      const t = basketShakeUntil - frameCounter;
      shakeX = Math.sin(t * 0.9) * t * 0.4;
    }
    p.translate(basketX + shakeX, p.height - 40);
    p.noStroke();
    p.fill("#8b5a2b");
    p.rect(-BASKET_W / 2, 0, BASKET_W, BASKET_H, 6, 6, 14, 14);
    p.fill("#a47148");
    p.rect(-BASKET_W / 2, 0, BASKET_W, 6, 6, 6, 0, 0);
    p.stroke("#5a3a1c");
    p.strokeWeight(1.2);
    p.noFill();
    for (let i = -BASKET_W / 2 + 8; i < BASKET_W / 2; i += 10) {
      p.line(i, 4, i + 6, BASKET_H - 2);
    }
    p.pop();
  }

  function drawItem(p, it) {
    p.push();
    p.translate(it.x, it.y);
    p.rotate(it.rot);
    p.noStroke();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(34);
    p.text(it.kind === "kiwi" ? "🥝" : "💣", 0, 0);
    p.pop();
  }

  function resetGame() {
    items = [];
    score = 0;
    lives = 3;
    spawnEvery = 60;
    frameCounter = 0;
    gameOver = false;
    sparks = [];
    popups = [];
    flashAlpha = 0;
    shakeFrames = 0;
    basketShakeUntil = 0;
  }

  // Triggered when the basket catches a bomb — fireworks + flash + popup
  function explode(p, x, y) {
    flashAlpha = 180;
    shakeFrames = 14;
    basketShakeUntil = frameCounter + 30;
    // 26 shrapnel sparks spraying in all directions
    for (let i = 0; i < 26; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(2, 7);
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 60,
        col: p.random() < 0.5 ? "#ff3b3b" : (p.random() < 0.5 ? "#ffd166" : "#ff8e72"),
        size: p.random(3, 7)
      });
    }
    popups.push({ x, y: y - 10, vy: -1.2, life: 70, text: "-1 ❤️" });
  }

  function drawEffects(p) {
    // Update + draw shrapnel
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.vy += 0.18;        // gravity
      s.x += s.vx;
      s.y += s.vy;
      s.life--;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      const c = p.color(s.col);
      c.setAlpha(p.map(s.life, 0, 60, 0, 255));
      p.noStroke();
      p.fill(c);
      p.circle(s.x, s.y, s.size);
    }

    // Floating popups
    for (let i = popups.length - 1; i >= 0; i--) {
      const pp = popups[i];
      pp.y += pp.vy;
      pp.life--;
      if (pp.life <= 0) { popups.splice(i, 1); continue; }
      p.noStroke();
      p.fill(255, 59, 59, p.map(pp.life, 0, 70, 0, 255));
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(22);
      p.textStyle(p.BOLD);
      p.text(pp.text, pp.x, pp.y);
      p.textStyle(p.NORMAL);
    }

    // Red full-screen flash (fades fast)
    if (flashAlpha > 0) {
      p.noStroke();
      p.fill(255, 59, 59, flashAlpha);
      p.rect(0, 0, p.width, p.height);
      flashAlpha = Math.max(0, flashAlpha - 14);
    }
  }

  return {
    title: "Catch the Kiwi",
    desc: "Catch the falling kiwifruit with your basket — but watch out for bombs! Each kiwi is +1, each bomb costs a life. The game speeds up as you score. Classic arcade logic in pure JavaScript.",
    concepts: [
      "Game loop & frame-based timing",
      "Collision detection (AABB)",
      "State machines (playing/over)",
      "localStorage for high scores"
    ],
    references: [
      { label: "MDN — Game development", url: "https://developer.mozilla.org/en-US/docs/Games" },
      { label: "MDN — 2D collision detection", url: "https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection" },
      { label: "MDN — Window.localStorage", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" },
      { label: "p5.js frameRate & frameCount", url: "https://p5js.org/reference/#/p5/frameRate" }
    ],
    file: "game.js",
    code:
`function draw() {
  background(11, 13, 18);
  if (++frameCounter % spawnEvery === 0) spawn();

  for (const it of items) {
    it.y += it.vy;
    drawItem(it);
    if (caughtByBasket(it)) {
      it.kind === "kiwi" ? score++ : lives--;
      it.dead = true;
    } else if (it.y > height) {
      if (it.kind === "kiwi") lives--;
      it.dead = true;
    }
  }
  items = items.filter(i => !i.dead);
  if (lives <= 0) gameOver = true;
}`,
    setup(p, h) {
      basketX = p.width / 2;
      resetGame();
    },
    draw(p) {
      // Screen shake: translate the whole frame by a small random offset
      p.push();
      if (shakeFrames > 0) {
        const mag = shakeFrames * 0.8;
        p.translate(p.random(-mag, mag), p.random(-mag, mag));
        shakeFrames--;
      }

      // gradient background
      p.noStroke();
      for (let y = 0; y < p.height; y += 4) {
        const t = y / p.height;
        p.fill(p.lerpColor(p.color(11, 13, 18), p.color(20, 30, 50), t));
        p.rect(0, y, p.width, 4);
      }

      // stars
      p.fill(255, 90);
      for (let i = 0; i < 40; i++) {
        const sx = (i * 73 + p.frameCount * 0.2) % p.width;
        const sy = (i * 137) % p.height;
        p.circle(sx, sy, 1.4);
      }

      // basket follows mouse smoothly
      const targetX = p.constrain(p.mouseX, BASKET_W / 2, p.width - BASKET_W / 2);
      basketX += (targetX - basketX) * 0.22;

      if (!gameOver) {
        frameCounter++;
        if (frameCounter % Math.max(20, spawnEvery) === 0) spawn(p);
        // gradually speed up
        if (frameCounter % 300 === 0 && spawnEvery > 24) spawnEvery -= 3;
      }

      for (const it of items) {
        it.y += it.vy;
        it.rot += it.spin;
        drawItem(p, it);

        const within = it.x > basketX - BASKET_W / 2 && it.x < basketX + BASKET_W / 2;
        const inBasket = within && it.y > p.height - 56 && it.y < p.height - 10;

        if (inBasket && !gameOver) {
          if (it.kind === "kiwi") {
            score++;
            if (score > highScore) {
              highScore = score;
              try { localStorage.setItem("nmit_p5_high", String(highScore)); } catch (e) {}
            }
          } else {
            // BOOM — bomb hit the basket
            lives--;
            explode(p, it.x, p.height - 35);
          }
          it.dead = true;
        } else if (it.y > p.height + 30) {
          if (it.kind === "kiwi") lives--;
          it.dead = true;
        }
      }
      items = items.filter(i => !i.dead);
      if (lives <= 0) gameOver = true;

      drawBasket(p);

      // Bomb sparks, popups, red flash — drawn after game world but inside the shake transform
      drawEffects(p);

      // End the screen-shake transform — UI overlays below are NOT shaken
      p.pop();

      // Score / Lives / Best are shown in the HUD chips (top-left); no in-canvas duplicate needed.

      if (gameOver) {
        p.fill(0, 180);
        p.rect(0, 0, p.width, p.height);
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(46);
        p.text("Game Over", p.width / 2, p.height / 2 - 30);
        p.textSize(20);
        p.fill("#34d1bf");
        p.text(`Final Score: ${score}`, p.width / 2, p.height / 2 + 16);
        p.fill(255);
        p.textSize(14);
        p.text("Click to play again", p.width / 2, p.height / 2 + 50);
      }
    },
    onMousePressed(p) {
      if (gameOver) resetGame();
    },
    hud(p) {
      return [
        { label: "Score", value: score },
        { label: "Lives", value: lives },
        { label: "Best", value: highScore }
      ];
    },
    hint: "Move your mouse to slide the basket • Click to restart after game over",
    reset(p) { resetGame(); }
  };
})();
