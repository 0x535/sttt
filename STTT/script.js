import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const Game = document.getElementById("game");
const StartButton = document.getElementById("start-button");
const TurnTextTop = document.getElementById("turnt");
const TurnTextBottom = document.getElementById("turnb");

let current_turn = 0; // 0 for 'X', 1 for 'O'
let Players = [
  { symbol: 'X', color: 'red' },
  { symbol: 'O', color: 'blue' }
];

let playing = true;
let last_move_field = null;
let checked_fields = Array(9).fill(null); // For storing win conditions
let available_moves = Array(9).fill(0); // Available move slots for each mini-game

StartButton.addEventListener('click', startGame);

function startGame() {
  Game.classList.remove("hidden");
  current_turn = 0;
  checked_fields.fill(null);
  available_moves.fill(0);
  setTurnText(getTurnText(Players[current_turn].symbol, Players[current_turn].color));
}

function setTurnText(text) {
  TurnTextTop.innerHTML = text;
  TurnTextBottom.innerHTML = text;
}

function getTurnText(symbol, color) {
  return `↓ <span style="color:${color};">${symbol}</span> ↓`;
}

document.querySelectorAll('.mini-cell').forEach((cell, index) => {
  cell.addEventListener('click', function () {
    if (playing && !cell.classList.contains('red') && !cell.classList.contains('blue') && !last_move_field) {
      cell.classList.add(Players[current_turn].color);
      available_moves[last_move_field] += 1;  // increment moves on that mini field

      // Check if there is a winner in the mini-game
      checkWinner();
    }
  });
});

function checkWinner() {
  let win = false;
  for (let i = 0; i < 3; i++) {
    if (checked_fields[i] !== null && checked_fields[i] === checked_fields[i+3] && checked_fields[i+3] === checked_fields[i+6]) {
      win = true;
      break;
    }
  }
  if (win) {
    setTurnText(`🏆 <span style="color:${Players[current_turn].color};">${Players[current_turn].symbol}</span> 🏆`);
    confetti();
    playing = false;
  }
}

