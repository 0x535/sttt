import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const Game = document.getElementById("game");
const Fields = document.getElementsByClassName("field");
const Cells = document.getElementsByClassName("cell");
const TurnTextTop = document.getElementById("turnt");
const TurnTextBottom = document.getElementById("turnb");

// player properties
const Players = [
    { symbol: "■", color: "rgb(0, 106, 255)", color_name: "blue" },
    { symbol: "■", color: "red", color_name: "red" }
];

// turn management
let current_turn = Math.round(Math.random());
setTurnText(getTurnText(Players[current_turn].symbol, Players[current_turn].color));

// win condition
let win = false;
let playing = true;

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

            // check local win condition
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

            // check global win condition
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

            // lock fields
            removeTemporaryClasses();
            if (!Array.from(Game.children[cell_index].children).map((cell) => checkPlaceable(cell, Game.children[cell_index])).every((placeable) => placeable === false)) {
                for (const field of Fields) {
                    if (Array.from(field.parentElement.children).indexOf(field) != cell_index) {
                        field.classList.add("locked");
                    }
                }
            }

            // change turn player
            current_turn = opposite(current_turn);
            setTurnText(getTurnText(Players[current_turn].symbol, Players[current_turn].color));

            // TODO: check draw condition
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
    return `↓ <span style="color:${color};">${symbol}</span> ↓`
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
    return turn == 0 ? 1 : 0;
}

TurnTextTop.addEventListener("click", randomPlace);
TurnTextBottom.addEventListener("click", randomPlace);

function randomPlace() {
    const random_field = Game.children[Math.floor(Math.random() * 9)];
    const random_cell = random_field.children[Math.floor(Math.random() * 9)];
    if (checkPlaceable(random_cell, random_field)) play(random_cell, random_field);
    else randomPlace();
}
