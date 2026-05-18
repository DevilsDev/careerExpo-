/**
 * Rainbow Painter
 * Draw with a smooth rainbow brush that varies with speed.
 * Press number keys 1–4 to swap brushes, C to clear, S to save PNG.
 */
window.ScenePainter = (function () {
  let prevX = null, prevY = null;
  let hue = 0;
  let brush = 0; // 0=ribbon, 1=dots, 2=sparkle, 3=calligraphy
  const brushes = ["Ribbon", "Bubbles", "Sparkle", "Calligraphy"];
  let strokeCount = 0;
  let savedAt = 0;

  function brushDraw(p, x, y, px, py) {
    const dx = x - px, dy = y - py;
    const speed = Math.hypot(dx, dy);

    switch (brush) {
      case 0: { // ribbon
        const w = p.constrain(20 - speed * 0.4, 2, 22);
        p.stroke(`hsl(${hue}, 90%, 60%)`);
        p.strokeWeight(w);
        p.strokeCap(p.ROUND);
        p.line(px, py, x, y);
        break;
      }
      case 1: { // bubbles
        p.noStroke();
        for (let i = 0; i < 4; i++) {
          const t = i / 4;
          const bx = p.lerp(px, x, t) + p.random(-6, 6);
          const by = p.lerp(py, y, t) + p.random(-6, 6);
          const col = p.color(`hsl(${(hue + i * 12) % 360}, 80%, 65%)`);
          col.setAlpha(150);
          p.fill(col);
          p.circle(bx, by, p.random(6, 18));
        }
        break;
      }
      case 2: { // sparkle
        p.noStroke();
        for (let i = 0; i < 6; i++) {
          const ang = p.random(p.TWO_PI);
          const r = p.random(2, 30);
          const sx = x + Math.cos(ang) * r;
          const sy = y + Math.sin(ang) * r;
          const col = p.color(`hsl(${(hue + i * 20) % 360}, 100%, 70%)`);
          col.setAlpha(180);
          p.fill(col);
          p.circle(sx, sy, p.random(2, 5));
        }
        // bright core
        p.fill(255, 230);
        p.circle(x, y, 4);
        break;
      }
      case 3: { // calligraphy
        const w = p.constrain(30 - speed * 0.7, 3, 30);
        p.push();
        p.translate(x, y);
        const ang = Math.atan2(dy, dx);
        p.rotate(ang - Math.PI / 4);
        p.noStroke();
        p.fill(`hsl(${hue}, 80%, 55%)`);
        p.rect(-w / 2, -2, w, 4, 2);
        p.pop();
        break;
      }
    }
  }

  function clearCanvas(p) {
    p.background(11, 13, 18);
    // subtle grid backdrop so blank canvas looks intentional
    p.stroke(255, 8);
    p.strokeWeight(1);
    for (let x = 0; x < p.width; x += 40) p.line(x, 0, x, p.height);
    for (let y = 0; y < p.height; y += 40) p.line(0, y, p.width, y);
  }

  return {
    title: "Rainbow Painter",
    desc: "A creative coding canvas you control. Drag to paint with a smooth rainbow brush — try the four brush styles, save your masterpiece, or wipe and start fresh. The kind of project our first-year students ship in week three.",
    concepts: [
      "Mouse / touch event handling",
      "HSL colour cycling for rainbows",
      "Saving canvas as PNG (saveCanvas)",
      "Keyboard shortcuts & UI state"
    ],
    file: "painter.js",
    code:
`function draw() {
  if (mouseIsPressed && prevX !== null) {
    stroke(\`hsl(\${hue}, 90%, 60%)\`);
    strokeWeight(8);
    line(prevX, prevY, mouseX, mouseY);
    hue = (hue + 2) % 360;
  }
  prevX = mouseX; prevY = mouseY;
}

function keyPressed() {
  if (key === 'c' || key === 'C') background(0);
  if (key === 's' || key === 'S') saveCanvas('art', 'png');
}`,
    setup(p) {
      clearCanvas(p);
      prevX = null;
      prevY = null;
      hue = 0;
      strokeCount = 0;
    },
    draw(p) {
      if (p.mouseIsPressed && p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height) {
        if (prevX !== null) {
          brushDraw(p, p.mouseX, p.mouseY, prevX, prevY);
          hue = (hue + 2) % 360;
          strokeCount++;
        }
        prevX = p.mouseX;
        prevY = p.mouseY;
      } else {
        prevX = null;
        prevY = null;
      }

      // Brush badge in corner
      p.noStroke();
      p.fill(0, 150);
      p.rect(p.width - 180, p.height - 38, 168, 26, 6);
      p.fill(255);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(12);
      p.text(`Brush ${brush + 1}/4: ${brushes[brush]}`, p.width - 170, p.height - 25);

      if (savedAt && p.millis() - savedAt < 1500) {
        p.fill(52, 209, 191, 230);
        p.rect(p.width / 2 - 90, 18, 180, 30, 8);
        p.fill(11, 13, 18);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(13);
        p.text("Saved as nmit-art.png", p.width / 2, 33);
      }
    },
    onKeyPressed(p) {
      if (p.key === 'c' || p.key === 'C') {
        clearCanvas(p);
        strokeCount = 0;
      }
      if (p.key === 's' || p.key === 'S') {
        p.saveCanvas('nmit-art', 'png');
        savedAt = p.millis();
      }
      if (p.key >= '1' && p.key <= '4') brush = Number(p.key) - 1;
    },
    onMousePressed(p) {
      // tap top-right brush badge area to cycle brushes (touch-friendly)
      if (p.mouseX > p.width - 180 && p.mouseY > p.height - 40) {
        brush = (brush + 1) % brushes.length;
      }
    },
    hud(p) {
      return [
        { label: "Brush", value: brushes[brush] },
        { label: "Strokes", value: strokeCount }
      ];
    },
    hint: "Drag to paint • Keys 1–4 switch brushes • C clears • S saves PNG",
    reset(p) {
      clearCanvas(p);
      strokeCount = 0;
      hue = 0;
    }
  };
})();
