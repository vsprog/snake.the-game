import Fsm from "./fsm.js";
import Lee from "./lee.js";

export default class Ant {
  constructor(coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
    this.prevX = coordX;
    this.prevY = coordY;
    this._gameField = null;
    this.isRunning = false;
    
    this._leftHemisphere = new Lee([]);
    this._brain = new Fsm();
    this._brain.pushState(this._hunt.bind(this));
  }

  move(y, x, isConvertable) {
    this.prevX = this.coordX;
    this.prevY = this.coordY;
    let newX = isConvertable ? this._converCoordinates(x, this.prevX) : x;
    let newY = isConvertable ? this._converCoordinates(y, this.prevY) : y;

    this.coordX = newX;
    this.coordY = newY;
  }

  _converCoordinates(a, b) {
    return a == b ? b : a == (b-1) ? (b+1) : (b-1);
  }

  updateState(board) {
    this._gameField = board;
    this._brain.update();    
  }

  _hunt() {
    let matrix = this._convertGameFieldToMatrix();
    let minDistToSnakeCoord = this._minDistanceToSnake();
    this._leftHemisphere.matrix = matrix;

    if(!minDistToSnakeCoord || !~this._leftHemisphere.distance) return;

    let pathToSnake = this._leftHemisphere.pathFinder(this.coordY, this.coordX, minDistToSnakeCoord[0], minDistToSnakeCoord[1]);
    let newCoords = pathToSnake[1]; // [0] не работает, разобраться

    this.move(newCoords[0], newCoords[1], false); 

    if(this.isRunning) {
      this._brain.popState();
      this._brain.pushState(this._runAway.bind(this)); 
    }
  }

  _runAway() {
    if(!this.isRunning) {
      this._brain.popState(); 
      this._brain.pushState(this._hunt.bind(this)); 
    }

  }

  _convertGameFieldToMatrix(){
    let result = this._gameField.pasture.map(row => row.map(c => c.ant == 1 || c.wall == 1 ?  -1 : 0));
    
    return result;
  }

  _minDistanceToSnake() {
    let arr = this._getFullSnakeCoords();
    return arr[0];
    // let distCoords = arr.reduce((acc, curr) => {
    //   let dist = this._heuristic(curr[0], curr[1], this.coordX, this.coordY);
    //   acc[dist] = curr;
    //   return acc;
    // }, {});
    // let minDist = Math.min(...Object.keys(distCoords));
    
    // return distCoords[minDist];
  }

  _heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  _getFullSnakeCoords() {
    let result = [];
    this._gameField.pasture.forEach((row, j) => {
      row.forEach((c, i) => {
        if(c.snake > 0) {
          result.push([j, i]);
        }
      });
    });

    return result;
  }

}
