// Sliding Puzzle Game (8-puzzle)
// 3x3 grid, 8 tiles, 1 empty space

let PUZZLE_SIZE = 3;
let TILE_COUNT = PUZZLE_SIZE * PUZZLE_SIZE;
const IMAGE_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=240&q=80'; // Colorful abstract art

let board = [];
let emptyIndex = TILE_COUNT - 1;

function changeDifficulty() {
  const sel = document.getElementById('puzzleDifficulty');
  PUZZLE_SIZE = parseInt(sel.value);
  TILE_COUNT = PUZZLE_SIZE * PUZZLE_SIZE;
  emptyIndex = TILE_COUNT - 1;
  // Update board style
  const boardDiv = document.getElementById('slidingPuzzleBoard');
  boardDiv.style.gridTemplateColumns = `repeat(${PUZZLE_SIZE}, 80px)`;
  boardDiv.style.gridTemplateRows = `repeat(${PUZZLE_SIZE}, 80px)`;
  resetPuzzle();
}

function shuffleBoard() {
  // Create solved board
  board = Array.from({length: TILE_COUNT}, (_, i) => i);
  // Shuffle using Fisher-Yates
  for (let i = TILE_COUNT - 2; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [board[i], board[j]] = [board[j], board[i]];
  }
  // Ensure solvable
  if (!isSolvable(board)) shuffleBoard();
  emptyIndex = board.indexOf(TILE_COUNT - 1);
}

function isSolvable(arr) {
  let inv = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] !== 8 && arr[j] !== 8 && arr[i] > arr[j]) inv++;
    }
  }
  return inv % 2 === 0;
}

function renderBoard() {
  const boardDiv = document.getElementById('slidingPuzzleBoard');
  boardDiv.innerHTML = '';
  for (let i = 0; i < TILE_COUNT; i++) {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile' + (board[i] === TILE_COUNT - 1 ? ' empty' : '');
    if (board[i] !== TILE_COUNT - 1) {
      // Show part of the image as background
      const x = (board[i] % PUZZLE_SIZE) * -80;
      const y = Math.floor(board[i] / PUZZLE_SIZE) * -80;
      tile.style.backgroundImage = `url('${IMAGE_URL}')`;
      tile.style.backgroundPosition = `${x}px ${y}px`;
      tile.style.backgroundSize = `${PUZZLE_SIZE * 80}px ${PUZZLE_SIZE * 80}px`;
      tile.onclick = () => tryMove(i);
    }
    boardDiv.appendChild(tile);
  }
}

function tryMove(idx) {
  const moves = [
    idx - PUZZLE_SIZE, // up
    idx + PUZZLE_SIZE, // down
    idx - 1,           // left
    idx + 1            // right
  ];
  if (moves.includes(emptyIndex) &&
      !(idx % PUZZLE_SIZE === 0 && emptyIndex === idx - 1) &&
      !(idx % PUZZLE_SIZE === PUZZLE_SIZE - 1 && emptyIndex === idx + 1)) {
    [board[idx], board[emptyIndex]] = [board[emptyIndex], board[idx]];
    emptyIndex = idx;
    renderBoard();
    checkWin();
  }
}

function checkWin() {
  for (let i = 0; i < TILE_COUNT - 1; i++) {
    if (board[i] !== i) return;
  }
  document.getElementById('slidingPuzzleStatus').textContent = 'You solved it!';
}

function resetPuzzle() {
  shuffleBoard();
  renderBoard();
  document.getElementById('slidingPuzzleStatus').textContent = '';
}

window.onload = function() {
  changeDifficulty();
};
