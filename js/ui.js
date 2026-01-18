const tilesArr = Array(9).fill().map(() => Array(9).fill(0)); const digitsArr = Array(10).fill(0);
const handlers = {
    onNumSelected: () => {},
    onTileSelected: () => {},
    onButtonSelected: () => {}
};
export function registerHandlers(h) {
    if(typeof h.onNumSelected === "function")   {
        handlers.onNumSelected = h.onNumSelected;
    }
    if(typeof h.onTileSelected === "function")  {
        handlers.onTileSelected = h.onTileSelected;
    }
    if(typeof h.onButtonSelected === "function")    {
        handlers.onButtonSelected = h.onButtonSelected;
    }
}
export function makeSelectableNumbers()    {
    for (let i=1; i<=9; i++) {
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", () => { handlers.onNumSelected(i) });
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
            tile.addEventListener("click", () => { handlers.onTileSelected(r,c) });
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
    ["reset", "easy", "medium", "hard", "veryHard", "hint", "solve"].forEach(btnId => {
        document.getElementById(btnId).addEventListener("click", () => { handlers.onButtonSelected(btnId) });
    });
}
export function setNumberSelected(num, highlight)   {
    digitsArr[num].classList.toggle("number-selected", highlight);
}
export function setTileSelected(r, c, highlight)    {
    tilesArr[r][c].classList.toggle("tile-selected", highlight);
}
export function setTileHint(r, c, highlight)    {
    tilesArr[r][c].classList.toggle("tile-hint", highlight);
}
export function setTileAutoSolved(r, c, highlight)    {
    tilesArr[r][c].classList.toggle("tile-solve", highlight);
}
export function updateTile(r, c, num)  {
    tilesArr[r][c].innerText = num;
}
export function setButtonClicked(btn, highlight)   {
    const buttonSelected = document.getElementById(btn);     buttonSelected.classList.toggle(`${btn}-clicked`, highlight);
}
export function setButtonDisabled(btn, disabled) {
    const buttonSelected = document.getElementById(btn);
    buttonSelected.disabled = disabled;
}
export function clearHints() {
    document.querySelectorAll(".tile-hint").forEach(t => t.classList.remove("tile-hint"));
    removeHintPopupElement();
}
export function clearSolved()   {
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
    const isMobile = window.matchMedia("(max-width: 750px)").matches;     if (isMobile) {
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