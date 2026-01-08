export {
    registerHandlers,
    createHintPopupElement,
    removeHintPopupElement,
    resetBoardElements,
    createBoardElements,
    makeSelectableNumbers,
    addButtonFunctionality,
    setErrorCount,
    clearHints,
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

function createHintPopupElement(r, c, nums) {
    if(document.getElementById("hint-popup"))   { return; }
    const hint = document.getElementById("hint");
    const rect = hint.getBoundingClientRect();
    const popup = document.createElement("div");
    popup.id = "hint-popup";
    popup.classList.add("hint-popup");

    const isMobile = window.matchMedia("(max-width: 750px)").matches; //will change later
    if (isMobile) {
        popup.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        popup.style.top = `${rect.bottom + window.scrollY + 8}px`;
        popup.style.transform = "translateX(-50%)";
    } else {
        popup.style.left = `${rect.right + window.scrollX + 8}px`;
        popup.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
        popup.style.transform = "translateY(-50%)";
    }
    popup.textContent = `Tile ${r}-${c} can only be ${nums}`;
    document.body.appendChild(popup);
}
function removeHintPopupElement()  {
    if(document.getElementById("hint-popup"))   {
        document.getElementById("hint-popup").remove();
    }
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
}
function highlightTile(r, c, operation) {
    const tileSelected = document.getElementById(`${r}-${c}`);
    const actions = { //do this for more functions
        add: () => tileSelected.classList.add("tile-selected"),
        remove: () => tileSelected.classList.remove("tile-selected"),
        addHint: () => tileSelected.classList.add("tile-hint"),
        removeHint: () => tileSelected.classList.remove("tile-hint")
    }
    actions[operation]?.();
}

function updateTile(r, c, num)  {
    document.getElementById(`${r}-${c}`).innerText = num;
}
function clearHints() {
    document.querySelectorAll(".tile-hint").forEach(t => t.classList.remove("tile-hint"));
    removeHintPopupElement();
}
function clearSolve()   {
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