let numSelected = null;
let prevTileSelected = null;
let tileSelected = null;
let difficulty = ""; let emptySpaces = 0;

let hintsLeft = 3;
let errors = 0;
let solution;
let board;

let solving = false;
let cancelSolve = false;

function shuffle(arr)  {
    for(let i = arr.length - 1; i > 0; i--) {
        let j = ~~(Math.random() * (i + 1));         let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
function fillRandomBoard(board, row = 0, col = 0) {     if(row==9)  { return true;  }      if(col==9)  { return fillRandomBoard(board, row+1, 0);    }
    if(board[row][col] != 0)    { return fillRandomBoard(board, row, col+1);  }

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(nums);

    for(const num of nums) {
        if(isValid(board, row, col, num))   {
            board[row][col] = num;
            if(fillRandomBoard(board, row, col+1)) { return true; }                board[row][col] = 0;            }
    }
    return false;
}
function isValid(board, row, col, num)  {
        for(let c=0; c<9; c++)  {
        if (board[row][c] == num) return false;
    }
        for(let r=0; r<9; r++)  {
        if (board[r][col] == num) return false;
    }
        const boxRow = ~~(row/3)*3;
    const boxCol = ~~(col/3)*3;
    for(let r=0; r<3; r++) {
        for(let c=0; c<3; c++) {
            if (board[boxRow + r][boxCol + c] == num) return false;
        }
    }
    return true;
}
function countSolutions(board) {
    let { r, c, candidates } = bestCell(board, "min");
    if (r === null) { return 1; }

    let total = 0;
    for (let num of candidates) {
        board[r][c] = num;
        total += countSolutions(board);
        if (total > 1) {
            board[r][c] = 0;
            return total;
        }
        board[r][c] = 0;     }
    return total;
}
function addEmptySpaces(board)  {
    const newBoard = board.map(row => row.slice());
    const positions = [];
    for(let r=0; r<9; r++)  {
        for(let c=0; c<9; c++)  {
            positions.push({r,c});
        }
    }
    shuffle(positions);
    emptySpaces = 0
    const difficultyValues = {
        easy: 45,
        medium: 37,
        hard: 29,
        veryHard: 17     }
    let tilesToKeep = 81 - difficultyValues[difficulty];
    while(emptySpaces<tilesToKeep && positions.length>0)  {
        let pos = positions.pop();
        let row = pos.r, col = pos.c;
        newBoard[row][col] = 0;
        if(countSolutions(newBoard.map(row => row.slice())) == 1)    {
            emptySpaces++;
        } else  {
            newBoard[row][col] = board[row][col];
        }
    }
    return newBoard;
}
function bestCell(brd, mode)  {
    let best = { r: null, c: null, candidates : [] };
    if(!brd)    {
        console.error('board error in bestCell()');
        return best;
    }
    let bestCount;
    if(mode === "min")  {
        bestCount = 10;
    } else if(mode === "max")  {
        bestCount = 0;
    } else {
        console.warn(`Unknown mode "${mode}" in bestCell(), defaulting to "min"`);
        bestCount = 10;
        mode = "min";     }

    for(let r=0; r<9; r++)  {
        for(let c=0; c<9; c++)  {
            if(brd[r][c]===0)  {
                let candidates = [];

                for(let i=1; i<=9; i++) {
                    if(isValid(brd, r, c, i))   {
                        candidates.push(i);
                    }
                }
                if(mode==="min" && candidates.length < bestCount) {
                    bestCount = candidates.length;
                    best = { r, c, candidates: candidates.slice() };
                    if(bestCount === 1) { return best };                 }
                else if(mode==="max" && candidates.length > bestCount) {
                    bestCount = candidates.length;
                    best = {r, c, candidates: candidates.slice() };
                }
            }
        }
    }
    return best;
}
function giveHint() {
    if(hintsLeft < 1)   { return; }
    hintsLeft -= 1;
    let { r, c, candidates } = bestCell(board,"min");     console.log(`${r}-${c} can only be ${candidates}`);     let tile = document.getElementById(r.toString() + "-" + c.toString());
    tile.classList.add("tile-hint");
    return;
}
function clearTiles() {
    document.querySelectorAll(".tile-hint").forEach(t => t.classList.remove("tile-hint"));
    document.querySelectorAll(".tile-solve").forEach(t => t.classList.remove("tile-solve"));
}


async function autoSolve() {
    if(cancelSolve == true) { return false; }
    let { r, c, candidates } = bestCell(board, "min");
    if (r === null || c === null) return true;

    for (const num of candidates) {
        board[r][c] = num;
        document.getElementById(`${r}-${c}`).innerText = num;
        document.getElementById(`${r}-${c}`).classList.add("tile-solve");

        await new Promise(res => setTimeout(res, 0));

        if (await autoSolve()) { return true; }

        board[r][c] = 0;
        document.getElementById(`${r}-${c}`).innerText = "";
        document.getElementById(`${r}-${c}`).classList.remove("tile-solve");
    }
    return false;
}


function generateBoard()    {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    fillRandomBoard(board);
    return board;
}

window.onload = function() {
    difficulty = "easy";
    document.getElementById("easy").classList.add("easy-clicked");
    setGame();
}

function setGame()  {
    solution = generateBoard();
        board = addEmptySpaces(solution);
        for (let i=1; i<=9; i++) {
                let number = document.createElement("numb");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

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
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").appendChild(tile);
        }
    }
        document.getElementById("easy").addEventListener("click", setDifficulty);
    document.getElementById("medium").addEventListener("click", setDifficulty);
    document.getElementById("hard").addEventListener("click", setDifficulty);
    document.getElementById("veryHard").addEventListener("click", setDifficulty);
    document.getElementById("hint").addEventListener("click", giveHint);
    document.getElementById("solve").addEventListener("click", async () => {
        if(solving) { return; }
        solving = true;
        cancelSolve = false;
        document.getElementById("solve").disabled = true;
        await autoSolve();
        solving = false;
        document.getElementById("solve").disabled = false;
    });

    console.log(`game set: ${81-emptySpaces} starting tiles`);
}

function resetGame()  {
    solution = generateBoard();
        board = addEmptySpaces(solution);
    errors = 0;
    hintsLeft = 3;
    document.getElementById("errors").innerText = errors;

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

    clearTiles();
    console.log(`game reset: ${81 - emptySpaces} starting tiles`);
}

function selectNumber() {
    if(numSelected!=null)   {
        numSelected.classList.remove("number-selected");
    }
    if(numSelected == this)  {
        numSelected = null;
        return;
    }
    numSelected = this;
    numSelected.classList.add("number-selected");
    }

function selectTile()   {
    if(numSelected) {
        prevTileSelected = tileSelected;
        tileSelected = this;
        if (this.innerText!="") { return; }
                const coords = this.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if(solution[r][c] == numSelected.id)    {
            this.innerText = numSelected.id;
            board[r][c] = numSelected.id;
        } else if(tileSelected != prevTileSelected) {
            errors += 1;
            document.getElementById("errors").innerText = errors;
        }
        clearTiles();
    }
    return;
}

function setDifficulty()    {
    let newDifficulty = this.id;
    if(newDifficulty != difficulty) {
        document.getElementById(difficulty).classList.remove(difficulty + "-clicked");
        document.getElementById(newDifficulty).classList.add(newDifficulty + "-clicked");
        difficulty = newDifficulty;
        resetGame();
    }
}
