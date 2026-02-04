export function createGame(difficulty) {
    return {
        board: null,
        solution: null,
        lastSelected: null,
        hintsLeft: 3,
        startTime: null,
        activeHint: null,
        errors: 0,
        solving: false,
        difficulty: difficulty,
        selectedDifficulty: difficulty,
        emptySpaces: 0
    };
}
function shuffle(arr)  {
    for(let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
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
export function bestCell(brd, mode)  {
    let best = null;
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
export function generateBoard()    {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    fillRandomBoard(board);
    return board;
}
function fillRandomBoard(brd, row = 0, col = 0) {
    if(row==9)  { return true;  }      if(col==9)  { return fillRandomBoard(brd, row+1, 0);    }
    if(brd[row][col] != 0)    { return fillRandomBoard(brd, row, col+1);  }

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(nums);

    for(const num of nums) {
        if(isValid(brd, row, col, num))   {
            brd[row][col] = num;
            if(fillRandomBoard(brd, row, col+1)) { return true; }
            brd[row][col] = 0;            }
    }
    return false;
}
function countSolutions(brd) {
    let obj = bestCell(brd, "min");
    if(!obj)    { return 1; }
    let { r, c, candidates } = obj;

    let total = 0;
    for(let num of candidates) {
        brd[r][c] = num;
        total += countSolutions(brd);
        if(total > 1) {
            brd[r][c] = 0;
            return total;
        }
        brd[r][c] = 0;     }
    return total;
}
function addEmptySpaces(brd, diff)  {
    const newBoard = brd.map(row => row.slice());
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
        veryHard: 17     }
    let removed = 0;

    while(removed<(81-difficultyValues[diff]) && positions.length>0)  {
        let pos = positions.pop();
        let row = pos.r, col = pos.c;
        newBoard[row][col] = 0;
        if(countSolutions(newBoard.map(row => row.slice())) == 1)    {
            removed++;
        } else  {
            newBoard[row][col] = brd[row][col];         }
    }
    return newBoard;
}
export function countEmptySpaces(brd)  {
    let count = 0;
    for(let r=0; r<9; r++)  {
        for(let c=0; c<9; c++)  {
            if(brd[r][c]===0)   {
                count++;
            }
        }
    }
    return count;
}
export function isCorrectMove(gameState, r, c, num) {
    if(gameState.board[r][c] != 0)  { return false; }
    if(gameState.solution[r][c] != num) {return false; }
    return true;
}