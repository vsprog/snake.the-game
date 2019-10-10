export default class Snake {
  constructor(coordX, coordY, length, direction) {
    this.coordX = coordX;
    this.coordY = coordY;
    this.length = length;
    this.direction = direction;
  }

  move() {
    switch (this.direction) {
      case 'Up':
        this.coordY--;
        break;
      case 'Down':
        this.coordY++;
        break;
      case 'Left':
        this.coordX--;
        break;
      case 'Right':
        this.coordX++;
        break;
    }
  }
}