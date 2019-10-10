export default class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pasture = [];
  }
  
  getCell(y, x) {
    return this.pasture[y][x];
  }

  fillBoard(cellBuilder){
    for (let y = 0; y < this.height; y++) {
      let row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(cellBuilder());
      }
      this.pasture.push(row);
    }
  }

  boundlessBoard(coordinatedObj) {
    if (coordinatedObj.coordX < 0) coordinatedObj.coordX = this.width - 1;
    if (coordinatedObj.coordY < 0) coordinatedObj.coordY = this.height - 1;
    if (coordinatedObj.coordX >= this.width) coordinatedObj.coordX = 0;
    if (coordinatedObj.coordY >= this.height) coordinatedObj.coordY = 0;
  }
}