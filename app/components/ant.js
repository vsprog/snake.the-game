import Fsm from "./fsm";

export default class Ant {
  constructor(coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
    this._brain = new Fsm();
  }

  

  
/* ---------------------------------------------------------------------------------------------------------- */
  _renderField() {
    for (let y = 0; y < this._boardHeight; y++) {
      for (let x = 0; x < this._boardWidth; x++) {
        let cell = this._board[y][x];

        if (cell.ant === 1) {
          this._changeCell('cell_ant', cell.element);
        } else if (cell.wall === 1) {
          this._changeCell('cell_wall', cell.element);
        } else {
          this._changeCell('cell_field', cell.element);
        }
      }
    }
  }

  _changeCell(cssClass, element) {
    let arr = ['cell_ant', 'cell_wall', 'cell_field'];
    element.classList.add(cssClass);
    arr
      .filter(cl => cl !== cssClass)
      .forEach(cl => element.classList.remove(cl));
  }

  _moveAnt() {//вынести в game
    let currentCoords = this._getAntCoord();
    let path = [/*[0,0],*/[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9]]; //lee.pathFinder
    // если в pathFinder нет текущего местоположения, то брать первое в массиве
    //let index;
    // path.find((ar, i) => {
    //   index = i;
    //   return ar[0] == currentCoords[0] && ar[1] == currentCoords[1];
    // });
    
    //let newCoords = path[index+1];
    let newCoords = path[0];

    if (newCoords) {
      this._board[currentCoords[0]][currentCoords[1]].ant = 0;
      this._board[newCoords[0]][newCoords[1]].ant = 1;
    }
    
  }

  _getAntCoord() {
    for (let y = 0; y < this._boardHeight; y++) {
      for (let x = 0; x < this._boardWidth; x++) {
        let cell = this._board[y][x];
        if (cell.ant == 1) {
          return [y, x];
        }
      }
    }
  }

  _placeAnt() {
    let cell = this._board[0][0];
    cell.ant = 1;
  }

  _placeWall() {
    let wallLength = 25;
    for(let i = 0; i<wallLength; i++) {
      this._board[10 + i][20].wall = 1;
    }
  }
}
