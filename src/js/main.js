import * as logic from "./logic.js";
import * as ui from "./ui.js";
let gameState;
let lastSelected = null; //last selected (either tile or number)

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
    if(gameState.solving)   {
        console.log(`Auto solve active, button press blocked`);
        return;
    }
    switch(btn) {
        case "reset":
            resetGame();
            break;
        case "hint":    { //should i put all this logic in its own function like I do for solve?
            const obj = logic.bestCell(gameState.board, "min");
            if(!gameState.activeHint && gameState.hintsLeft > 0 && obj.r)  { //if bestCell failed it will return an object with r: null
                gameState.activeHint = true;
                ui.setTileHint(obj.r, obj.c, true);
                ui.createHintPopupElement(obj.r + 1, obj.c + 1, obj.candidates); //if debug mode is on make it so these do not have the plus ones
                gameState.hintsLeft -= 1;
                ui.setHintCount(gameState.hintsLeft);
            }
            break;
        }
        case "solve":
            ui.setButtonDisabled(btn, true);
            autoSolve();
            break;
        case "easy":
        case "medium":
        case "hard":
        case "veryHard":
            if(gameState.difficulty !== btn)    {
                ui.setButtonClicked(btn, true);
                ui.setButtonClicked(gameState.difficulty, false);
                gameState.selectedDifficulty = btn;
                resetGame();    //i might update this logic to only reset when reset is pressed explicitly
            }
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
    if(applyMoveOrUpdateErrors(lastSelected, obj) && lastSelected.type !== "tile")  { //need to replace this whole block with the helpers
        deselect(lastSelected);
        lastSelected = null;
    }
}
/** helper functions for handleSelection()
 * @param {{type: "tile", r: int, c: int} | {type: "number", num: int}} obj
 */
function select(obj)    {
    if(obj.type === "tile") { ui.setTileSelected(obj.r, obj.c, true); }
    else if(obj.type === "number")  { ui.setNumberSelected(obj.num, true); }
}
function deselect(obj)  {
    if(obj.type === "tile") { ui.setTileSelected(obj.r, obj.c, false); }
    else if(obj.type === "number")  { ui.setNumberSelected(obj.num, false); }
}
function isSameSelection(obj1, obj2)  {
    if(obj1.type === "tile" && obj2.type === "tile")    { return( obj1.r == obj2.r && obj1.c == obj2.c ); }
    if(obj1.type === "number" && obj2.type === "number")    { return( obj1.num == obj2.num ); }
    else { return false; }
}
function applyMoveOrUpdateErrors(obj1, obj2)    {
    if(gameState.board[tile.r][tile.c] != 0)    { return; }
    const number = obj1.type === "number" ? obj1 : obj2;
    if(logic.isCorrectMove(gameState, tile.r, tile.c, number.num))    {
        gameState.board[tile.r][tile.c] = number.num;
        ui.updateTile(tile.r, tile.c, number.num);
        ui.setTileHint(tile.r, tile.c, false);
        ui.removeHintPopupElement();
        gameState.activeHint = false;
        return true;
    }
    gameState.errors += 1;
    ui.setErrorCount(gameState.errors);
    return false;
}
/*function getMove(obj1, obj2)    {
    const tile = obj1.type === "tile" ? obj1 : obj2;
    if(gameState.board[tile.r][tile.c] != 0)    { return; }
    const number = obj1.type === "number" ? obj1 : obj2;
    return { r: tile.r, c: tile.c, num: number.num };
}
function validateMove(gameState, r, c, num) {
    if(logic.isCorrectMove(gameState, tile.r, tile.c, number.num))  { return true; }
    return false;
}
function applyMove(gameState, r, c, num)   {
    gameState.board[tile.r][tile.c] = number.num;
    ui.updateTile(tile.r, tile.c, number.num);
    ui.setTileHint(tile.r, tile.c, false);  // I'm thinking about combining these 3 lines into a
    ui.removeHintPopupElement();            // function called killActiveHint(), but I don't know
    gameState.activeHint = false;           // if I want to pass it r,c rather than querying
}*/


async function autoSolve()  {
    if(gameState.solving == true)   { return; }
    ui.clearHints();
    gameState.activeHint = false;
    gameState.solving = true;
    if(await recSolve())  {
        ui.setButtonDisabled("solve", false); //passing "solve" could be buggy in the future if i rename it 0.o
        gameState.solving = false;
        return;
    }
    throw new Error("error in recSolve");
}
async function recSolve()   {
    let { r, c, candidates } = logic.bestCell(gameState.board, "min");
    if (r === null || c === null)   { return true; }
    for (const num of candidates) {
        gameState.board[r][c] = num; //change this to applyMove in the future
        ui.updateTile(r, c, num);
        ui.setTileAutoSolved(r, c, true);

        await new Promise(res => setTimeout(res, 0));
        if (await recSolve()) { return true; }

        gameState.board[r][c] = 0;
        ui.updateTile(r, c, "");
        ui.setTileAutoSolved(r, c, false);
    }
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
    initializeGame(gameState.selectedDifficulty);
    gameState.errors = 0;
    gameState.hintsLeft = 3;
    if(lastSelected)  {
        deselect(lastSelected);
        lastSelected = null;
    }
    ui.setErrorCount(gameState.errors);
    ui.setHintCount(gameState.hintsLeft);
    gameState.activeHint = false;
    ui.resetBoardElements(gameState.board);
    ui.clearHints();
    ui.clearSolved();
    console.log(`game reset: ${81 - gameState.emptySpaces} starting tiles`);
}
window.onload = function() {
    initializeGame("easy");
    ui.registerHandlers({   //implement validation for these
        onNumSelected: handleNumSelected,
        onTileSelected: handleTileSelected,
        onButtonSelected: handleButtonSelected
    });
    ui.makeSelectableNumbers();
    ui.createBoardElements(gameState.board);
    ui.addButtonFunctionality();
    ui.setButtonClicked("easy", true);
    ui.setErrorCount(gameState.errors);
    ui.setHintCount(gameState.hintsLeft);
}