import Snake from './components/snake.js';
import Cell from './components/cell.js';
import Board from './components/board.js';

export default class Game{
  constructor() {
    this._board = new Board(70, 45);
    this._score = 0;
    this._gameLoopTimerId = null;
    this._isStopped = false;
    window.onkeyup = this._enterKey.bind(this);

    this._initGame();
    this._startGame();
    this._gameLoop();
  }

  _initGame() {
    this._scoreElement = document.querySelector('#score');
    this._scoreElement.innerText = this._score;
    this._drawBoard();
  }

  _startGame() {
    this._snake = new Snake(Math.floor(this._board.width / 2), Math.floor(this._board.height / 2), 5, 'Up');
    this._clearField();
    this._updateSnakePosition();
    this._placeApple();
  }

  _gameLoop() {    
    this._startMovement();
    this._checkMapEdge();
    this._deathHandler();
    this._collectApple();
    this._updateSnakePosition();
    this._renderField();

    this._gameLoop = this._gameLoop.bind(this);    
    this._gameLoopTimerId = setTimeout(this._gameLoop, 100); //  1000 / (this._snakeLength - 1) + 200    
  }
  
_startMovement() {
  // this._ant.move();
  this._snake.move();
}

  _collectApple() {
    let snakeHead = this._board.getCell(this._snake.coordY, this._snake.coordX);
    if (snakeHead.apple === 1) {
      this._snake.length++;
      this._scoreElement.innerText = ++this._score;
      snakeHead.apple = 0;
      this._placeApple();
    }
  }

  _updateSnakePosition() {
    let snakeHead = this._board.getCell(this._snake.coordY, this._snake.coordX);
    snakeHead.snake = this._snake.length;
  }

  _renderField() {
    for (let y = 0; y < this._board.height; y++) {
      for (let x = 0; x < this._board.width; x++) {
        let cell = this._board.getCell(y, x);

        if (cell.snake > 0) {
          this._changeCell('cell_snake', cell.element);
          cell.snake--;
        } else if (cell.apple === 1) {
          this._changeCell('cell_apple', cell.element);
        } else {
          this._changeCell('cell_field', cell.element);
        }
      }
    }
  }

  _drawBoard() {
    const boardElement = document.querySelector('.container__board');
    this._board.fillBoard(this._createCell);
    this._board.pasture.forEach(row => row.forEach(c => boardElement.appendChild(c.element)));
  }

  _createCell() {
    let cell = new Cell();
    cell.element = document.createElement('div');
    cell.element.className = 'cell';
    return cell;
  }

  _changeCell(cssClass, element) {
    let arr = ['cell_snake', 'cell_apple', 'cell_field'];
    element.classList.add(cssClass);
    arr
      .filter(cl => cl !== cssClass)
      .forEach(cl => element.classList.remove(cl));
  }

  _checkMapEdge() {
    this._board.boundlessBoard(this._snake);
  }

  _clearField() {
    for (let y = 0; y < this._board.height; ++y) {
      for (let x = 0; x < this._board.width; ++x) {
        let cell = this._board.getCell(y, x);
        cell.snake = 0;
        cell.apple = 0;
      }
    }
  }

  _placeApple() {
    let appleX = Math.floor(Math.random() * this._board.width);
    let appleY = Math.floor(Math.random() * this._board.height);
    let appleCell = this._board.getCell(appleY, appleX);
    if (appleCell.snake == 0) {
      appleCell.apple = 1;
    }
  }

  _deathHandler() {
    // сделать несколько жизней
    
    // Tail collision
    let snakeHead = this._board.getCell(this._snake.coordY, this._snake.coordX);
    if (snakeHead.snake > 0) {
      //this._startGame();
      this._stopGame('death'); 
      this._snake = null; // костыль, т.к. clearTimeout не работает внутри setTimeout
    }
  }


  _enterKey(event) {
    switch (event.key) {
      case 'ArrowUp':
        this._snake.direction !== 'Down' && (this._snake.direction = 'Up');
        break;
      case 'ArrowDown':
        this._snake.direction !== 'Up' && (this._snake.direction = 'Down');
        break;
      case 'ArrowLeft':
        this._snake.direction !== 'Right' && (this._snake.direction = 'Left');
        break;
      case 'ArrowRight':
        this._snake.direction !== 'Left' && (this._snake.direction = 'Right');
        break;
      case 'Escape':
        this._stopGame('pause');
        break;
      default:
        break;
    }
    event.preventDefault();
  }

  _stopGame(reason) {
    this._isStopped = !this._isStopped;
    let banner = document.querySelector(`.container__layer_${reason}`);
    let banners = document.querySelectorAll('.container__layer');
    
    if(!this._snake) {
      this._startGame();
      console.clear();
    }

    if (this._isStopped) {
      banner.classList.remove('hidden');
      clearTimeout(this._gameLoopTimerId);
    } else {
      this._gameLoop();
      banners.forEach(b => b.classList.add('hidden'));
    }    
  }

}
