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
    p.translate(basketX, p.height - 40);
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
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(34);
    p.text(it.kind === "kiwi" ? "🥝" : "💣", 0, 0);
    p.pop();
  }

  function hit(it) {
    const top = items[0] ? null : null;
    const basketTop = -1;
    const within = it.x > basketX - BASKET_W / 2 && it.x < basketX + BASKET_W / 2;
    return within && it.y > arguments[1].height - 56 && it.y < arguments[1].height - 10;
  }

  function resetGame() {
    items = [];
    score = 0;
    lives = 3;
    spawnEvery = 60;
    frameCounter = 0;
    gameOver = false;
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
            lives--;
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

      // UI overlay
      p.noStroke();
      p.fill(255);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(16);
      p.text(`Score: ${score}`, 16, 14);
      p.text(`Lives: ${"❤️".repeat(Math.max(0, lives))}`, 16, 36);
      p.textAlign(p.RIGHT, p.TOP);
      p.text(`High: ${highScore}`, p.width - 16, 14);

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
