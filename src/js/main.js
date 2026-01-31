import * as logic from "./logic.js";
import * as ui from "./ui.js";
let gameState;

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
        case "hint":    {
            giveHint();
            break;
        }
        case "solve":
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
    if(!gameState.lastSelected) {
        select(obj);
        gameState.lastSelected = obj;
        return;
    }
    if(isSameSelection(gameState.lastSelected, obj)) {
        deselect(obj);
        gameState.lastSelected = null;
        return;
    }
    if(gameState.lastSelected.type === obj.type)    {
        deselect(gameState.lastSelected);
        select(obj);
        gameState.lastSelected = obj;
        return;
    }
    const move = getMove(obj, gameState.lastSelected);
    if(!move || gameState.board[move.r][move.c] != 0)    { return; } //in the future add a log for this somehow
    if(logic.isCorrectMove(gameState, move.r, move.c, move.num))    {
        applyMove(gameState, move.r, move.c, move.num);
        deselect(gameState.lastSelected);
        gameState.lastSelected = null;
        gameState.emptySpaces -= 1;
        if(gameState.emptySpaces == 0)    {
            const totalTime = Math.floor((performance.now() - gameState.startTime) / 1000); //ms to s, no magic numbers here
            ui.showVictory(totalTime, gameState.errors);
        }
        if(gameState.activeHint && gameState.activeHint.r === move.r && gameState.activeHint.c == move.c)   {
            killActiveHint();
        }
        return;
    } else {
        gameState.errors += 1;
        ui.setErrorCount(gameState.errors);
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
function getMove(obj1, obj2)    {
    const tile = obj1.type === "tile" ? obj1 : obj2;
    if(gameState.board[tile.r][tile.c] != 0)    { return null; }
    const number = obj1.type === "number" ? obj1 : obj2;
    return { r: tile.r, c: tile.c, num: number.num };
}
function applyMove(gameState, r, c, num)   {
    gameState.board[r][c] = num;
    if(num !== 0)    {
        ui.updateTile(r, c, num);
    } else {
        ui.updateTile(r, c, "");
    }
}
function killActiveHint()   {
    ui.clearHints();
    ui.removeHintPopupElement();
    gameState.activeHint = null;
}

function giveHint() {
    const obj = logic.bestCell(gameState.board, "min");
    if(!gameState.activeHint && gameState.hintsLeft > 0 && obj) { //if bestCell failed obj will = null
        gameState.activeHint = { r: obj.r, c: obj.c};
        ui.setTileHint(obj.r, obj.c, true);
        ui.createHintPopupElement(obj.r + 1, obj.c + 1, obj.candidates); //in the future when i implement debug mode make it so these do not have the plus ones
        gameState.hintsLeft -= 1;
        ui.setHintCount(gameState.hintsLeft);
    }
}
async function autoSolve()  {
    if(gameState.solving == true)   { return; }
    ui.setButtonDisabled("solve", true);  //passing "solve" could be buggy in the future if i rename it 0.o
    ui.clearHints();
    gameState.activeHint = null;
    gameState.solving = true;
    try {
        const solved = await recSolve();
        if (!solved) {
            throw new Error("recSolve failed");
        }
    } finally {
        gameState.solving = false;
        ui.setButtonDisabled("solve", false);
    }
}
async function recSolve()   {
    let obj = logic.bestCell(gameState.board, "min");
    if(!obj)    { return true; }
    let {r, c, candidates} = obj;
    for (const num of candidates) {
        applyMove(gameState, r, c, num);
        ui.setTileAutoSolved(r, c, true);

        await new Promise(res => setTimeout(res, 0));
        if (await recSolve()) { return true; }

        applyMove(gameState, r, c, 0)
        ui.setTileAutoSolved(r, c, false);
    }
    return false;
}

function initializeGame(difficulty) {
    gameState = logic.createGame(difficulty);
    gameState.solution = logic.generateBoard(); //in the future handle this server side maybe?
    //console.log(gameState.solution);
    //gameState.board = logic.addEmptySpaces(gameState.solution, gameState.difficulty);

    /*for testing victory*/
    gameState.board = gameState.solution.map(row => row.slice());
    gameState.board[0][0] = 0;

    gameState.emptySpaces = logic.countEmptySpaces(gameState.board);
    //console.log(gameState.board);
}
function resetGame()  {
    if(gameState.lastSelected)  {
        deselect(gameState.lastSelected);
        gameState.lastSelected = null; //should i keep this line, this property is overwritten in the very next line?
    }
    if(gameState.activeHint)    { killActiveHint(); }
    ui.removeVictoryPopup();
    initializeGame(gameState.selectedDifficulty);
    ui.setErrorCount(gameState.errors);
    ui.setHintCount(gameState.hintsLeft);
    ui.resetBoardElements(gameState.board);
    ui.clearSolved();
    console.log(`game reset: ${81 - gameState.emptySpaces} starting tiles`);
    gameState.startTime = performance.now();
}
window.onload = function() {
    initializeGame("easy");
    const callBacks = {
        onNumSelected: handleNumSelected,
        onTileSelected: handleTileSelected,
        onButtonSelected: handleButtonSelected
    }
    ui.registerHandlers(callBacks);
    ui.makeSelectableNumbers();
    ui.createBoardElements(gameState.board);
    ui.addButtonFunctionality();
    ui.setButtonClicked("easy", true);
    ui.setErrorCount(gameState.errors);
    ui.setHintCount(gameState.hintsLeft);
    gameState.startTime = performance.now();
}