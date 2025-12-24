/**
 * @param {"easy" | "medium" | "hard" | "veryHard"} difficulty
 * @returns a gamestate object
 */
function createGame(difficulty) {
    return {
        board: null,
        solution: null,
        hintsLeft: 3,
        errors: 0,
        solving: false,
        cancelSolve: false,
        difficulty: difficulty,
        emptySpaces: 0
    };
}
/**
 * @param {int[]} arr - array to shuffle
 * @returns void - shuffles the array in place
 */
function shuffle(arr)  {
    for(let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
/**
 * @param {int[][]} brd - 9x9 Sudoku board (0 = empty, 1-9 = filled)
 * @param {int} row - row index (0-8)
 * @param {int} col - column index (0-8)
 * @param {int} num - number to check (1-9)
 * @returns boolean - true if num can be placed at brd[row][col] without violating Sudoku rules
 */
function isValid(brd, row, col, num)  {
    if(num < 1 || num > 9)  { return false; }
    for(let c=0; c<9; c++)  {
        if(brd[row][c] == num) { return false; }
    }
    for(let r=0; r<9; r++)  {
        if(brd[r][col] == num) { return false; }
    }
    const boxRow = Math.floor(row/3)*3;
    const boxCol = Math.floor(col/3)*3;
    for(let r=0; r<3; r++) {
        for(let c=0; c<3; c++) {
            if(brd[boxRow + r][boxCol + c] == num) { return false; }
        }
    }
    return true;
}
/**
 * @param {int[][]} brd - 9x9 Sudoku board (0 = empty, 1-9 = filled)
 * @param {"min" | "max"} mode - Heuristic:  "min" = cell with fewest possible candidates, "max" = cell with most possible candidates
 * @returns {{ r: int|null, c: int|null, candidates: int[] }}
 *        Object with row, column of the best cell, and array of valid candidates.
 *        If no empty cells exist, r and c are null and candidates is empty.
 * @throws will log error if mode is not "min" or "max"
 * @note doesn't check if board is 9x9 but row and column array checks are hardcoded for a 9x9 board hmmm
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
        mode = "min"; //reset mode to avoid stops
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
 * @note only creates 9x9 boards, this is hardcoded in almost everything in this program I should fix
 * @returns returns randomly filled board
 */
function generateBoard()    {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    fillRandomBoard(board);
    return board;
}
/**
 * recursively fills a random sudoku board, is called upon by generateBoard()
 * @returns boolean - true if board was filled, false if not
 * @note assumes board is valid at start, if not it will get stuck in infinite recursion
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
/**
 * counts the number of valid solutions for a Sudoku board
 * @param {number[][]} brd
 * @returns {int}
 * @note temporarily mutates the board but restores it before returning
 */
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
/**
 * adds empty spaces/masks to a full board based on the difficulty
 * @param {int[][]} brd
 * @param {"easy" | "medium" | "hard" | "veryHard"} diff
 * @returns {int[][]} a new board array with the empty spaces added
 */
function addEmptySpaces(gameState)  {
    let newState = {...gameState};
    const newBoard = newState.board.map(row => row.slice());
    const positions = [];
    for(let r=0; r<9; r++)  {
        for(let c=0; c<9; c++)  {
            positions.push({r,c});
        }
    }
    shuffle(positions);
    const difficultyValues = {
        easy: 45,
        medium: 37,
        hard: 29,
        veryHard: 17 //never seen it generate below 21 but i bet its possible
    }
    while(newState.emptySpaces<difficultyValues[newState.difficulty] && positions.length>0)  {
        let pos = positions.pop();
        let row = pos.r, col = pos.c;
        newBoard[row][col] = 0;
        if(countSolutions(newBoard.map(row => row.slice())) == 1)    {
            newState.emptySpaces++;
        } else  {
            newBoard[row][col] = newState.board[row][col];
        }
    }
    newState.board = newBoard;
    return newState;
}

export {
    createGame,
    shuffle,
    bestCell,
    generateBoard,
    fillRandomBoard, //remove in prod, export is only for tests
    isValid,
    countSolutions,
    addEmptySpaces
};