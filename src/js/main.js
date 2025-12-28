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
function handleButtonSelected(str)  {
    console.log(`Button Selected: ${str}`);
}

/**
 * @param {{type: "tile", r: int, c: int} | {type: "number", num: int}} obj
 */
function handleSelection(obj)   {
    if(!ls) {
        select(obj);
        ls = obj;
        return;
    }
    if(isSameSelection(ls,obj)) {
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
    applyMoveOrUpdateErrors(ls, obj);
    deselect(ls);
    ls = null;
}
//helpers
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
    if(obj1.type === "number" && obj2.type === "tile")  {
        if(logic.checkMove(gameState, obj2.r, obj2.c, obj1.num))    {
            gameState.board[obj2.r][obj2.c] = obj1.num;
            ui.updateTile(obj2.r, obj2.c, obj1.num);
            return;
        }
    }
    if(obj1.type === "tile" && obj2.type === "number")  {
        if(logic.checkMove(gameState, obj1.r, obj1.c, obj2.num))    {
            gameState.board[obj1.r][obj1.c] = obj2.num;
            ui.updateTile(obj1.r, obj1.c, obj2.num);
            return;
        }
    }
    gameState.errors += 1;
    ui.setErrorCount(gameState.errors);
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