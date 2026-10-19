const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const statusEl = document.getElementById("status");
const resultModal = document.getElementById("resultModal");
const helpModal = document.getElementById("helpModal");
const prizeTitle = document.getElementById("prizeTitle");
const prizeText = document.getElementById("prizeText");
const W = canvas.width;
const H = canvas.height;

const itemSpots = createItemSpots();

function createItemSpots() {
  const spots = [];
  const rows = [{ y: 276, xs: [35, 97, 160, 223, 285] }, { y: 313, xs: [61, 111, 160, 209, 259] }];
  rows.forEach(row => row.xs.forEach(x => spots.push({
    x: Math.max(28, Math.min(292, x + (Math.random() - 0.5) * 22)),
    y: row.y + (Math.random() - 0.5) * 8
  })));
  return spots.sort(() => Math.random() - 0.5);
}

const prizePalette = ["#ff83b4", "#ffe27a", "#b6a1ff", "#8de0c1", "#ffad76", "#f4a6c8", "#9ed9ff"];

const state = {
  clawX: 160, clawY: 66, phase: "idle",
  targetX: 160, targetY: 240, selectedPrize: null,
  grabbedIndex: -1, lastTime: 0, resultTimer: 0, particles: [],
  prizes: []
};

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

function drawHeart(x, y, color) {
  rect(x + 2, y, 4, 4, color); rect(x + 10, y, 4, 4, color);
  rect(x, y + 4, 16, 4, color); rect(x + 2, y + 8, 12, 4, color);
  rect(x + 6, y + 12, 4, 4, color);
}

function drawBackground() {
  rect(0, 0, W, H, "#191428");
  rect(8, 8, W - 16, H - 16, "#342348");
  rect(14, 14, W - 28, H - 28, "#21192f");
  const stars = [[32,35],[72,52],[286,32],[267,74],[44,106],[290,126],[28,159],[282,188],[61,207],[253,220],[116,40],[205,50]];
  stars.forEach((s, i) => rect(s[0], s[1], i % 3 === 0 ? 4 : 2, i % 3 === 0 ? 4 : 2, i % 2 ? "#a98ad1" : "#ffe58a"));

  rect(17, 258, 286, 84, "#49335e");
  rect(17, 258, 286, 4, "#8f6cb2");
  for (let x = 22; x < 300; x += 16) rect(x, 264, 2, 72, "#382648");
  for (let y = 272; y < 340; y += 16) rect(18, y, 284, 2, "#382648");
  drawHeart(38, 72, "#ff8fba");
  drawHeart(277, 98, "#ff8fba");
  drawHeart(294, 232, "#ffe58a");
}

function drawMachineSign() {
  rect(66, 22, 188, 28, "#5e3d7b");
  rect(70, 26, 180, 20, "#241832");
  ctx.fillStyle = "#ffe58a";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("LUCKY PIXEL", 160, 39);
  rect(60, 50, 200, 3, "#a987ca");
}

function drawBox(x, y, size, color) {
  const p = Math.max(2, Math.floor(size / 10));
  rect(x + 2, y + size - 1, size, 3, "#21172e");
  rect(x + p, y + 3 * p, size - 2 * p, size - 3 * p, color);
  rect(x, y + 2 * p, size, 2 * p, "#fff0b8");
  rect(x + Math.floor(size * .43), y + 2 * p, Math.max(3, p * 2), size - p, "#fff0a6");
  rect(x + p, y, Math.floor(size * .28), 2 * p, "#fff0a6");
  rect(x + Math.floor(size * .62), y, Math.floor(size * .28), 2 * p, "#fff0a6");
  rect(x + Math.floor(size * .35), y + p, Math.floor(size * .3), p, "#fff0a6");
  rect(x + 3 * p, y + 4 * p, p, p, "#ffffff");
}

function drawEnvelope(x, y, size, color) {
  rect(x + 2, y + size - 2, size + 2, 3, "#21172e");
  rect(x, y + 5, size + 2, size - 9, color);
  rect(x, y + 5, size + 2, 3, "#ffd8e8");
  rect(x + 2, y + 8, Math.floor(size / 2), Math.floor(size / 2), "#ffb4d0");
  rect(x + Math.floor(size / 2), y + 8, Math.floor(size / 2), Math.floor(size / 2), "#ffe7f0");
  rect(x + 5, y + 9, size - 8, 3, "#fff0b8");
  rect(x + 8, y + 15, size - 14, 2, "#fff0b8");
  rect(x + size / 2 - 3, y + 1, 6, 6, "#fff0b8");
}

function drawTicket(x, y, size, color) {
  rect(x + 2, y + size - 2, size + 1, 3, "#21172e");
  rect(x + 1, y + 4, size, size - 8, color);
  rect(x + 1, y + 4, size, 3, "#fff0b8");
  rect(x + 5, y + 9, 2, size - 17, "#8e6a45");
  for (let i = 0; i < 3; i++) rect(x + 10 + i * 4, y + 10, 2, 2, "#fff7d7");
  rect(x + 10, y + 16, size - 14, 2, "#fff7d7");
}

function drawCup(x, y, size, color) {
  rect(x + 4, y + size - 3, size - 3, 3, "#21172e");
  rect(x + 4, y + 6, size - 9, size - 10, color);
  rect(x + 2, y + 5, size - 5, 4, "#fff0b8");
  rect(x + size - 6, y + 10, 5, 9, "#fff0b8");
  rect(x + size - 5, y + 12, 3, 5, "#8e6aaf");
  rect(x + 7, y + 12, size - 14, 3, "#fff0b8");
  rect(x + 8, y + 1, 3, 4, "#d8c8e9");
  rect(x + 13, y, 3, 5, "#d8c8e9");
}

function drawStar(x, y, size, color) {
  const p = Math.max(2, Math.floor(size / 9));
  rect(x + 3 * p, y, 3 * p, 2 * p, color);
  rect(x + 2 * p, y + 2 * p, 5 * p, 2 * p, color);
  rect(x, y + 4 * p, size, 3 * p, color);
  rect(x + 2 * p, y + 7 * p, 5 * p, 2 * p, color);
  rect(x + 3 * p, y + 9 * p, 3 * p, 2 * p, color);
  rect(x + 4 * p, y + 4 * p, 2 * p, 3 * p, "#fff6c9");
}

function drawFlower(x, y, size, color) {
  const p = Math.max(3, Math.floor(size / 8));
  rect(x + 2 * p, y, 2 * p, 2 * p, color);
  rect(x, y + 2 * p, 2 * p, 2 * p, color);
  rect(x + 4 * p, y + 2 * p, 2 * p, 2 * p, color);
  rect(x + 2 * p, y + 4 * p, 2 * p, 2 * p, color);
  rect(x + 2 * p, y + 2 * p, 2 * p, 2 * p, "#ffe58a");
  rect(x + 3 * p, y + 6 * p, 2 * p, 4 * p, "#8ce9c4");
  rect(x + p, y + 7 * p, 3 * p, 2 * p, "#8ce9c4");
}

function drawHandbag(x, y, size, color) {
  rect(x + 5, y + 2, size - 10, 3, "#ffe7b3");
  rect(x + 7, y + 5, 3, 6, "#ffe7b3");
  rect(x + size - 10, y + 5, 3, 6, "#ffe7b3");
  rect(x + 2, y + 10, size - 4, size - 13, color);
  rect(x + 5, y + 13, size - 10, 3, "#ffd8e8");
  rect(x + size / 2 - 2, y + 18, 4, 4, "#ffe58a");
  rect(x + 5, y + size - 5, size - 10, 2, "#8f6cb2");
}

function drawPerfume(x, y, size, color) {
  rect(x + size / 3, y + 1, size / 3, 4, "#ffe58a");
  rect(x + size / 3 + 2, y - 2, size / 3 - 4, 4, "#fff0b8");
  rect(x + 4, y + 6, size - 8, size - 9, color);
  rect(x + 2, y + 10, 3, size - 16, "#fff0b8");
  rect(x + 7, y + 11, size - 14, 6, "#ffd7e8");
  rect(x + 8, y + size - 7, size - 16, 2, "#fff0b8");
}

function drawCupcake(x, y, size, color) {
  rect(x + size / 2 - 3, y, 6, 4, "#fff0b8");
  rect(x + size / 2 - 7, y + 3, 14, 4, "#ffb4d0");
  rect(x + 3, y + 7, size - 6, 5, color);
  rect(x + 5, y + 12, size - 10, size - 15, "#e7a06f");
  rect(x + 7, y + 14, 3, size - 18, "#fff0b8");
  rect(x + size - 9, y + 14, 3, size - 18, "#fff0b8");
  rect(x + size / 2 - 2, y + 8, 4, 3, "#ffe58a");
}

function drawGem(x, y, size, color) {
  rect(x + 5, y + 1, size - 10, 4, "#d8fff0");
  rect(x + 2, y + 5, size - 4, 5, color);
  rect(x, y + 10, size, 5, color);
  rect(x + 3, y + 15, size - 6, 5, "#6dbfa8");
  rect(x + 7, y + 20, size - 14, 4, "#d8fff0");
  rect(x + 6, y + 6, 4, 4, "#ffffff");
}

function drawPrize(prize, centerX, y, sizeOverride) {
  const size = sizeOverride || prize.visualSize || prize.size || 26;
  const x = Math.round(centerX - size / 2);
  const color = prize.visualColor || prize.color || "#ff83b4";
  const draw = {
    box: drawBox, envelope: drawEnvelope, ticket: drawTicket, cup: drawCup,
    star: drawStar, flower: drawFlower, handbag: drawHandbag,
    perfume: drawPerfume, cupcake: drawCupcake, gem: drawGem
  }[prize.type] || drawBox;
  if (prize.rotation && !sizeOverride) {
    ctx.save();
    ctx.translate(centerX, y + size / 2);
    ctx.rotate(prize.rotation);
    draw(-size / 2, -size / 2, size, color);
    ctx.restore();
  } else {
    draw(x, y, size, color);
  }
}

function drawClaw() {
  rect(state.clawX - 2, 58, 4, Math.max(2, state.clawY - 58), "#d9c8e9");
  rect(state.clawX - 13, state.clawY - 1, 26, 12, "#f5b1d0");
  rect(state.clawX - 9, state.clawY + 2, 18, 7, "#8c5ea7");
  rect(state.clawX - 4, state.clawY + 2, 8, 4, "#ffe58a");

  if (["rising", "dropping", "result"].includes(state.phase) && state.selectedPrize) {
    drawPrize(state.selectedPrize, state.clawX, state.clawY + 19, Math.min(23, state.selectedPrize.size || 25));
  }

  const open = state.phase === "idle" || state.phase === "descending";
  if (open) {
    rect(state.clawX - 11, state.clawY + 8, 4, 15, "#ffe4a1");
    rect(state.clawX - 11, state.clawY + 19, 7, 4, "#ffe4a1");
    rect(state.clawX + 7, state.clawY + 8, 4, 15, "#ffe4a1");
    rect(state.clawX + 4, state.clawY + 19, 7, 4, "#ffe4a1");
  } else {
    rect(state.clawX - 9, state.clawY + 8, 4, 11, "#ffe4a1");
    rect(state.clawX - 9, state.clawY + 15, 7, 4, "#ffe4a1");
    rect(state.clawX + 5, state.clawY + 8, 4, 11, "#ffe4a1");
    rect(state.clawX + 2, state.clawY + 15, 7, 4, "#ffe4a1");
  }
}

function createBurst(x, y) {
  const colors = ["#ffe58a", "#ff8fba", "#8ce9c4", "#b6a1ff", "#ffffff"];
  for (let i = 0; i < 30; i++) {
    state.particles.push({
      x, y, vx: (Math.random() - .5) * 150,
      vy: (Math.random() - .8) * 150,
      size: 2 + Math.floor(Math.random() * 4),
      color: colors[Math.floor(Math.random() * colors.length)],
      life: .5 + Math.random() * .8
    });
  }
}

function drawParticles(dt) {
  state.particles.forEach(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    rect(p.x, p.y, p.size, p.size, p.color);
  });
  state.particles = state.particles.filter(p => p.life > 0);
}

function drawScene(dt) {
  drawBackground();
  drawMachineSign();
  rect(20, 252, 280, 7, "#c49adf");
  rect(20, 259, 280, 4, "#8e65af");

  state.prizes.forEach((prize, i) => {
    if (i === state.grabbedIndex && ["rising", "dropping", "result"].includes(state.phase)) return;
    const spot = itemSpots[i % itemSpots.length];
    const bob = state.phase === "idle" ? Math.sin(performance.now() / 500 + i) * 1.5 : 0;
    drawPrize(prize, spot.x, spot.y + bob);
  });

  rect(23, 64, 44, 15, "#60417a");
  ctx.fillStyle = "#ffe8a3";
  ctx.font = "7px monospace";
  ctx.textAlign = "center";
  ctx.fillText("PRIZES", 45, 74);

  drawClaw();
  drawParticles(dt);
}

function update(dt) {
  if (state.phase === "descending") {
    state.clawX += (state.targetX - state.clawX) * Math.min(1, 5 * dt);
    state.clawY += 155 * dt;
    if (Math.abs(state.targetX - state.clawX) < 2 && state.clawY >= state.targetY) {
      state.clawX = state.targetX;
      state.clawY = state.targetY;
      state.phase = "rising";
      state.grabbedIndex = state.prizes.indexOf(state.selectedPrize);
      statusEl.textContent = "ĐANG KÉO QUÀ LÊN...";
    }
  } else if (state.phase === "rising") {
    state.clawY -= 175 * dt;
    if (state.clawY <= 66) {
      state.clawY = 66;
      state.phase = "dropping";
      state.resultTimer = .35;
      statusEl.textContent = "MỞ QUÀ NÀO!";
      createBurst(state.clawX, 95);
    }
  } else if (state.phase === "dropping") {
    state.resultTimer -= dt;
    if (state.resultTimer <= 0) {
      state.phase = "result";
      statusEl.textContent = "GẮP QUÀ THÀNH CÔNG!";
      prizeTitle.textContent = state.resultPrize.name;
      prizeText.textContent = state.resultPrize.detail;
      resultModal.hidden = false;
      document.getElementById("closeResultBtn").focus();
    }
  }
}

function chooseRandomReward(prizes) {
  const weighted = prizes.map(prize => ({
    prize,
    weight: Math.max(0, Number(prize.weight) || 1)
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return prizes[Math.floor(Math.random() * prizes.length)];
  let roll = Math.random() * totalWeight;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.prize;
  }
  return weighted[weighted.length - 1].prize;
}

function loop(now) {
  const dt = Math.min((now - state.lastTime) / 1000 || 0, .04);
  state.lastTime = now;
  update(dt);
  drawScene(dt);
  requestAnimationFrame(loop);
}

function resetAfterResult() {
  resultModal.hidden = true;
  state.phase = "idle";
  state.clawY = 66;
  state.clawX = 160;
  state.selectedPrize = null;
  state.grabbedIndex = -1;
  state.particles = [];
  statusEl.textContent = "SẴN SÀNG GẮP QUÀ!";
}

function closeHelpModal() {
  helpModal.hidden = true;
}

document.getElementById("helpBtn").addEventListener("click", () => {
  helpModal.hidden = false;
  document.getElementById("gotItBtn").focus();
});
document.getElementById("gotItBtn").addEventListener("click", closeHelpModal);
document.getElementById("closeHelpBtn").addEventListener("click", closeHelpModal);
document.getElementById("closeResultBtn").addEventListener("click", resetAfterResult);
document.getElementById("againBtn").addEventListener("click", resetAfterResult);

[resultModal, helpModal].forEach(modal => modal.addEventListener("click", event => {
  if (event.target !== modal) return;
  if (modal === resultModal) resetAfterResult();
  else modal.hidden = true;
}));

window.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (!resultModal.hidden) resetAfterResult();
  helpModal.hidden = true;
});

function moveClaw(amount) {
  if (state.phase !== "idle") return;
  state.clawX = Math.max(28, Math.min(292, state.clawX + amount));
}

document.getElementById("leftBtn").addEventListener("click", () => moveClaw(-16));
document.getElementById("rightBtn").addEventListener("click", () => moveClaw(16));

document.getElementById("grabBtn").addEventListener("click", () => {
  if (state.phase !== "idle") return;
  if (!state.prizes.length) {
    statusEl.textContent = "ĐANG TẢI QUÀ...";
    return;
  }

  const closestIndex = itemSpots.reduce((best, spot, i) =>
    Math.abs(spot.x - state.clawX) < Math.abs(itemSpots[best].x - state.clawX) ? i : best, 0);
  state.selectedPrize = state.prizes[closestIndex];
  state.resultPrize = chooseRandomReward(state.prizes);
  state.grabbedIndex = -1;
  state.targetX = itemSpots[closestIndex].x;
  state.targetY = Math.max(218, itemSpots[closestIndex].y - 30);
  state.phase = "descending";
  resultModal.hidden = true;
  statusEl.textContent = "ĐANG GẮP QUÀ...";
});

document.getElementById("againBtn").addEventListener("click", () => {
  state.phase = "idle";
  state.clawY = 66;
  state.clawX = 160;
  state.selectedPrize = null;
  state.grabbedIndex = -1;
  state.particles = [];
  statusEl.textContent = "SẴN SÀNG GẮP QUÀ!";
  resultModal.hidden = true;
});

window.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") { event.preventDefault(); moveClaw(-16); }
  if (event.key === "ArrowRight") { event.preventDefault(); moveClaw(16); }
  if (event.code === "Space" && state.phase === "idle") {
    event.preventDefault();
    document.getElementById("grabBtn").click();
  }
});

fetch("rewards.json")
  .then(response => {
    if (!response.ok) throw new Error("Không tải được rewards.json");
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) throw new Error("Danh sách quà đang trống");
    state.prizes = data.slice(0, itemSpots.length).map(prize => ({
      ...prize,
      visualSize: 22 + Math.floor(Math.random() * 13),
      visualColor: prizePalette[Math.floor(Math.random() * prizePalette.length)],
      rotation: (Math.random() - 0.5) * 0.5
    }));
    statusEl.textContent = "SẴN SÀNG GẮP QUÀ!";
  })
  .catch(error => {
    console.error(error);
    statusEl.textContent = "LỖI TẢI QUÀ · MỞ LIVE SERVER";
  });

requestAnimationFrame(loop);
