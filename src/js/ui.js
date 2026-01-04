export {
    registerHandlers,
    createHintPopupElement,
    resetBoardElements,
    createBoardElements,
    makeSelectableNumbers,
    addButtonFunctionality,
    setErrorCount,
    clearTiles,
    highlightNumber,
    highlightTile,
    updateTile,
    highlightButton
};

let onNumSelected;
let onTileSelected;
let onButtonSelected;

function registerHandlers(handlers)   {
    onNumSelected = handlers.onNumSelected;
    onTileSelected = handlers.onTileSelected;
    onButtonSelected = handlers.onButtonSelected;
}

function createHintPopupElement(nums) {
    const hint = document.getElementById("hint");
    const rect = hint.getBoundingClientRect();

    const popup = document.createElement("div");
    popup.id = "hint-popup";
    popup.classList.add("hint-popup");

    popup.style.left = `${rect.right + window.scrollX + 8}px`;

    popup.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
    popup.style.transform = "translateY(-50%)";

    popup.textContent = `Can only be ${nums}`;

    popup.addEventListener("click", () => popup.remove());
    document.body.appendChild(popup);
}


function makeSelectableNumbers()    {
    for (let i=1; i<=9; i++) {
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", () => {
            if(onNumSelected)   {
                onNumSelected(i);
            }
        });
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }
}

function createBoardElements(board)  {
    for (let r=0; r<9; r++) {
        for (let c=0; c<9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            if(board[r][c] != 0)  {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }
            if(r==2 || r==5)    {
                tile.classList.add("horizontal-line");
            }
            if(c==2 || c==5)    {
                tile.classList.add("vertical-line");
            }
            tile.addEventListener("click", () => {
                if(onTileSelected)   {
                    onTileSelected(r,c);
                }
            });
            tile.classList.add("tile");
            document.getElementById("board").appendChild(tile);
        }
    }
}
function resetBoardElements(board)   {
    for (let r=0; r<9; r++) {
        for (let c=0; c<9; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());

            if(board[r][c] != 0)  {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            } else {
                tile.innerText = "";
                tile.classList.remove("tile-start");
            }
        }
    }
}
function addButtonFunctionality() {
    ["reset","easy", "medium", "hard", "veryHard", "hint", "solve"].forEach(button => {
        document.getElementById(button).addEventListener("click", () => {
            if(onButtonSelected)    {
                onButtonSelected(button);
            }
        });
    });
}

/**
 * @param {int} num
 * @param {"add"|"remove"} operation
 */
function highlightNumber(num, operation)   {
    let numSelected = document.getElementById(num.toString());
    if(operation === "add") { numSelected.classList.add("number-selected"); }
    else if(operation === "remove") { numSelected.classList.remove("number-selected"); }
    return;
}
function highlightTile(r, c, operation) {
    let tileSelected = document.getElementById(`${r}-${c}`);
    if(operation === "add") { tileSelected.classList.add("tile-selected"); }
    if(operation === "remove") { tileSelected.classList.remove("tile-selected"); }
    if(operation === "addHint") { tileSelected.classList.add("tile-hint"); }
    return;
}

function updateTile(r, c, num)  {
    document.getElementById(`${r}-${c}`).innerText = num;
}
function clearTiles() {
    document.querySelectorAll(".tile-hint").forEach(t => t.classList.remove("tile-hint"));
    document.querySelectorAll(".tile-solve").forEach(t => t.classList.remove("tile-solve"));
}
function setErrorCount(num)  {
    document.getElementById("errors").innerText = num;
}
function highlightButton(button, operation)   {
    let buttonSelected = document.getElementById(button);
    if(operation === "add") { buttonSelected.classList.add(`${button}-clicked`); }
    else if(operation === "remove") { buttonSelected.classList.remove(`${button}-clicked`); }
    return;
}