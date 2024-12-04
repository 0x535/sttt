import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const Game = document.getElementById("game");
const Fields = document.getElementsByClassName("field");
const Cells = document.getElementsByClassName("cell");
const TurnTextTop = document.getElementById("turnt");
const TurnTextBottom = document.getElementById("turnb");
const StartButton = document.getElementById("start-button");
const Menu = document.getElementById("menu");
const Stats = document.getElementById("stats");
const ResetButton = document.getElementById("reset-button");
const HomeButton = document.getElementById("home-button");
const StatsButton = document.getElementById("stats-button");

// Player properties
const Players = [
    { symbol: "■", color: "rgb(0, 106, 255)", color_name: "blue" },
    { symbol: "■", color: "red", color_name: "red" }
];

// Game state
let current_turn = Math.round(Math.random());
let win = false;
let playing = false;
let startTime;

// Start the game
StartButton.addEventListener("click", () => {
    showGame();
    resetGameState();
});

ResetButton.addEventListener("click", resetGame);
HomeButton.addEventListener("click", goToHome);
StatsButton.addEventListener("click", showStats);

// Add event listeners for each cell
for (const cell of Cells) {
    cell.addEventListener("click", () => {
        if (!playing) return;
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

            // TODO: Check draw condition
        }

        if (win) {
            const winner = Players[opposite(current_turn)];
            const endTime = new Date();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            setTurnText(`🏆 <span style="color:${winner.color};">${winner.symbol}</span> 🏆`);
            Stats.innerHTML = `
                <p><b>Winner:</b> <span style="color:${winner.color};">${winner.color_name}</span></p>
                <p><b>Squares won by color:</b> ${calculateSquaresWon()}</p>
                <p><b>Time taken:</b> ${duration} seconds</p>
            `;
            removeTemporaryClasses();
            confetti();
            playing = false;
            Menu.style.display = "flex"; // Show reset/home/stats buttons
        }
    }
}

function resetGame() {
    resetGameState();
    showGame();
}

function goToHome() {
    hideGame();
    Menu.style.display = "none";
    StartButton.style.display = "block";
}

function showStats() {
    Stats.style.display = "block";
    Menu.style.display = "none";
}

function resetGameState() {
    current_turn = Math.round(Math.random());
    win = false;
    playing = true;
    startTime = new Date();
    setTurnText(getTurnText(Players[current_turn].symbol, Players[current_turn].color));
    for (const cell of Cells) cell.className = "cell";
    for (const field of Fields) field.className = "field";
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

function showGame() {
    Game.style.display = "grid";
    TurnTextTop.style.display = "block";
    TurnTextBottom.style.display = "block";
    Menu.style.display = "none";
    Stats.style.display = "none";
}

function hideGame() {
    Game.style.display = "none";
    TurnTextTop.style.display = "none";
    TurnTextBottom.style.display = "none";
    Stats.style.display = "none";
}

function calculateSquaresWon() {
    let redCount = 0, blueCount = 0;
    for (const field of Fields) {
        if (field.classList.contains("red")) redCount++;
        if (field.classList.contains("blue")) blueCount++;
    }
    return `Red: ${redCount}, Blue: ${blueCount}`;
}

TurnTextTop.addEventListener("click", randomPlace);
TurnTextBottom.addEventListener("click", randomPlace);

function randomPlace() {
    const random_field = Game.children[Math.floor(Math.random() * 9)];
    const random_cell = random_field.children[Math.floor(Math.random() * 9)];
    if (checkPlaceable(random_cell, random_field)) play(random_cell, random_field);
    else randomPlace();
}