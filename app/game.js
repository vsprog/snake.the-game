export default class Snake {
  constructor() {
    this._board = [];
    this._boardWidth = 70;
    this._boardHeight = 45;
    this._snakeX;
    this._snakeY;
    this._snakeLength;
    this._snakeDirection;
    this._score = 0;

    window.onkeyup = this._enterKey.bind(this);

    this._initGame();
    this._startGame();
    this._gameLoop();
  }

  _initGame() {
    const boardElement = document.getElementsByClassName('board')[0];
    this._scoreElement = document.getElementById('score');
    this._scoreElement.innerText = this._score;
    
    let row, cell;

    for (let y = 0; y < this._boardHeight; y++) {
      row = [];
      for (let x = 0; x < this._boardWidth; x++) {
        cell = {};
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

    this._snakeX = Math.floor(this._boardWidth / 2);
    this._snakeY = Math.floor(this._boardHeight / 2);
    this._snakeLength = 5;
    this._snakeDirection = 'Up';
    this._updateSnakePosition();
    this._placeApple();
  }

  _gameLoop() {
    switch (this._snakeDirection) {
      case 'Up':
        this._snakeY--;
        break;
      case 'Down':
        this._snakeY++;
        break;
      case 'Left':
        this._snakeX--;
        break;
      case 'Right':
        this._snakeX++;
        break;
    }

    this._checkMapEdge();

    // Tail collision
    if (this._board[this._snakeY][this._snakeX].snake > 0) {
      this._startGame();
    }

    // Collect apples
    if (this._board[this._snakeY][this._snakeX].apple === 1) {
      this._snakeLength++;
      this._scoreElement.innerText = ++this._score;
      this._board[this._snakeY][this._snakeX].apple = 0;
      this._placeApple();
    }

    // Update the board at the new snake position
    this._updateSnakePosition();

    // Loop over the entire board, and update every cell
    this._renderField();

    this._gameLoop = this._gameLoop.bind(this);
    setTimeout(this._gameLoop, 100); //  1000 / (this._snakeLength - 1) + 200
    
  }

  _updateSnakePosition() {
    this._board[this._snakeY][this._snakeX].snake = this._snakeLength;
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
    if (this._snakeX < 0) this._snakeX = this._boardWidth - 1;
    if (this._snakeY < 0) this._snakeY = this._boardHeight - 1;
    if (this._snakeX >= this._boardWidth) this._snakeX = 0;
    if (this._snakeY >= this._boardHeight) this._snakeY = 0;
  }

  _clearField() {
    for (let y = 0; y < this._boardHeight; ++y) {
      for (let x = 0; x < this._boardWidth; ++x) {
        this._board[y][x].snake = 0;
        this._board[y][x].apple = 0;
      }
    }
  }

  _enterKey(event) {
    switch (event.key) {
      case 'ArrowUp':
        this._snakeDirection !== 'Down' && (this._snakeDirection = 'Up');
        break;
      case 'ArrowDown':
        this._snakeDirection !== 'Up' && (this._snakeDirection = 'Down');
        break;
      case 'ArrowLeft':
        this._snakeDirection !== 'Right' && (this._snakeDirection = 'Left');
        break;
      case 'ArrowRight':
        this._snakeDirection !== 'Left' && (this._snakeDirection = 'Right');
        break;
      default:
        break;
    }
    event.preventDefault();
  }

  _placeApple() {
    let appleX = Math.floor(Math.random() * this._boardWidth);
    let appleY = Math.floor(Math.random() * this._boardHeight);
    let cell = this._board[appleY][appleX];
    if (cell.snake == 0) {
      cell.apple = 1;
    }
  }
}
