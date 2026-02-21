
const wordCategories = {
  animals: [
    'tiger', 'zebra', 'whale', 'shark', 'lion', 'monkey', 'parrot', 'rabbit', 'panda', 'horse', 'mouse', 'sheep', 'goose', 'eagle', 'otter'
  ],
  school: [
    'pencil', 'chalk', 'class', 'books', 'notes', 'study', 'math', 'music', 'lunch', 'tests', 'ruler', 'paper', 'globe', 'grade', 'quiz'
  ],
  food: [
    'pizza', 'bread', 'apple', 'grape', 'salad', 'toast', 'bacon', 'melon', 'lemon', 'onion', 'beans', 'sushi', 'tacos', 'honey', 'olive'
  ]
};
let currentCategory = 'animals';
let chosenWord = '';
let guessed = [];
let wrong = 0;
const maxWrong = 6;


const wordEl = document.getElementById('hangmanWord');
const statusEl = document.getElementById('hangmanStatus');
const lettersEl = document.getElementById('hangmanLetters');
const resetBtn = document.getElementById('hangmanReset');
const categoryBtns = document.querySelectorAll('.hangman-category');
const canvas = document.getElementById('hangmanCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;


function pickWord(category) {
  currentCategory = category || currentCategory;
  const words = wordCategories[currentCategory];
  chosenWord = words[Math.floor(Math.random() * words.length)];
  guessed = [];
  wrong = 0;
  // Reveal one random letter at the start
  if (chosenWord.length > 0) {
    const idx = Math.floor(Math.random() * chosenWord.length);
    const revealLetter = chosenWord[idx];
    guessed.push(revealLetter);
  }
  updateDisplay();
  statusEl.textContent = '';
  drawHangman();
}

categoryBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    pickWord(btn.getAttribute('data-category'));
  });
});

function updateDisplay() {
  wordEl.textContent = chosenWord.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
  lettersEl.innerHTML = '';
  for (let c = 65; c <= 90; c++) {
    const letter = String.fromCharCode(c).toLowerCase();
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.disabled = guessed.includes(letter) || isGameOver();
    // Make wrong guesses stay red
    if (guessed.includes(letter) && !chosenWord.includes(letter)) {
      btn.style.background = '#ff3b3b';
      btn.style.color = '#fff';
      btn.style.borderColor = '#ff3b3b';
    }
    btn.onclick = () => guess(letter);
    lettersEl.appendChild(btn);
  }
  drawHangman();
}


function guess(letter) {
  if (guessed.includes(letter) || isGameOver()) return;
  guessed.push(letter);
  if (!chosenWord.includes(letter)) wrong++;
  updateDisplay();
  checkGame();
}

// Draw the hangman stick figure and pole
function drawHangman() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 3;
  // Draw pole
  ctx.beginPath();
  ctx.moveTo(30, 200); ctx.lineTo(150, 200); // base
  ctx.moveTo(60, 200); ctx.lineTo(60, 30); // pole
  ctx.lineTo(120, 30); // top bar
  ctx.lineTo(120, 50); // rope
  ctx.stroke();

  // Helper to draw glowing red
  function glow(strokeFn, shouldGlow) {
    if (shouldGlow) {
      ctx.save();
      ctx.shadowColor = '#ff3b3b';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#ff3b3b';
      strokeFn();
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#222';
      strokeFn();
      ctx.restore();
    }
  }

  // Always draw all body parts, but glow red if that part is wrong or less than or equal to wrong count
  // Head
  glow(() => {
    ctx.beginPath();
    ctx.arc(120, 65, 15, 0, Math.PI * 2);
    ctx.stroke();
    // Draw X eyes and dead mouth if lost
    if (wrong >= maxWrong) {
      ctx.save();
      ctx.strokeStyle = '#ff3b3b';
      ctx.lineWidth = 2.2;
      // Left eye X
      ctx.beginPath();
      ctx.moveTo(113, 60); ctx.lineTo(117, 64);
      ctx.moveTo(117, 60); ctx.lineTo(113, 64);
      ctx.stroke();
      // Right eye X
      ctx.beginPath();
      ctx.moveTo(123, 60); ctx.lineTo(127, 64);
      ctx.moveTo(127, 60); ctx.lineTo(123, 64);
      ctx.stroke();
      // Dead mouth (flat or frown)
      ctx.beginPath();
      ctx.moveTo(115, 75); ctx.lineTo(125, 75);
      ctx.stroke();
      ctx.restore();
    }
  }, wrong >= 1);

  // Body
  glow(() => {
    ctx.beginPath();
    ctx.moveTo(120, 80); ctx.lineTo(120, 130);
    ctx.stroke();
  }, wrong >= 2);

  // Left arm
  glow(() => {
    ctx.beginPath();
    ctx.moveTo(120, 90); ctx.lineTo(100, 110);
    ctx.stroke();
  }, wrong >= 3);

  // Right arm
  glow(() => {
    ctx.beginPath();
    ctx.moveTo(120, 90); ctx.lineTo(140, 110);
    ctx.stroke();
  }, wrong >= 4);

  // Left leg
  glow(() => {
    ctx.beginPath();
    ctx.moveTo(120, 130); ctx.lineTo(105, 170);
    ctx.stroke();
  }, wrong >= 5);

  // Right leg
  glow(() => {
    ctx.beginPath();
    ctx.moveTo(120, 130); ctx.lineTo(135, 170);
    ctx.stroke();
  }, wrong >= 6);
}

function isGameOver() {
  return wrong >= maxWrong || chosenWord.split('').every(l => guessed.includes(l));
}

function checkGame() {
  if (wrong >= maxWrong) {
    // Show loss popup and dark background
    document.body.style.background = '#000';
    const popup = document.getElementById('hangmanLossPopup');
    const answer = document.getElementById('hangmanLossAnswer');
    if (popup && answer) {
      answer.textContent = `The correct word was: "${chosenWord}"`;
      popup.style.display = 'flex';
    }
  } else if (chosenWord.split('').every(l => guessed.includes(l))) {
    // Show win popup and blue background
    document.body.style.background = '#0d6efd';
    const winPopup = document.getElementById('hangmanWinPopup');
    const winAnswer = document.getElementById('hangmanWinAnswer');
    if (winPopup && winAnswer) {
      winAnswer.textContent = `The word was: "${chosenWord}"`;
      winPopup.style.display = 'flex';
    }
  }
}

// Handle loss popup reset
const lossPopup = document.getElementById('hangmanLossPopup');
const lossResetBtn = document.getElementById('hangmanLossReset');
if (lossResetBtn) {
  lossResetBtn.onclick = function() {
    if (lossPopup) lossPopup.style.display = 'none';
    document.body.style.background = '';
    pickWord();
  };
}
// Handle win popup reset
const winPopup = document.getElementById('hangmanWinPopup');
const winResetBtn = document.getElementById('hangmanWinReset');
if (winResetBtn) {
  winResetBtn.onclick = function() {
    if (winPopup) winPopup.style.display = 'none';
    document.body.style.background = '';
    pickWord();
  };
}


// Keyboard input support
document.addEventListener('keydown', function(e) {
  if (isGameOver()) return;
  const letter = e.key.toLowerCase();
  if (letter.length === 1 && letter >= 'a' && letter <= 'z') {
    guess(letter);
  }
});

resetBtn.onclick = function() { pickWord(); };

// Start with default category
pickWord('animals');
