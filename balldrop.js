// Ball Drop Game: Drop balls of increasing rarity, merge to make bigger ones
// Simple 2048-like physics merge game

const canvas = document.getElementById('bdGameCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('bdStatus');
const resetBtn = document.getElementById('bdReset');

const BALL_RADII = [18, 22, 26, 32, 40, 50];
const BALL_COLORS = ['#b3e5fc', '#4fc3f7', '#0288d1', '#ffd54f', '#ff7043', '#8e24aa'];
// No labels needed, just color and size

let balls = [];
let droppingBall = null;
let score = 0;
let gameOver = false;

function resetGame() {
  balls = [];
  droppingBall = null;
  score = 0;
  gameOver = false;
  statusEl.textContent = '';
  spawnBall();
  draw();
}

function spawnBall() {
  // Ball starts at top, random rarity (weighted)
  const rarity = getRandomRarity();
  droppingBall = {
    x: canvas.width / 2,
    y: BALL_RADII[rarity],
    vx: 0,
    vy: 0,
    r: BALL_RADII[rarity],
    color: BALL_COLORS[rarity],
    // No label
    rarity: rarity,
    dropping: true
  };
}

function getRandomRarity() {
  // Weighted: Common 50%, UC 25%, R 12%, SR 7%, E 4%, L 2%
  const roll = Math.random();
  if (roll < 0.5) return 0;
  if (roll < 0.75) return 1;
  if (roll < 0.87) return 2;
  if (roll < 0.94) return 3;
  if (roll < 0.98) return 4;
  return 5;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw all balls
  for (const b of balls) drawBall(b);
  if (droppingBall) drawBall(droppingBall);
}

function drawBall(b) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = b.color;
  ctx.shadowColor = b.color;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#333';
  ctx.stroke();
  ctx.restore();
}


function update() {
  if (gameOver) return;
  if (droppingBall) {
    droppingBall.vy += 0.13; // much slower gravity
    droppingBall.y += droppingBall.vy;
    droppingBall.x += droppingBall.vx;
    // Wall collision
    if (droppingBall.x - droppingBall.r < 0) {
      droppingBall.x = droppingBall.r;
      droppingBall.vx = 0;
    }
    if (droppingBall.x + droppingBall.r > canvas.width) {
      droppingBall.x = canvas.width - droppingBall.r;
      droppingBall.vx = 0;
    }
    // Floor collision (no bounce)
    if (droppingBall.y + droppingBall.r > canvas.height) {
      droppingBall.y = canvas.height - droppingBall.r;
      droppingBall.vy = 0;
      droppingBall.dropping = false;
    }
    // Check for collision with other balls (only if directly below)
    let landed = false;
    for (const b of balls) {
      // Only check for vertical collision (ignore side hits)
      const dx = droppingBall.x - b.x;
      const dy = (droppingBall.y + droppingBall.r) - (b.y - b.r);
      const horizontalOverlap = Math.abs(dx) < (droppingBall.r + b.r) * 0.9;
      const verticalTouch = dy > 0 && droppingBall.y < b.y;
      if (horizontalOverlap && verticalTouch && Math.abs(droppingBall.y + droppingBall.r - (b.y - b.r)) < Math.abs(droppingBall.vy) + 1) {
        // Merge if same color (rarity) and similar size (within 5% radius)
        if (
          droppingBall.rarity === b.rarity &&
          Math.abs(droppingBall.r - b.r) < b.r * 0.05
        ) {
          // Merge into a bigger ball with next color
          const nextRarity = (b.rarity + 1) % BALL_COLORS.length;
          const newRadius = b.r * 1.25;
          const newBall = {
            x: (droppingBall.x + b.x) / 2,
            y: (droppingBall.y + b.y) / 2,
            vx: 0,
            vy: 0.5, // Give a small downward velocity so it falls after merge
            r: newRadius,
            color: BALL_COLORS[nextRarity],
            rarity: nextRarity,
            dropping: true // Let it fall after merge
          };
          balls.splice(balls.indexOf(b), 1);
          droppingBall = null;
          balls.push(newBall);
          score += Math.round(newRadius); // score based on new size
          // Do NOT spawn a new ball yet, let the merged ball fall
          draw();
          return;
        } else {
          // Land on top of the ball
          droppingBall.vy = 0;
          droppingBall.y = b.y - b.r - droppingBall.r;
          droppingBall.dropping = false;
          landed = true;
          // Rolling: if not centered, nudge left/right
          const centerDiff = droppingBall.x - b.x;
          if (Math.abs(centerDiff) > 2) {
            droppingBall.vx = centerDiff * 0.08; // Roll off if not centered
            droppingBall.dropping = true;
          }
          break;
        }
      }
    }
    // If hit the floor (no balls below)
    if (!landed && droppingBall.y + droppingBall.r >= canvas.height) {
      droppingBall.y = canvas.height - droppingBall.r;
      droppingBall.vy = 0;
      droppingBall.dropping = false;
    }
    // If stopped
    if (!droppingBall.dropping && Math.abs(droppingBall.vy) < 0.1) {
      balls.push(droppingBall);
      droppingBall = null;
      // Immediately spawn next ball for continuous play
      spawnBall();
    }

  // Let merged balls fall and roll
  for (const b of balls) {
    if (b.dropping) {
      b.vy += 0.13;
      b.y += b.vy;
      b.x += b.vx;
      // Wall collision
      if (b.x - b.r < 0) {
        b.x = b.r;
        b.vx = 0;
      }
      if (b.x + b.r > canvas.width) {
        b.x = canvas.width - b.r;
        b.vx = 0;
      }
      // Floor collision
      if (b.y + b.r > canvas.height) {
        b.y = canvas.height - b.r;
        b.vy = 0;
        b.dropping = false;
      }
      // Land on other balls
      for (const other of balls) {
        if (b === other) continue;
        const dx = b.x - other.x;
        const dy = (b.y + b.r) - (other.y - other.r);
        const horizontalOverlap = Math.abs(dx) < (b.r + other.r) * 0.9;
        const verticalTouch = dy > 0 && b.y < other.y;
        if (horizontalOverlap && verticalTouch && Math.abs(b.y + b.r - (other.y - other.r)) < Math.abs(b.vy) + 1) {
          b.vy = 0;
          b.y = other.y - other.r - b.r;
          b.dropping = false;
          // Rolling: if not centered, nudge left/right
          const centerDiff = b.x - other.x;
          if (Math.abs(centerDiff) > 2) {
            b.vx = centerDiff * 0.08;
            b.dropping = true;
          } else {
            b.vx = 0;
          }
          break;
        }
      }
    }
  }
  }
  draw();
  statusEl.textContent = `Score: ${score}`;
  // Game over if balls reach top
  for (const b of balls) {
    if (b.y - b.r < 0) {
      statusEl.textContent = `Game Over! Final Score: ${score}`;
      gameOver = true;
      break;
    }
  }
}



// Continuous left/right movement with arrow keys or A/D
let moveLeft = false, moveRight = false;
document.addEventListener('keydown', e => {
  if (!droppingBall || !droppingBall.dropping) return;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = false;
});

function update() {
  if (gameOver) return;
  if (droppingBall) {
    // Continuous movement
    if (moveLeft) {
      droppingBall.x -= 5;
      if (droppingBall.x < droppingBall.r) droppingBall.x = droppingBall.r;
    }
    if (moveRight) {
      droppingBall.x += 5;
      if (droppingBall.x > canvas.width - droppingBall.r) droppingBall.x = canvas.width - droppingBall.r;
    }
    droppingBall.vy += 0.13; // much slower gravity
    droppingBall.y += droppingBall.vy;
    droppingBall.x += droppingBall.vx;
    // Wall collision
    if (droppingBall.x - droppingBall.r < 0) {
      droppingBall.x = droppingBall.r;
      droppingBall.vx = 0;
    }
    if (droppingBall.x + droppingBall.r > canvas.width) {
      droppingBall.x = canvas.width - droppingBall.r;
      droppingBall.vx = 0;
    }
    // Floor collision (no bounce)
    if (droppingBall.y + droppingBall.r > canvas.height) {
      droppingBall.y = canvas.height - droppingBall.r;
      droppingBall.vy = 0;
      droppingBall.dropping = false;
    }
    // Collide with other balls
    for (const b of balls) {
      const dx = droppingBall.x - b.x;
      const dy = droppingBall.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < droppingBall.r + b.r) {
        // Merge if same color (rarity) and similar size (within 5% radius)
        if (
          droppingBall.rarity === b.rarity &&
          Math.abs(droppingBall.r - b.r) < b.r * 0.05
        ) {
          // Merge into a bigger ball with next color
          const nextRarity = (b.rarity + 1) % BALL_COLORS.length;
          const newRadius = b.r * 1.25;
          const newBall = {
            x: (droppingBall.x + b.x) / 2,
            y: (droppingBall.y + b.y) / 2,
            vx: 0,
            vy: 0,
            r: newRadius,
            color: BALL_COLORS[nextRarity],
            rarity: nextRarity,
            dropping: false
          };
          balls.splice(balls.indexOf(b), 1);
          droppingBall = null;
          balls.push(newBall);
          score += Math.round(newRadius); // score based on new size
          // Immediately spawn next ball for continuous play
          spawnBall();
          draw();
          return;
        } else {
          // No bounce, just stop on top
          droppingBall.vy = 0;
          droppingBall.y = b.y - b.r - droppingBall.r;
          droppingBall.dropping = false;
        }
      }
    }
    // If stopped
    if (!droppingBall.dropping && Math.abs(droppingBall.vy) < 0.1) {
      balls.push(droppingBall);
      droppingBall = null;
      // Immediately spawn next ball for continuous play
      spawnBall();
    }
  }
  draw();
  statusEl.textContent = `Score: ${score}`;
  // Game over if balls reach top
  for (const b of balls) {
    if (b.y - b.r < 0) {
      statusEl.textContent = `Game Over! Final Score: ${score}`;
      gameOver = true;
      break;
    }
  }
}

resetBtn.onclick = resetGame;

resetGame();
setInterval(update, 20);
