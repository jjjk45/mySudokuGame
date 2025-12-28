import * as logic from "./logic.js";
import * as ui from "./ui.js";
let gameState;
let sd = "easy"; //selected difficulty
let ls = null; //last selected (either tile or number)

function handleNumSelected(num)    {
    console.log(`Number Selected: ${num}`);
    lastSelectedHelper({num:num, r:null, c:null});
}
function handleTileSelected(r,c)    {
    console.log(`Tile Selected: ${r}-${c}`);
    lastSelectedHelper({num:null, r:r, c:c});
}
function handleButtonSelected(str)  {
    console.log(`Button Selected: ${str}`);
}

/**
 * @param {{num: int|null, r: int|null, c: int|null}} obj
 */
function lastSelectedHelper(obj)  {
    console.log(ls);
    if(!ls)  {
        ls = obj;
        if(obj.num) { ui.highlightNumber(obj.num, "add"); }
        else {ui.highlightTile(obj.r, obj.c, "add"); }
        return;
    }
    if(logic.sameNumberAndTileObject(ls, obj))   {
        ls = null;
        if(obj.num) { ui.highlightNumber(obj.num, "remove"); }
        else { ui.highlightTile(obj.r, obj.c, "remove"); }
        return;
    }
    if(logic.bothNumberOrBothTileObject(ls, obj))    {
        if(obj.num) {
            ui.highlightNumber(ls.num, "remove");
            ui.highlightNumber(obj.num, "add");
        }
        else {
            ui.highlightTile(ls.r, ls.c, "remove");
            ui.highlightTile(obj.r, obj.c, "add");
        }
        ls = obj;
        return;
    }
    if(ls.num && !obj.num)  {   //last selected is a number, the object is a tile
        if(logic.makeMove(gameState, obj.r, obj.c, ls.num)) {
            gameState.board[obj.r][obj.c] = ls.num;
            ui.updateTile(obj.r, obj.c, ls.num);
        }
        else {
            gameState.errors += 1;
            ui.setErrorCount(gameState.errors);
        }
        ui.highlightNumber(ls.num, "remove");
        ui.highlightTile(obj.r, obj.c, "remove");
        ls = null;
    }
    else { //last selected is a tile, the object is a number
        logic.makeMove(gameState, ls.r, ls.c, obj.num);
        if(logic.makeMove(gameState, ls.r, ls.c, obj.num)) {
            gameState.board[ls.r][ls.c] = obj.num;
            ui.updateTile(ls.r, ls.c, obj.num);
        }
        else {
            gameState.errors += 1;
            ui.setErrorCount(gameState.errors);
        }
        ui.highlightNumber(obj.num, "remove");
        ui.highlightTile(ls.r, ls.c, "remove");
        ls = null;
    }
}

function initializeGame(sd) {
    gameState = logic.createGame(sd);
    gameState.solution = logic.generateBoard(); //in the future handle this server side
    console.log(gameState.solution);
    gameState.board = logic.addEmptySpaces(gameState.solution, gameState.difficulty);
    gameState.emptySpaces = logic.countEmptySpaces(gameState.board);
    console.log(gameState.board);
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
    ui.registerHandlers({
        onNumSelected: handleNumSelected,
        onTileSelected: handleTileSelected,
        onButtonSelected: handleButtonSelected
    })
    ui.makeSelectableNumbers();
    ui.createBoardElements(gameState.board);
    ui.addButtonFunctionality();
    document.getElementById("easy").classList.add("easy-clicked"); //maybe remove or add to ui.js
}
