
// Tag 1on1 Game (real-time)
// Red: WASD, Blue: Arrow keys, both move freely

const canvas = document.getElementById('tagGameCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('tagStatus');

const SIZE = 40;
const SPEED = 4; // pixels per frame
const GRID = 10;

let red = { x: 1 * SIZE, y: 1 * SIZE, color: 'red', vx: 0, vy: 0 };
let blue = { x: (GRID - 2) * SIZE, y: (GRID - 2) * SIZE, color: 'blue', vx: 0, vy: 0 };
let gameOver = false;

function drawTagGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw grid
  ctx.strokeStyle = '#ccc';
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath();
    ctx.moveTo(i * SIZE, 0);
    ctx.lineTo(i * SIZE, GRID * SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * SIZE);
    ctx.lineTo(GRID * SIZE, i * SIZE);
    ctx.stroke();
  }
  // Draw players
  drawPlayer(red);
  drawPlayer(blue);
}

function drawPlayer(player) {
  ctx.beginPath();
  ctx.arc(player.x + SIZE / 2, player.y + SIZE / 2, SIZE / 2 - 4, 0, 2 * Math.PI);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#222';
  ctx.stroke();
}

function resetTagGame() {
  red = { x: 1 * SIZE, y: 1 * SIZE, color: 'red', vx: 0, vy: 0 };
  blue = { x: (GRID - 2) * SIZE, y: (GRID - 2) * SIZE, color: 'blue', vx: 0, vy: 0 };
  gameOver = false;
  statusEl.textContent = "Red: WASD | Blue: Arrows";
  drawTagGame();
}

function checkTag() {
  const dx = red.x - blue.x;
  const dy = red.y - blue.y;
  if (Math.abs(dx) < SIZE * 0.7 && Math.abs(dy) < SIZE * 0.7) {
    statusEl.textContent = `Red tagged Blue!`;
    gameOver = true;
  }
}

let keys = {};
document.addEventListener('keydown', function(e) {
  keys[e.key] = true;
});
document.addEventListener('keyup', function(e) {
  keys[e.key] = false;
});

function updateTagGame() {
  if (gameOver) return;
  // Red controls (WASD)
  red.vx = red.vy = 0;
  if (keys['w'] || keys['W']) red.vy = -SPEED;
  if (keys['s'] || keys['S']) red.vy = SPEED;
  if (keys['a'] || keys['A']) red.vx = -SPEED;
  if (keys['d'] || keys['D']) red.vx = SPEED;
  // Blue controls (arrows)
  blue.vx = blue.vy = 0;
  if (keys['ArrowUp']) blue.vy = -SPEED;
  if (keys['ArrowDown']) blue.vy = SPEED;
  if (keys['ArrowLeft']) blue.vx = -SPEED;
  if (keys['ArrowRight']) blue.vx = SPEED;
  // Move and clamp to bounds
  red.x = Math.max(0, Math.min(red.x + red.vx, canvas.width - SIZE));
  red.y = Math.max(0, Math.min(red.y + red.vy, canvas.height - SIZE));
  blue.x = Math.max(0, Math.min(blue.x + blue.vx, canvas.width - SIZE));
  blue.y = Math.max(0, Math.min(blue.y + blue.vy, canvas.height - SIZE));
  drawTagGame();
  checkTag();
}

setInterval(updateTagGame, 20);

window.resetTagGame = resetTagGame;
window.onload = resetTagGame;
