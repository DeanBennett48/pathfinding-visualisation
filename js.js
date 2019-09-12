let mousedown = false;
let startMove = false;
let targetMove = false;
let walls = false;
let solved = false;


let app = new App();
document.addEventListener("DOMContentLoaded",function() {
    app.board.generateBoard();
});

function findPath() {

    app.search();

}

function maze() {
    app.maze();
}

function reset() {
    app.board.clear();
    var walls = document.getElementsByClassName('wall');
    while(walls.length > 0){
        walls[0].classList.remove('wall');
    }
    for(i=0;i<app.board.cells.length;i++) {
        for(j=0;j<app.board.cells[i].length;j++) {
            if(app.board.cells[i][j].status == "wall") {
                app.board.cells[i][j].status = "";
            }
        }
    }
}

function App() {

    this.board = new Board();
    this.searchType;
    this.mazeType;

    this.search = function() {
        let option = document.getElementById('algorithm').value;
        switch(option) {
            case "Dijkstra":
                this.board.dijkstra();
                break;
            case "A*":
                this.board.aStar();
                break;
            default:
                break;
        }
        this.board.drawConsidered();
        this.board.drawPath();
        solved = true;
    }

    this.maze = function() {
        this.board.generateWalls();
    }

    this.reset = function() {

    }
}

function Board() {
    this.boardHTML;
    this.cells = [];
    this.status;
    this.start;
    this.startMove = false;
    this.targetMove = false;
    this.target;
    this.walls;
    this.path;
    this.consideredOrder = [];

    this.dijkstra = function () {
        this.consideredOrder = [];
        let unvisited = [];
        for(i=0;i<this.cells.length;i++) {
            for(j=0;j<this.cells[i].length;j++) {
                unvisited.push(this.cells[i][j]);
                this.cells[i][j].removeClass("path");
                this.cells[i][j].removeClass("visited");
                this.cells[i][j].addClass("unvisited");
                this.cells[i][j].visited = false;
                this.cells[i][j].dist = Infinity;
                this.cells[i][j].prev = undefined;
            }
        }

        this.start.dist = 0;

        while(unvisited.length > 0 ) {
            let current;
            let min = Infinity;
            let minIndex = undefined;

            for( i=0; i < unvisited.length ; i++ ) {
                if(unvisited[i].dist < min) {
                    min = unvisited[i].dist;
                    current = unvisited[i];
                    minIndex = i;
                }
            }

            if(minIndex == undefined) {
                break;
            }

            if(current.id == this.target.id) {
                break;
            }

            

            unvisited.splice(minIndex,1);
            current.removeClass("unvisited");
            current.visited = true;
            this.consideredOrder.push(current.id);

            let x = current.x;
            let y = current.y;

            let neighbours = [];

            if(x > 0 ) {
                let tempx = Number(x)-1;
                let tempid = tempx + "-" + y;
                if(this.cells[tempx][y].visited == false) {
                    neighbours.push(tempid);
                }
            }
            if(x < 29 ) {
                let tempx = Number(x)+1;
                let tempid = tempx + "-" + y;
                if(this.cells[tempx][y].visited == false) {
                    neighbours.push(tempid);
                }
            }
    
            if(y < 29 ) {
                let tempy = Number(y)+1;
                let tempid = x + "-" + tempy;
                if(this.cells[x][tempy].visited == false) {
                    neighbours.push(tempid);
                }
            }
    
            if(y > 0 ) {
                let tempy = Number(y)-1;
                let tempid = x + "-" + tempy;
                if(this.cells[x][tempy].visited == false) {
                    neighbours.push(tempid);
                }
            }

            for (i=0;i< neighbours.length;i++) {

                let x = neighbours[i].split("-")[0];
                let y = neighbours[i].split("-")[1];

                let alt = current.dist + this.cells[x][y].weight;
    
                if(alt < this.cells[x][y].dist) {
                    if(this.cells[x][y].status !== "wall"){
                        this.cells[x][y].dist = alt;
                    } else {
                        this.cells[x][y].dist = Infinity;
                    }
                    this.cells[x][y].prev = current.id;
                }
            }
        }

    }

    this.aStar = function() {
        //open list for currently considered nodes
        //closed list for nodes not needed to consider again

        let open = [];
        let openScores = [];
        //add all walls to the closed list
        let closed = [];

        this.consideredOrder = [];
        for(i=0;i<this.cells.length;i++) {
            for(j=0;j<this.cells[i].length;j++) {
                this.cells[i][j].removeClass("path");
                this.cells[i][j].removeClass("visited");
                this.cells[i][j].addClass("unvisited");
                this.cells[i][j].visited = false;
                this.cells[i][j].dist = Infinity;
                this.cells[i][j].prev = undefined;
                if(this.cells[i][j].status == "wall") {
                    closed.push(this.cells[i][j].id);
                }
            }
        }

        

        //begin at start
        this.start.dist = 0;
        open.push(this.start.id);
        let targetX = this.target.id.split("-")[0];
        let targetY = this.target.id.split("-")[1];
        let x = this.start.id.split("-")[0];
        let y = this.start.id.split("-")[1];
        this.start.distFromTarget = (Math.max(targetX,x)-Math.min(targetX,x)) + (Math.max(targetY,y)-Math.min(targetY,y));
        openScores.push(this.start.dist + this.start.distFromTarget);
        //add all neighbour tiles to open list
        //score the neighbours G+H
        //G is movement cost from start (G of prev + 1)
        //H is the Estimated movement cost to final node (manhatten distance method = number of vertical + number of horizontal)
        //F is the total score F = G + H

        console.log(open.length);

        while (open.length > 0 ) {
            let lowestScore = openScores[0];
            let lowestIndex = 0;
            let lowestId = open[0];
            for(i=0;i<open.length;i++) {
                if(openScores[i] < lowestScore ) {
                    lowestScore = openScores[i];
                    lowestIndex = i;
                    lowestId = open[i];
                }
            }


            if(lowestId == this.target.id) {
                break;
            }

            open.splice(lowestIndex,1);
            openScores.splice(lowestIndex,1);
            closed.push(lowestId);
            this.consideredOrder.push(lowestId);

            x = Number(lowestId.split("-")[0]);
            y = Number(lowestId.split("-")[1]);

            let neighbours = [];

            if(x > 0 ) {
                let tempx = Number(x)-1;
                let tempid = tempx + "-" + y;
                if(this.cells[tempx][y].visited == false) {
                    neighbours.push(tempid);
                }
            }
            if(x < 29 ) {
                let tempx = Number(x)+1;
                let tempid = tempx + "-" + y;
                if(this.cells[tempx][y].visited == false) {
                    neighbours.push(tempid);
                }
            }
    
            if(y < 29 ) {
                let tempy = Number(y)+1;
                let tempid = x + "-" + tempy;
                if(this.cells[x][tempy].visited == false) {
                    neighbours.push(tempid);
                }
            }
    
            if(y > 0 ) {
                let tempy = Number(y)-1;
                let tempid = x + "-" + tempy;
                if(this.cells[x][tempy].visited == false) {
                    neighbours.push(tempid);
                }
            }

            neighbours.forEach(n => {

                if(closed.indexOf(n)>-1) {

                } else {
                    let nX = n.split("-")[0];
                    let nY = n.split("-")[1];

                    let g = this.cells[x][y].dist + 1;
                    let h = (Math.max(targetX,nX)-Math.min(targetX,nX)) + (Math.max(targetY,nY)-Math.min(targetY,nY));
                    let f = g + h;


                    console.log(nX,nY," : ",g,h,f,targetX,nX,targetY,nY);
                    if(open.indexOf(n)>-1) {
                        let currentF = openScores[open.indexOf(n)];
                        if(f < currentF) {
                            openScores[open.indexOf(n)] = f;
                        }
                        this.cells[nX][nY].prev = lowestId;
                        this.cells[nX][nY].dist = g;
                    } else {
                        open.push(n);
                        openScores.push(f);
                        this.cells[nX][nY].dist = g;
                        this.cells[nX][nY].distFromTarget = h;
                        this.cells[nX][nY].prev = lowestId;
                    }

                }
            });
        }

        //get cell from open list with lowest score S
        //if S = target then stop
        //remove S from open list and add to closed list
        //For each cell T in S's walkable adjacent cells
            //if T is in the closed list - ignore
            //if T is not in the open list - add to open list and compute score
            //if T is already in the open list - compute score and if lower then use S as the parent/path to get there
    }

    this.changeStart = function() {

    }

    this.changeTarget = function() {

    }

    this.drawWalls = function() {

    }

    this.generateWalls = function() {
        //set start and target node as part of maze
        //choose a start node
        reset();
        this.start.createMazePath(this.start.id.split("-")[0],this.start.id.split("-")[1]);
        //call createMazePath for cell x y
        //reset the target cell
        this.target.status = "target";
        this.cells.forEach(cellrow => {
            cellrow.forEach( cell => {
                if(cell.status == "maze") {
                    cell.status = "";
                    //cell.DOM.classList.remove("mazeConfirmed");
                } else if(cell.status == "start" || cell.status == "target") {
    
                } else {
                    cell.wall();
                }
            });
        });
        //all non picked cells are walls
        //fill walls

        //clear any classnames of regular cells

    }

    this.generateBoard = function() {
        this.boardHTML = document.getElementById("grid");
        for(i=0;i<30;i++) {
            let row = document.createElement("tr");
            row.id = `r${i}`;
            this.cells.push([]);
            for(j=0;j<30;j++) {
                let cell = new Cell(i,j);
                this.cells[i].push(cell);
                cell.createDOM();
                
                if(i==7 && j==20) {
                    cell.target();
                    this.target = cell;
                }
                if(i==7 && j==10) {
                    cell.start();
                    this.start = cell;
                }

                row.appendChild(cell.DOM);
            }
            this.boardHTML.appendChild(row);
        }

        this.boardHTML.addEventListener("mousedown", this.boardClick.bind(this));
        this.boardHTML.addEventListener("mouseup", this.boardMouseUp.bind(this));
    }

    this.boardClick = function() {
        this.status = true;
        solved = false;
        this.clear();
    }

    this.clear = function() {
        this.consideredOrder = [];
        for(i=0;i<this.cells.length;i++) {
            for(j=0;j<this.cells[i].length;j++) {
                this.cells[i][j].removeClass("path");
                this.cells[i][j].removeClass("visited");
                this.cells[i][j].addClass("unvisited");
                this.cells[i][j].visited = false;
                this.cells[i][j].dist = Infinity;
                this.cells[i][j].prev = undefined;
            }
        }
    }

    this.boardMouseUp = function() {
        this.status = false;
        this.startMove = false;
        this.targetMove = false;
    }

    this.drawPath = function() {
        let current = this.target;
        while (current.id !== this.start.id) {
            if(this.start.id == current.id || this.target.id == current.id) {

            } else {
                current.addClass("path");
            }
            let prev = current.prev;
            let x = prev.split("-")[0];
            let y = prev.split("-")[1];
            current = this.cells[x][y];
        }
    }

    this.drawConsidered = function() {
        for(i=0;i<this.consideredOrder.length;i++) {
            let x = this.consideredOrder[i].split("-")[0];
            let y = this.consideredOrder[i].split("-")[1];
            if(this.start.id == this.cells[x][y].id || this.target.id == this.cells[x][y].id) {

            } else {
                this.cells[x][y].addClass("visited");
            }  
        }
    }

}

function Cell(x,y) {

    this.id = `${x}-${y}`;
    this.x = x;
    this.y = y;
    this.status = "";
    this.weight = 1;
    this.DOM;
    this.visited = false;
    this.prev = undefined;
    this.dist = Infinity;
    this.distFromTarget = Infinity;

    this.createDOM = function() {
        this.DOM = document.createElement("td");
        this.DOM.id = this.id;

        this.DOM.addEventListener("mouseover",this.hover.bind(this));
        this.DOM.addEventListener("mousedown",this.wall.bind(this));

        this.addClass("cell");
        this.addClass("unvisited");
    }

    this.addClass = function(className) {
        this.DOM.classList.add(className);
    }

    this.removeClass = function(className) {
        this.DOM.classList.remove(className);
    }

    this.changeVisited = function() {

    }


    this.hover = function() {
        if(app.board.status) {
            if(app.board.startMove && this.status !== "target"&& this.status !== "wall") {
                this.start();
            } else if(app.board.targetMove && this.status !== "start"&& this.status !== "wall") {
                this.target();
            } else if(!app.board.startMove &&!app.board.targetMove){
                this.wall();
            }
            if(app.board.consideredOrder.length > 0 && solved) {
                app.search();
            }
        }
    }

    this.reset = function() {
        this.DOM.removeEventListener("mousedown",this.startClick);
        this.DOM.removeEventListener("mousedown",this.targetClick);

        this.status = "";
        this.visited = false;
        this.prev = undefined;
        this.dist = Infinity;
        this.removeClass("start");
        this.removeClass("target");
        this.removeClass("wall");

    }

    this.start = function() {
        if(app.board.start) {
            app.board.start.reset();
            app.board.start = this;
        }
        this.reset();
        this.dist = 0;
        this.addClass("start");
        this.status = "start";
        this.DOM.addEventListener("mousedown",this.startClick);
    }

    this.startClick = function() {
        app.board.startMove = true;
    }

    this.target = function() {
        if(app.board.target) {
            app.board.target.reset();
            app.board.target = this;
        }
        this.reset();
        this.addClass("target");
        this.status = "target";
        this.DOM.addEventListener("mousedown",this.targetClick);
    }

    this.targetClick = function() {
        app.board.targetMove = true;
    }

    this.wall = function() {
        if(this.status == "wall") {
            this.removeClass("wall");
            this.status = "";
        } else {
            if(this.status !== "start" && this.status !== "target") {

                this.addClass("wall");
                this.status = "wall";
            }
        }
    }

    this.changeWeight = function() {
        
    }

    this.createMazePath = function(x,y) {
        x = Number(x);
        y = Number(y);
        if(this.status !== "start") {
            this.status = "maze";
        }
        let directions = ["N","E","S","W"];
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        this.DOM.classList.add("mazeConsidered");

        for(let i = 0; i < directions.length; i++) {
            //for each cell check * not already maze, not outside limit, not start or end
            
            if(directions[i] == "N") {
                let avaliable = true;
                let possibleCells = [[Number(x)+2,Number(y)],[Number(x)+1,Number(y)+1],[Number(x)+1,Number(y)-1],[Number(x)+2,Number(y)+1],[Number(x)+2,Number(y)-1]];
                for(let j = 0; j<possibleCells.length;j++) {
                    let c = possibleCells[j];
                    //console.log(c);
                    if(c[0] < 30 && c[1] < 30 && c[0] > -1 && c[1] > -1) {
                        //console.log(directions[i]);
                        let state = app.board.cells[c[0]][c[1]].status;
                        if(state == "maze") {
                            avaliable = false;
                        }
                    } else {
                        avaliable = false;
                    }
                }

                if( avaliable ) {
                    //console.log([x],[y]);
                    app.board.cells[x+1][y].createMazePath(x+1,y);
                }
                //if possible to go north call the north neighbour createMazePath function
            } else if(directions[i] == "E") {
                let avaliable = true;
                let possibleCells = [[Number(x),Number(y)+2],[Number(x)+1,Number(y)+1],[Number(x)-1,Number(y)+1],[Number(x)+1,Number(y)+2],[Number(x)-1,Number(y)+2]];
                for(let j = 0; j<possibleCells.length;j++) {
                    let c = possibleCells[j];
                    if(c[0] < 30 && c[1] < 30 && c[0] > -1 && c[1] > -1) {
                        let state = app.board.cells[c[0]][c[1]].status;
                        if(state == "maze") {
                            avaliable = false;
                        }
                    } else {
                        avaliable = false;
                    }
                }

                if( avaliable ) {
                    //console.log([x],[y]);
                    app.board.cells[x][y+1].createMazePath(x,y+1);
                }
                //if possible to go east call the north neighbour createMazePath function
                //[x][y+2],[x+1][y+1],[x-1][y+1]
            } else if(directions[i] == "S") {
                let avaliable = true;
                let possibleCells = [[Number(x)-2,Number(y)],[Number(x)-1,Number(y)+1],[Number(x)-1,Number(y)-1],[Number(x)-2,Number(y)+1],[Number(x)-2,Number(y)-1]];
                for(let j = 0; j<possibleCells.length;j++) {
                    let c = possibleCells[j];
                    if(c[0] < 30 && c[1] < 30 && c[0] > -1 && c[1] > -1) {
                        let state = app.board.cells[c[0]][c[1]].status;
                        if(state == "maze") {
                            avaliable = false;
                        }
                    } else {
                        avaliable = false;
                    }
                }

                if( avaliable ) {
                    //console.log([x],[y]);
                    app.board.cells[x-1][y].createMazePath(x-1,y);
                }
                //if possible to go south call the north neighbour createMazePath function
                //[x-2][y],[x-1][y+1],[x-1][y-1]
            } else if(directions[i] == "W") {
                let avaliable = true;
                let possibleCells = [[Number(x),Number(y)-2],[Number(x)+1,Number(y)-1],[Number(x)-1,Number(y)-1],[Number(x)+1,Number(y)-2],[Number(x)-1,Number(y)-2]];
                for(let j = 0; j<possibleCells.length;j++) {
                    let c = possibleCells[j];
                    if(c[0] < 30 && c[1] < 30 && c[0] > -1 && c[1] > -1) {
                        let state = app.board.cells[c[0]][c[1]].status;
                        if(state == "maze") {
                            avaliable = false;
                        }
                    } else {
                        avaliable = false;
                    }
                }

                if( avaliable ) {
                    //console.log([x],[y]);
                    app.board.cells[x][y-1].createMazePath(x,y-1);
                }
                //if possible to go west call the north neighbour createMazePath function
                //[x][y-2],[x+1][y-1],[x-1][y-1]
            } else {
                //nothing
            }

        }

        this.DOM.classList.remove("mazeConsidered");
        //this.DOM.classList.add("mazeConfirmed");

        //this.DOM.style.backgroundColor = "orange";
        //randomise possible directions N S E W
                //for each direction
                    //if possible move then call createMazePath for cell in that direction

    }
}