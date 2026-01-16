import * as logic from "./logic.js";
import * as ui from "./ui.js";
let gameState;
let selectedDifficulty = "easy";
let lastSelected = null; //last selected (either tile or number)
let activeHint = false; //messy fix to hint button spam

function handleNumSelected(num)    {
    console.log(`Number Selected: ${num}`);
    handleSelection({type: "number", num: num});
}
function handleTileSelected(r,c)    {
    console.log(`Tile Selected: ${r}-${c}`);
    handleSelection({type: "tile", r: r, c: c});
}
function handleButtonSelected(btn)  {
    console.log(`Button Selected: ${btn}`);
    switch(btn) {
        case "reset":
            resetGame();
            break;
        case "hint":    {
            const obj = logic.bestCell(gameState.board, "min");
            if(!activeHint && gameState.hintsLeft > 0 && obj.candidates)  { //if bestCell failed it will return an object with candidates: [] which is falsy
                activeHint = true;
                ui.highlightTile(obj.r, obj.c, "addHint");
                ui.createHintPopupElement(obj.r + 1, obj.c + 1, obj.candidates); //if debug mode is on make it so these do not have the plus ones
                gameState.hintsLeft -= 1;
                ui.setHintCount(gameState.hintsLeft);
            }
            break;
        }
        case "easy":
        case "medium":
        case "hard":
        case "veryHard":
            ui.highlightButton(btn, "add");
            ui.highlightButton(gameState.difficulty, "remove");
            selectedDifficulty = btn;
            resetGame();    //i might update this logic to only reset when reset is pressed explicitly
            break;
        default:
            throw new Error(`Invalid button: ${btn}`);
    }
}

/** function that is called when the sudoku tiles or numbers are clicked
 * @param {{type: "tile", r: int, c: int} | {type: "number", num: int}} obj
 */
function handleSelection(obj)   {
    if(!lastSelected) {
        select(obj);
        lastSelected = obj;
        return;
    }
    if(isSameSelection(lastSelected, obj)) {
        deselect(obj);
        lastSelected = null;
        return;
    }
    if(lastSelected.type === obj.type)    {
        deselect(lastSelected);
        select(obj);
        lastSelected = obj;
        return;
    }
    if(applyMoveOrUpdateErrors(lastSelected, obj) && lastSelected.type !== "tile")  {
        deselect(lastSelected);
        lastSelected = null;
    }
}
/** helper functions for handleSelection()
 * @param {{type: "tile", r: int, c: int} | {type: "number", num: int}} obj
 */
function select(obj)    {
    if(obj.type === "tile") { ui.highlightTile(obj.r, obj.c, "add"); }
    else if(obj.type === "number")  { ui.highlightNumber(obj.num, "add"); }
}
function deselect(obj)  {
    if(obj.type === "tile") { ui.highlightTile(obj.r, obj.c, "remove"); }
    else if(obj.type === "number")  { ui.highlightNumber(obj.num, "remove"); }
}
function isSameSelection(obj1, obj2)  {
    if(obj1.type === "tile" && obj2.type === "tile")    { return( obj1.r == obj2.r && obj1.c == obj2.c ); }
    if(obj1.type === "number" && obj2.type === "number")    { return( obj1.num == obj2.num ); }
    else { return false; }
}
function applyMoveOrUpdateErrors(obj1, obj2)    { //I feel like this might be doing too much but i really dont know how to cut it down since i need the false from checkmove to know for errors
    const tile = obj1.type === "tile" ? obj1 : obj2;
    if(gameState.board[tile.r][tile.c] != 0)    { return; }
    const number = obj1.type === "number" ? obj1 : obj2;
    if(logic.checkMove(gameState, tile.r, tile.c, number.num))    {
        gameState.board[tile.r][tile.c] = number.num;
        ui.updateTile(tile.r, tile.c, number.num);
        ui.highlightTile(tile.r, tile.c, "removeHint");
        activeHint = false; //messy fix idk what else to do
        ui.removeHintPopupElement();
        return true;
    }
    gameState.errors += 1;
    ui.setErrorCount(gameState.errors);
    return false;
}

function initializeGame(difficulty) {
    gameState = logic.createGame(difficulty);
    gameState.solution = logic.generateBoard(); //in the future handle this server side maybe?
    //console.log(gameState.solution);
    gameState.board = logic.addEmptySpaces(gameState.solution, gameState.difficulty);
    gameState.emptySpaces = logic.countEmptySpaces(gameState.board);
    //console.log(gameState.board);
}
function resetGame()  {
    initializeGame(selectedDifficulty);
    gameState.errors = 0;
    gameState.hintsLeft = 3;
    if(lastSelected)  {
        deselect(lastSelected);
        lastSelected = null;
    }
    ui.setErrorCount(gameState.errors);
    ui.setHintCount(gameState.hintsLeft);
    activeHint = false;
    ui.resetBoardElements(gameState.board);
    ui.clearHints();
    console.log(`game reset: ${81 - gameState.emptySpaces} starting tiles`);
}
window.onload = function() {
    initializeGame("easy");
    ui.registerHandlers({ //should i name this object?
        onNumSelected: handleNumSelected,
        onTileSelected: handleTileSelected,
        onButtonSelected: handleButtonSelected
    })
    ui.makeSelectableNumbers();
    ui.createBoardElements(gameState.board);
    ui.addButtonFunctionality();
    ui.highlightButton("easy", "add");
    ui.setHintCount(gameState.hintsLeft);
}