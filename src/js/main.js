import * as logic from "./logic.js";
import * as ui from "./ui.js";
let gameState;
let sd = "easy"; //selected difficulty
/*
        board: null,
        solution: null,
        hintsLeft: 3,
        errors: 0,
        solving: false,
        cancelSolve: false,
        difficulty: difficulty,
        emptySpaces: 0
*/
function initializeGame(sd) {
    gameState = logic.createGame(sd);
    gameState.solution = logic.generateBoard(); //in the future handle this server side
    gameState.board = logic.addEmptySpaces(gameState.solution);
}
function resetGame(sd)  {
    initializeGame(sd);
    gameState.errors = 0;
    gameState.hintsLeft = 3;
    ui.setErrorCount(gameState.errors);
    ui.resetBoardElements(gameState.board);
    ui.clearTiles();
    console.log(`game reset: ${81 - gameState.emptySpaces} starting tiles`);
}
window.onload = function() {
    initializeGame(sd);
    ui.makeSelectableNumbers();
    ui.createBoardElements(gameState.board);
    document.getElementById("easy").classList.add("easy-clicked");
    setGame();
}