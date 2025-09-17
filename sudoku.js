/*changes:
    -Added cursor: pointer when hovering on interactive elements
    -Made buttons wider
todo:
    -Make UI pretty
    -Add debug mode -- maybe in handburger menu
        - add tracker that shows how many masks were added, its not always feasible to have <~25 clues
        - console.log
    -Add unit tests
    -Add enclosures to obscure sudoku generation logic
    -Add stopwatch
    -Add notes functionality
*/

var numSelected = null;
var prevTileSelected = null;
var tileSelected = null;
var difficulty = ""; //string, will either be "easy", "medium", or "hard"

var errors = 0;
var solution;
var board;

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(arr)  {
    for(let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
function backtracker(board, fill, row = 0, col = 0) {
    if(row==9)  { return true;  }  //base case
    if(col==9)  { return backtracker(board, fill, row+1, 0);    }
    if(board[row][col] != 0)    { return backtracker(board, fill, row, col+1);  }

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    if(fill)    {
        shuffle(nums);
    }

    for(const num of nums) {
        if(isValid(board, row, col, num))   {
            board[row][col] = num;
            if(backtracker(board, fill, row, col+1)) { return true; }    //recurse
            board[row][col] = 0;    //backtrack
        }
    }
    return false;
}
function isValid(board, row, col, num)  {
    //row check
    for(let c=0; c<9; c++)  {
        if (board[row][c] == num) return false;
    }
    //column check
    for(let r=0; r<9; r++)  {
        if (board[r][col] == num) return false;
    }
    //3x3 check
    const boxRow = Math.floor(row/3)*3;
    const boxCol = Math.floor(col/3)*3;
    for(let r=0; r<3; r++) {
        for(let c=0; c<3; c++) {
            if (board[boxRow + r][boxCol + c] == num) return false;
        }
    }
    return true;
}
function countSolutions(board, row = 0, col = 0) {
    if(row == 9) {  return 1;   } //base case
    if(col == 9) {  return countSolutions(board, row + 1, 0);   }
    if(board[row][col] != 0) {  return countSolutions(board, row, col + 1); }

    let total = 0;
    for(let num = 1; num <= 9; num++) {
        if(isValid(board, row, col, num)) {
            board[row][col] = num;
            total += countSolutions(board, row, col + 1);
            board[row][col] = 0;

            if(total>1) {   return total;   }
        }
    }
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
    var emptySpaces = 0
    const difficultyValues = {
        easy: 31,
        medium: 26,
        hard: 21
    }
    let tilesToKeep = 81 - difficultyValues[difficulty];
    while(emptySpaces<tilesToKeep && positions.length>0)  { 
        let pos = positions.pop();
        let row = pos.r, col = pos.c;
        newBoard[row][col] = 0;
        if(countSolutions(newBoard.map(row => row.slice())) == 1)    {
            emptySpaces++;
        }
        else    {
            newBoard[row][col] = board[row][col];
        }
    }
    return newBoard;
}

//https://stackoverflow.com/questions/6924216/how-to-generate-sudoku-boards-with-unique-solutions
function generateBoard()    {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    backtracker(board, true);
    return board;
}

window.onload = function() {
    difficulty = "easy";
    document.getElementById("easy").classList.add("easy-clicked");
    setGame();
}

function setGame()  {
    solution = generateBoard();
    //console.log(solution);  //debug mode
    board = addEmptySpaces(solution);
    //Playable Digits 1-9
    for (let i=1; i<=9; i++) {
        //generates 9 <div id="1" class="number">1</div> which are number class objects in the digits id
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

    //Board 9x9
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
            document.getElementById("board").append(tile);
        }
    }
    //Buttons
    document.getElementById("reset").addEventListener("click", resetGame);
    document.getElementById("easy").addEventListener("click", setDifficulty);
    document.getElementById("medium").addEventListener("click", setDifficulty);
    document.getElementById("hard").addEventListener("click", setDifficulty);
}

function resetGame()  {
    solution = generateBoard();
    //console.log(solution);  //debug mode
    board = addEmptySpaces(solution);
    errors = 0;
    document.getElementById("errors").innerText = errors;

    for (let r=0; r<9; r++) {
        for (let c=0; c<9; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());

            if(board[r][c] != 0)  {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }
            else {
                tile.innerText = "";
                tile.classList.remove("tile-start");
            }
        }
    }
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
    //document.getElementById("h1").innerHTML= "yurp";  doesnt work idk why
}

function selectTile()   {
    if(numSelected) {
        prevTileSelected = tileSelected;
        tileSelected = this;
        if (this.innerText!="") {
            return
        }
        // "0-0" "0-1" ... "3-1"
        let coords = this.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if(solution[r][c] == numSelected.id)    {
            this.innerText = numSelected.id;
        }
        else if(tileSelected != prevTileSelected) {
            errors += 1;
            document.getElementById("errors").innerText = errors;
        }
    }
}

function setDifficulty()    {
    var newDifficulty = this.id;
    if(newDifficulty != difficulty) {
        document.getElementById(difficulty).classList.remove(difficulty + "-clicked");
        document.getElementById(newDifficulty).classList.add(newDifficulty + "-clicked");
        difficulty = newDifficulty;
        resetGame();
    }
}
