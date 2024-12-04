import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const Game = document.getElementById("game");
const Fields = document.getElementsByClassName("field");
const Cells = document.getElementsByClassName("cell");
const TurnTextTop = document.getElementById("turnt");
const TurnTextBottom = document.getElementById("turnb");
const StartButton = document.getElementById("start-button");
const DifficultySelect = document.getElementById("difficulty");

// Player properties
const Players = [
    { symbol: "■", color: "rgb(0, 106, 255)", color_name: "blue" },
    { symbol: "■", color: "red", color_name: "red" }
];

// Game state
let current_turn = Math.round(Math.random());
let win = false;
let playing = false;
let ai_enabled = false;
let ai_difficulty = "easy"; // Default difficulty

// Start the game
StartButton.addEventListener("click", () => {
    StartButton.style.display = "none"; // Hide the start button
    Game.style.display = "grid";       // Show the game grid
    TurnTextTop.style.display = "block"; // Show the turn indicators
    TurnTextBottom.style.display = "block";
    ai_enabled = confirm("Would you like to play against the AI?");
    ai_difficulty = DifficultySelect.value;
    setTurnText(getTurnText(Players[current_turn].symbol, Players[current_turn].color));
    playing = true; // Allow moves
    if (ai_enabled && current_turn === 1) aiMove();
});

// Add event listeners for each cell
for (const cell of Cells) {
    cell.addEventListener("click", () => {
        if (!playing || (ai_enabled && current_turn === 1)) return;
        const field_index = Array.from(cell.parentElement.parentElement.children).indexOf(cell.parentElement);
        const field = Game.children[field_index];
        play(cell, field);
    });
}

function play(cell, field) {
    if (!win) {
        if (checkPlaceable(cell, field)) {
            cell.classList.add(Players[current_turn].color_name);

            // Check local win condition
            const checked_cells = Array.from(field.children).map((cell) => cell.classList.contains(Players[current_turn].color_name));
            if (checked_cells[0] && checked_cells[1] && checked_cells[2] ||
                checked_cells[3] && checked_cells[4] && checked_cells[5] ||
                checked_cells[6] && checked_cells[7] && checked_cells[8] ||
                checked_cells[0] && checked_cells[3] && checked_cells[6] ||
                checked_cells[1] && checked_cells[4] && checked_cells[7] ||
                checked_cells[2] && checked_cells[5] && checked_cells[8] ||
                checked_cells[0] && checked_cells[4] && checked_cells[8] ||
                checked_cells[2] && checked_cells[4] && checked_cells[6]) {
                confetti();
                field.classList.add(Players[current_turn].color_name);
            }

            // Check global win condition
            const checked_fields = Array.from(Game.children).map((field) => field.classList.contains(Players[current_turn].color_name));
            if (checked_fields[0] && checked_fields[1] && checked_fields[2] ||
                checked_fields[3] && checked_fields[4] && checked_fields[5] ||
                checked_fields[6] && checked_fields[7] && checked_fields[8] ||
                checked_fields[0] && checked_fields[3] && checked_fields[6] ||
                checked_fields[1] && checked_fields[4] && checked_fields[7] ||
                checked_fields[2] && checked_fields[5] && checked_fields[8] ||
                checked_fields[0] && checked_fields[4] && checked_fields[8] ||
                checked_fields[2] && checked_fields[4] && checked_fields[6]) {
                win = true;
            }

            const cell_index = Array.from(cell.parentElement.children).indexOf(cell);

            // Lock fields
            removeTemporaryClasses();
            if (!Array.from(Game.children[cell_index].children).map((cell) => checkPlaceable(cell, Game.children[cell_index])).every((placeable) => placeable === false)) {
                for (const field of Fields) {
                    if (Array.from(field.parentElement.children).indexOf(field) != cell_index) {
                        field.classList.add("locked");
                    }
                }
            }

            // Change turn
            current_turn = opposite(current_turn);
            setTurnText(getTurnText(Players[current_turn].symbol, Players[current_turn].color));

            // Check for AI's turn
            if (ai_enabled && current_turn === 1 && !win) aiMove();
        }

        if (win) {
            setTurnText(`🏆 <span style="color:${Players[opposite(current_turn)].color};">${Players[opposite(current_turn)].symbol}</span> 🏆`);
            removeTemporaryClasses();
            confetti();
            playing = false;
        }
    }
}

function setTurnText(text) {
    TurnTextTop.innerHTML = text;
    TurnTextBottom.innerHTML = text;
}

function getTurnText(symbol, color) {
    return `↓ <span style="color:${color};">${symbol}</span> ↓`;
}

function checkPlaceable(cell, field) {
    return !cell.classList.contains("red") && !cell.classList.contains("blue") &&
        !field.classList.contains("red") && !field.classList.contains("blue") &&
        !field.classList.contains("locked");
}

function removeTemporaryClasses() {
    for (const testedField of Fields) {
        if (testedField.classList.contains("locked")) testedField.classList.remove("locked");
    }
}

function opposite(turn) {
    return turn === 0 ? 1 : 0;
}

// AI Logic
function aiMove() {
    let move;
    if (ai_difficulty === "easy") {
        move = getRandomMove();
    } else if (ai_difficulty === "hard") {
        move = getStrategicMove();
    }
    if (move) play(move.cell, move.field);
}

// Easy AI: Selects a random valid move
function getRandomMove() {
    const availableMoves = [];
    for (const field of Fields) {
        if (!field.classList.contains("red") && !field.classList.contains("blue")) {
            for (const cell of field.children) {
                if (checkPlaceable(cell, field)) {
                    availableMoves.push({ cell, field });
                }
            }
        }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Hard AI: Tries to block the opponent or win
function getStrategicMove() {
    // Try to win or block the opponent
    for (const field of Fields) {
        if (!field.classList.contains("red") && !field.classList.contains("blue")) {
            for (const cell of field.children) {
                if (checkPlaceable(cell, field)) {
                    cell.classList.add(Players[current_turn].color_name);
                    const isWinningMove = isWinning(field);
                    cell.classList.remove(Players[current_turn].color_name);
                    if (isWinningMove) return { cell, field };
                }
            }
        }
    }
    return getRandomMove(); // Fallback to a random move
}

function isWinning(field) {
    const checked_cells = Array.from(field.children).map((cell) => cell.classList.contains(Players[current_turn].color_name));
    return checked_cells[0] && checked_cells[1] && checked_cells[2] ||
        checked_cells[3] && checked_cells[4] && checked_cells[5] ||
        checked_cells[6] && checked_cells[7] && checked_cells[8] ||
        checked_cells[0] && checked_cells[3] && checked_cells[6] ||
        checked_cells[1] && checked_cells[4] && checked_cells[7] ||
        checked_cells[2] && checked_cells[5] && checked_cells[8] ||
        checked_cells[0] && checked_cells[4] && checked_cells[8] ||
        checked_cells[2] && checked_cells[4] && checked_cells[6];
}