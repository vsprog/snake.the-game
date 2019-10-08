import Snake from './components/snake.js';
import Cell from './components/cell.js';

export default class Game{
  constructor() {
    this._board = [];
    this._boardWidth = 70;
    this._boardHeight = 45;    
    this._score = 0;
    this._snake = new Snake(Math.floor(this._boardWidth / 2), Math.floor(this._boardHeight / 2), 5, 'Up');
    this._gameLoopTimerId = null;
    this._isPause = false;
    window.onkeyup = this._enterKey.bind(this);

    this._initGame();
    this._startGame();
    this._gameLoop();
  }

  _initGame() {
    const boardElement = document.querySelector('.board');
    this._scoreElement = document.querySelector('#score');
    this._scoreElement.innerText = this._score;
    
    for (let y = 0; y < this._boardHeight; y++) {
      let row = [];
      for (let x = 0; x < this._boardWidth; x++) {
        let cell = new Cell();
        cell.element = document.createElement('div');
        cell.element.className = 'cell';
        boardElement.appendChild(cell.element);
        row.push(cell);
      }
      this._board.push(row);
    }
  }

  _startGame() {
    this._clearField();
    this._updateSnakePosition();
    this._placeApple();
  }

  _gameLoop() {    
    this._moveSnake();
    this._checkMapEdge();
    this._deathHandler();
    this._collectApple();
    this._updateSnakePosition();
    this._renderField();

    this._gameLoop = this._gameLoop.bind(this);    
    this._gameLoopTimerId = setTimeout(this._gameLoop, 100); //  1000 / (this._snakeLength - 1) + 200    
  }

  _moveSnake() {
    switch (this._snake.direction) {
      case 'Up':
        this._snake.coordY--;
        break;
      case 'Down':
        this._snake.coordY++;
        break;
      case 'Left':
        this._snake.coordX--;
        break;
      case 'Right':
        this._snake.coordX++;
        break;
    }
  }

  _collectApple() {
    let cell = this._board[this._snake.coordY][this._snake.coordX];
    if (cell.apple === 1) {
      this._snake.length++;
      this._scoreElement.innerText = ++this._score;
      cell.apple = 0;
      this._placeApple();
    }
  }

  _updateSnakePosition() {
    let cell = this._board[this._snake.coordY][this._snake.coordX];
    cell.snake = this._snake.length;
  }

  _renderField() {
    for (let y = 0; y < this._boardHeight; y++) {
      for (let x = 0; x < this._boardWidth; x++) {
        let cell = this._board[y][x];

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

  _changeCell(cssClass, element) {
    let arr = ['cell_snake', 'cell_apple', 'cell_field'];
    element.classList.add(cssClass);
    arr
      .filter(cl => cl !== cssClass)
      .forEach(cl => element.classList.remove(cl));
  }

  _checkMapEdge() {
    if (this._snake.coordX < 0) this._snake.coordX = this._boardWidth - 1;
    if (this._snake.coordY < 0) this._snake.coordY = this._boardHeight - 1;
    if (this._snake.coordX >= this._boardWidth) this._snake.coordX = 0;
    if (this._snake.coordY >= this._boardHeight) this._snake.coordY = 0;
  }

  _clearField() {
    for (let y = 0; y < this._boardHeight; ++y) {
      for (let x = 0; x < this._boardWidth; ++x) {
        let cell = this._board[y][x];
        cell.snake = 0;
        cell.apple = 0;
      }
    }
  }

  _placeApple() {
    let appleX = Math.floor(Math.random() * this._boardWidth);
    let appleY = Math.floor(Math.random() * this._boardHeight);
    let cell = this._board[appleY][appleX];
    if (cell.snake == 0) {
      cell.apple = 1;
    }
  }

  _deathHandler() {
    // сделать несколько жизней
    // Tail collision
    let cell = this._board[this._snake.coordY][this._snake.coordX];
    if (cell.snake > 0) {
      this._startGame();
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
        this._pauseHandler();
        break;
      default:
        break;
    }
    event.preventDefault();
  }

  _pauseHandler() {
    this._isPause = !this._isPause;
    let pauseElement = document.querySelector('.pause');
    if (this._isPause) {
      clearTimeout(this._gameLoopTimerId);
      pauseElement.classList.remove('hidden');
    } else {
      this._gameLoop();
      pauseElement.classList.add('hidden');
    }
    
  }
}
