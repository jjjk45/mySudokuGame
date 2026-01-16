const tilesArr = Array(9).fill().map(() => Array(9).fill(0)); //to stop the costly getElementbyIds
const digitsArr = Array(9).fill(0);

let onNumSelected;
let onTileSelected;
let onButtonSelected;
export function registerHandlers(handlers)   {
    onNumSelected = handlers.onNumSelected;
    onTileSelected = handlers.onTileSelected;
    onButtonSelected = handlers.onButtonSelected;
}

export function makeSelectableNumbers()    {
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
        digitsArr[i] = number;
        document.getElementById("digits").appendChild(number);
    }
}
export function createBoardElements(board)  {
    for (let r=0; r<9; r++) {
        for (let c=0; c<9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tilesArr[r][c] = tile;
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
export function resetBoardElements(board)   {
    for (let r=0; r<9; r++) {
        for (let c=0; c<9; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tilesArr[r][c] = tile;
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
export function addButtonFunctionality() {
    ["reset","easy", "medium", "hard", "veryHard", "hint", "solve"].forEach(buttonText => {
        document.getElementById(buttonText).addEventListener("click", () => {
            if(onButtonSelected)    {
                onButtonSelected(buttonText);
            }
        });
    });
}

/**
 * @param {int} num
 * @param {"add"|"remove"} operation
 */
export function highlightNumber(num, operation)   {
    switch(operation)   {
        case "add":
            digitsArr[num].classList.add("number-selected");
            break;
        case "remove":
            digitsArr[num].classList.remove("number-selected");
            break;
    }
}

export function highlightTile(r, c, operation) {
    const tileSelected = tilesArr[r][c];
    switch(operation)   {
        case "add":
            tileSelected.classList.add("tile-selected");
            break;
        case "remove":
            tileSelected.classList.remove("tile-selected");
            break;
        case "addHint":
            tileSelected.classList.add("tile-hint");
            break;
        case "removeHint":
            tileSelected.classList.remove("tile-hint");
            break;
    }
}
export function updateTile(r, c, num)  {
    tilesArr[r][c].innerText = num;
}

export function highlightButton(button, operation)   {
    let buttonSelected = document.getElementById(button);
    if(operation === "add") { buttonSelected.classList.add(`${button}-clicked`); }
    else if(operation === "remove") { buttonSelected.classList.remove(`${button}-clicked`); }
    return;
}

export function clearHints() {
    document.querySelectorAll(".tile-hint").forEach(t => t.classList.remove("tile-hint"));
    removeHintPopupElement();
}
function clearSolve()   {
    document.querySelectorAll(".tile-solve").forEach(t => t.classList.remove("tile-solve"));
}
export function setErrorCount(num)  {
    document.getElementById("errors").innerText = num;
}
export function setHintCount(num)   {
    document.getElementsByClassName("hint-badge")[0].innerText = num;
}
export function createHintPopupElement(r, c, nums) {
    if(document.getElementById("hint-popup"))   { return; }
    const hint = document.getElementById("hint");
    const rect = hint.getBoundingClientRect();
    const popup = document.createElement("div");
    popup.id = "hint-popup";
    popup.classList.add("hint-popup");

    const isMobile = window.matchMedia("(max-width: 750px)").matches; //do I hoist this?
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
export function removeHintPopupElement()  {
    if(document.getElementById("hint-popup"))   {
        document.getElementById("hint-popup").remove();
    }
}