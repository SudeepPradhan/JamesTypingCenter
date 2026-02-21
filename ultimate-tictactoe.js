// Ultimate Tic Tac Toe implementation
// 9 mini-boards, each 3x3, win a mini-board to claim it, win 3 in a row to win the game

const uttBoardEl = document.getElementById('uttBoard');
const uttStatusEl = document.getElementById('uttStatus');
const uttResetBtn = document.getElementById('uttReset');

let mainBoard, miniBoards, currentPlayer, activeMini, gameOver;

function initGame() {
  // 0: empty, 1: X, 2: O
  mainBoard = Array(9).fill(0); // 0: not won, 1: X, 2: O
  miniBoards = Array(9).fill().map(() => Array(9).fill(0));
  currentPlayer = 1; // 1: X, 2: O
  activeMini = -1; // -1: any
  gameOver = false;
  renderBoard();
  uttStatusEl.textContent = "Player X's turn";
  showTurnPopup(currentPlayer);
}

function renderBoard() {
  uttBoardEl.innerHTML = '';
  for (let m = 0; m < 9; m++) {
    const mini = document.createElement('div');
    mini.className = 'utt-mini-board' + (mainBoard[m] === 1 ? ' won-x' : mainBoard[m] === 2 ? ' won-o' : '');
    mini.dataset.mini = m;
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      let cellClass = 'utt-cell';
      if (miniBoards[m][c] === 1) cellClass += ' x won-x';
      else if (miniBoards[m][c] === 2) cellClass += ' o won-o';
      // Highlight available cells for current player
      const isAvailable = !miniBoards[m][c] && !mainBoard[m] && (gameOver === false) && (activeMini === -1 || activeMini === m);
      if (isAvailable) {
        cellClass += currentPlayer === 1 ? ' highlight-x' : ' highlight-o';
      }
      cell.className = cellClass;
      cell.dataset.mini = m;
      cell.dataset.cell = c;
      cell.textContent = miniBoards[m][c] === 1 ? 'X' : miniBoards[m][c] === 2 ? 'O' : '';
      cell.style.opacity = (gameOver || mainBoard[m] || activeMini === -1 || activeMini === m) ? '1' : '0.4';
      cell.onclick = () => handleMove(m, c);
      mini.appendChild(cell);
    }
    uttBoardEl.appendChild(mini);
  }
}

function handleMove(m, c) {
  if (gameOver) return;
  if (mainBoard[m]) return;
  if (miniBoards[m][c]) return;
  if (activeMini !== -1 && activeMini !== m) return;
  miniBoards[m][c] = currentPlayer;
  // Check mini win
  if (checkWin(miniBoards[m], currentPlayer)) {
    mainBoard[m] = currentPlayer;
  }
  // Check main win
  if (checkWin(mainBoard, currentPlayer)) {
    uttStatusEl.textContent = `Player ${currentPlayer === 1 ? 'X' : 'O'} wins the game!`;
    gameOver = true;
    renderBoard();
    return;
  }
  // Check draw
  if (mainBoard.every(x => x)) {
    uttStatusEl.textContent = 'Draw!';
    gameOver = true;
    renderBoard();
    return;
  }
  // Next active mini
  if (mainBoard[c]) {
    activeMini = -1; // Any
  } else {
    activeMini = c;
  }
  currentPlayer = 3 - currentPlayer;
  uttStatusEl.textContent = `Player ${currentPlayer === 1 ? 'X' : 'O'}'s turn` + (activeMini === -1 ? '' : ` (play in mini-board ${activeMini + 1})`);
  renderBoard();
  showTurnPopup(currentPlayer);
}

// Show a quick popup for the current player's turn and color
function showTurnPopup(player) {
  const popup = document.getElementById('uttTurnPopup');
  const msg = document.getElementById('uttTurnPopupMsg');
  if (!popup || !msg) return;
  msg.textContent = `Player ${player === 1 ? 'X' : 'O'}'s turn`;
  msg.style.color = player === 1 ? '#e53935' : '#1565c0';
  popup.style.display = 'flex';
  setTimeout(() => { popup.style.display = 'none'; }, 500);
}

function checkWin(board, player) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6] // diags
  ];
  return lines.some(line => line.every(i => board[i] === player));
}

uttResetBtn.onclick = initGame;

initGame();
