import * as logic from "./logic.js";
import * as ui from "./ui.js";
let gameState;
let sd = "easy"; //selected difficulty
let ls = null; //last selected (either tile or number)

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
            ui.highlightTile(obj.r, obj.c, "addHint");
            ui.createHintPopupElement(obj.candidates);
            break;
        }
        case "easy":
        case "medium":
        case "hard":
        case "veryHard":
            ui.highlightButton(btn, "add");
            ui.highlightButton(gameState.difficulty, "remove");
            sd = btn;
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
    if(!ls) {
        select(obj);
        ls = obj;
        return;
    }
    if(isSameSelection(ls, obj)) {
        deselect(obj);
        ls = null;
        return;
    }
    if(ls.type === obj.type)    {
        deselect(ls);
        select(obj);
        ls = obj;
        return;
    }
    if(applyMoveOrUpdateErrors(ls, obj) && ls.type !== "tile")  {
        deselect(ls);
        ls = null;
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
}
function applyMoveOrUpdateErrors(obj1, obj2)    { //I feel like this might be doing too much but i really dont know how to cut it down since i need the false from checkmove to know for errors
    let tile = obj1.type === "tile" ? obj1 : obj2;
    let number = obj1.type === "number" ? obj1 : obj2;
    if(gameState.board[tile.r][tile.c] != 0)    { return; }
    if(logic.checkMove(gameState, tile.r, tile.c, number.num))    {
        gameState.board[tile.r][tile.c] = number.num;
        ui.updateTile(tile.r, tile.c, number.num);
        return;
    }
    gameState.errors += 1;
    ui.setErrorCount(gameState.errors);
}
function initializeGame(sd) {
    gameState = logic.createGame(sd);
    gameState.solution = logic.generateBoard(); //in the future handle this server side maybe?
    console.log(gameState.solution);
    gameState.board = logic.addEmptySpaces(gameState.solution, gameState.difficulty);
    gameState.emptySpaces = logic.countEmptySpaces(gameState.board);
    console.log(gameState.board);
}
function resetGame()  {
    initializeGame(sd);
    gameState.errors = 0;
    gameState.hintsLeft = 3;
    if(ls)  {
        deselect(ls);
        ls = null;
    }
    ui.setErrorCount(gameState.errors);
    ui.resetBoardElements(gameState.board);
    ui.clearTiles();
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
}