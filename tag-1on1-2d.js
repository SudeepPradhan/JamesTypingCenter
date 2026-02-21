// Tag 1on1 2D Game
// Red: WASD, Blue: Arrow keys, both move freely, jump, platforms

const canvas = document.getElementById('tag2dCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('tag2dStatus');

const WIDTH = 1280, HEIGHT = 720;
const PLAYER_SIZE = 36;
const GROUND_Y = HEIGHT - 48;
const GRAVITY = 0.7;
const JUMP_VEL = 14;
const SPEED = 6;

let red = { x: 80, y: GROUND_Y, vx: 0, vy: 0, color: 'red', onGround: true };
let blue = { x: WIDTH - 120, y: GROUND_Y, vx: 0, vy: 0, color: 'blue', onGround: true };
let tagger = null; // 'red' or 'blue'
let keys = {};
let jumpPressed = { red: false, blue: false };
let gameOver = false;

// More platforms, spread across the area
const platforms = [
  { x: 100, y: 600, w: 300, h: 16 },
  { x: 500, y: 500, w: 200, h: 16 },
  { x: 900, y: 600, w: 250, h: 16 },
  { x: 800, y: 400, w: 180, h: 16 },
  { x: 300, y: 350, w: 220, h: 16 },
  { x: 1000, y: 250, w: 200, h: 16 },
  { x: 600, y: 200, w: 120, h: 16 },
  { x: 200, y: 150, w: 180, h: 16 },
  { x: 50, y: 450, w: 120, h: 16 },
  { x: 1100, y: 100, w: 120, h: 16 }
];

function drawTag2DGame() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  // Draw ground
  ctx.fillStyle = '#228B22';
  ctx.fillRect(0, GROUND_Y + PLAYER_SIZE/2, WIDTH, HEIGHT - GROUND_Y);
  // Draw platforms
  ctx.fillStyle = '#8d5524';
  for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
  // Draw players
  drawPlayer(red);
  drawPlayer(blue);
}

function drawPlayer(player) {
  ctx.beginPath();
  ctx.arc(player.x + PLAYER_SIZE/2, player.y + PLAYER_SIZE/2, PLAYER_SIZE/2, 0, 2 * Math.PI);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#222';
  ctx.stroke();
}

function resetTag2DGame() {
  red = { x: 80, y: GROUND_Y, vx: 0, vy: 0, color: 'red', onGround: true };
  blue = { x: WIDTH - 120, y: GROUND_Y, vx: 0, vy: 0, color: 'blue', onGround: true };
  gameOver = false;
  if (tagger === null) {
    showRolePopup();
    statusEl.textContent = "Choose your role to start!";
  } else {
    statusEl.textContent = (tagger === 'red' ? 'Red' : 'Blue') + ' is the Tagger!';
    drawTag2DGame();
  }
}

function updateTag2DGame() {
  if (gameOver || tagger === null) return;
  // Red controls
  if ((keys['a'] || keys['A']) && red.x > 0) red.vx = -SPEED;
  else if ((keys['d'] || keys['D']) && red.x < WIDTH - PLAYER_SIZE) red.vx = SPEED;
  else red.vx = 0;
  // Blue controls
  if (keys['ArrowLeft'] && blue.x > 0) blue.vx = -SPEED;
  else if (keys['ArrowRight'] && blue.x < WIDTH - PLAYER_SIZE) blue.vx = SPEED;
  else blue.vx = 0;
  // Physics & collision
  applyPhysics(red);
  applyPhysics(blue);
  // Tag detection
  if (Math.abs(red.x - blue.x) < PLAYER_SIZE && Math.abs(red.y - blue.y) < PLAYER_SIZE) {
    if (tagger === 'red') {
      statusEl.textContent = 'Red (Tagger) tagged Blue!';
    } else {
      statusEl.textContent = 'Blue (Tagger) tagged Red!';
    }
    gameOver = true;
  }
  drawTag2DGame();
}

function applyPhysics(player) {
  player.x += player.vx;
  player.y += player.vy;
  player.vy += GRAVITY;
  // Platform collision
  player.onGround = false;
  for (const p of platforms) {
    if (
      player.x + PLAYER_SIZE > p.x && player.x < p.x + p.w &&
      player.y + PLAYER_SIZE > p.y && player.y + PLAYER_SIZE < p.y + p.h + 10 &&
      player.vy >= 0
    ) {
      player.y = p.y - PLAYER_SIZE;
      player.vy = 0;
      player.onGround = true;
    }
  }
  // Ground collision
  if (player.y + PLAYER_SIZE > GROUND_Y + PLAYER_SIZE/2) {
    player.y = GROUND_Y;
    player.vy = 0;
    player.onGround = true;
  }
  // Clamp
  if (player.x < 0) player.x = 0;
  if (player.x > WIDTH - PLAYER_SIZE) player.x = WIDTH - PLAYER_SIZE;
}


document.addEventListener('keydown', e => {
  keys[e.key] = true;
  // Red jump (W)
  if ((e.key === 'w' || e.key === 'W') && red.onGround && !jumpPressed.red) {
    red.vy = -JUMP_VEL;
    red.onGround = false;
    jumpPressed.red = true;
  }
  // Blue jump (Up Arrow)
  if (e.key === 'ArrowUp' && blue.onGround && !jumpPressed.blue) {
    blue.vy = -JUMP_VEL;
    blue.onGround = false;
    jumpPressed.blue = true;
  }
});
document.addEventListener('keyup', e => {
  keys[e.key] = false;
  if (e.key === 'w' || e.key === 'W') jumpPressed.red = false;
  if (e.key === 'ArrowUp') jumpPressed.blue = false;
});

setInterval(updateTag2DGame, 20);


function showRolePopup() {
  const popup = document.getElementById('rolePopup');
  if (popup) popup.style.display = 'flex';
}
function hideRolePopup() {
  const popup = document.getElementById('rolePopup');
  if (popup) popup.style.display = 'none';
}

window.onload = () => {
  tagger = null;
  resetTag2DGame();
  const tagBtn = document.getElementById('chooseTagger');
  const runBtn = document.getElementById('chooseRunner');
  const canvas = document.getElementById('tag2dCanvas');
  if (canvas) canvas.focus();
  if (tagBtn && runBtn) {
    tagBtn.onclick = () => {
      tagger = 'red';
      hideRolePopup();
      statusEl.textContent = 'Red is the Tagger!';
      drawTag2DGame();
      if (canvas) canvas.focus();
    };
    runBtn.onclick = () => {
      tagger = 'blue';
      hideRolePopup();
      statusEl.textContent = 'Blue is the Tagger!';
      drawTag2DGame();
      if (canvas) canvas.focus();
    };
  }
};
window.resetTag2DGame = resetTag2DGame;
