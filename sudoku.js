var numSelected = null;
var prevTileSelected = null;
var tileSelected = null;

var errors = 0;

var board = [
    "273-94-16",
    "68-273--9",
    "--51862--",
    "---3--78-",
    "-----9-63",
    "83-7---24",
    "-694-83-2",
    "7-26--198",
    "318-27--5"
]

var solution = [
    "273594816",
    "681273459",
    "495186237",
    "954362781",
    "127849563",
    "836751924",
    "569418372",
    "742635198",
    "318927645"
]

window.onload = function() {
    setGame();
}

function setGame()  {
    //Digits 1-9
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
            if(board[r][c] != "-")  {
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
}

function selectNumber() {
    if(numSelected!=null)   {
        numSelected.classList.remove("number-selected");
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