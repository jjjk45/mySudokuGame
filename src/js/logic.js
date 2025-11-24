function createGame() {
    return {
        board: null,
        solution: null,
        hintsLeft: 3,
        errors: 0,
        solving: false,
        cancelSolve: false,
        difficulty: "easy",
        emptySpaces: 0
    };
}

/**
 * @param {int[][]} arr - array to shuffle
 * @returns void - shuffles the array in place
 */
function shuffle(arr)  {
    for(let i = arr.length - 1; i > 0; i--) {
        let j = ~~(Math.random() * (i + 1)); //faster way to truncate/floor in js, I might remove
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

/**
 * @param {int[][]} brd - the board matrix you pass in
 * @param {"min" | "max"} mode - the heuristic, minimum remaining value or maximum
 * @returns row, column, int[] - object that contains the best cell location and the number of possible valid entries/candidates
 * @abstract NO CHECKING IF THERE ISN'T ANY EMPTY CELLS SHOULD CHECK FOR THAT WHEN FUNCTION IS CALLED
 * @abstract doesn't check if board is 9x9 but row and column array checks are hardcoded for a 9x9 board hmmm
 */
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
        console.error(`Unknown mode "${mode}" in bestCell(), defaulting to "min"`);
        bestCount = 10;
        mode = "min"; //reset mode to avoid confusion later
    }

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
                    if(bestCount === 1) { return best }; //early exit :)
                }
                else if(mode==="max" && candidates.length > bestCount) {
                    bestCount = candidates.length;
                    best = {r, c, candidates: candidates.slice() };
                }
            }
        }
    }
    return best;
}

/**
 * @param {int[][]} brd - the board matrix you pass in
 * @param {int} row - current row
 * @param {int} col - current column
 * @returns boolean - true if board was filled, false if not
 */
function fillRandomBoard(brd, row = 0, col = 0) {
    if(row==9)  { return true;  }  //base case
    if(col==9)  { return fillRandomBoard(brd, row+1, 0);    }
    if(brd[row][col] != 0)    { return fillRandomBoard(brd, row, col+1);  }

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(nums);

    for(const num of nums) {
        if(isValid(brd, row, col, num))   {
            brd[row][col] = num;
            if(fillRandomBoard(brd, row, col+1)) { return true; }    //recurse
            brd[row][col] = 0;    //backtrack
        }
    }
    return false;
}

function isValid(brd, row, col, num)  {
    for(let c=0; c<9; c++)  {
        if (brd[row][c] == num) return false;
    }
    for(let r=0; r<9; r++)  {
        if (brd[r][col] == num) return false;
    }
    const boxRow = ~~(row/3)*3;
    const boxCol = ~~(col/3)*3;
    for(let r=0; r<3; r++) {
        for(let c=0; c<3; c++) {
            if (brd[boxRow + r][boxCol + c] == num) return false;
        }
    }
    return true;
}
function countSolutions(brd) {
    let { r, c, candidates } = bestCell(brd, "min");
    if (r === null) { return 1; }

    let total = 0;
    for (let num of candidates) {
        brd[r][c] = num;
        total += countSolutions(brd);
        if (total > 1) {
            brd[r][c] = 0;
            return total;
        }
        brd[r][c] = 0; // backtrack
    }
    return total;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createGame,
        shuffle,
        bestCell,
        fillRandomBoard,
        isValid,
        countSolutions
    };
}