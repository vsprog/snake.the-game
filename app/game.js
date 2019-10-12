import Snake from './components/snake.js';
import Cell from './components/cell.js';
import Board from './components/board.js';
import Ant from './components/ant.js';

export default class Game{
  constructor() {
    this._board = new Board(70, 45);
    this._score = 0;
    this._threadIds = [];
    this._isStopped = false;
    window.addEventListener('keyup', this._enterKey.bind(this));
    window.addEventListener('mouseover', this._mouseHandler.bind(this));
    window.addEventListener('click', this._mouseHandler.bind(this));
    
    this._initGame();
    this._startGame();
    this._startThreads();
  }

  _initGame() {
    this._scoreElement = document.querySelector('#score');
    this._scoreElement.innerText = this._score;
    this._drawBoard();
  }

  _startGame() {
    this._snake = new Snake(Math.floor(this._board.width / 2), Math.floor(this._board.height / 2), 5, 'Up');
    this._ant = new Ant(this._board.width - 2, 1);
    this._clearField();
    this._renderApple();
  }

  _startThreads() {
    this._gameThread = this._gameThread.bind(this);    
    this._iiThread = this._iiThread.bind(this);

    this._threadIds.push(
      setInterval(this._gameThread, 100), //  1000 / (this._snakeLength - 1) + 200    
      setInterval(this._iiThread, 100),
    );
  }

  _gameThread() {    
    this._snake.move();
    this._checkMapEdge();
    this._deathHandler();
    this._collectApple();
    this._updateSnakePosition();
    this._renderField();
  }
  
  _iiThread() {
    this._updateAntPosition();
    this._ant.updateState(this._board);
  }

  _collectApple() {
    let snakeHead = this._board.getCell(this._snake.coordY, this._snake.coordX);
    if (snakeHead.apple === 1) {
      this._snake.length++;
      this._scoreElement.innerText = ++this._score;
      snakeHead.apple = 0;
      this._renderApple();
    }
  }

  _updateSnakePosition() {
    let snakeHead = this._board.getCell(this._snake.coordY, this._snake.coordX);
    snakeHead.snake = this._snake.length;
  }

  _updateAntPosition() {
    let antCell = this._board.getCell(this._ant.coordY, this._ant.coordX);
    let antPrevCell = this._board.getCell(this._ant.prevY, this._ant.prevX);
    antPrevCell.ant = 0;
    antCell.ant = 1;
  }

  _renderField() {
    let ants = [];
    for (let y = 0; y < this._board.height; y++) {
      for (let x = 0; x < this._board.width; x++) {
        let cell = this._board.getCell(y, x);

        if (cell.snake > 0) {
          cell.element.classList = 'cell cell_snake';
          cell.snake--;
        } else if (cell.ant === 1) {
          ants.push(cell);
          cell.element.classList = 'cell cell_ant';
        } else if (cell.apple === 1) {
          cell.element.classList = 'cell cell_apple';
        } else {
          cell.element.classList = 'cell cell_field';
        }
      }
    }
    if(ants.length > 1) {
      ants.pop();
      ants.forEach(c => c.element.classList = 'cell cell_field');
      ants = [];
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

  _checkMapEdge() {
    this._board.boundlessBoard(this._snake);
  }

  _clearField() {
    for (let y = 0; y < this._board.height; ++y) {
      for (let x = 0; x < this._board.width; ++x) {
        let cell = this._board.getCell(y, x);
        cell.snake = 0;
        cell.apple = 0;
        cell.ant = 0;
      }
    }
  }

  _renderApple() {
    let appleX = Math.floor(Math.random() * this._board.width);
    let appleY = Math.floor(Math.random() * this._board.height);
    let appleCell = this._board.getCell(appleY, appleX);
    if (appleCell.snake == 0 && appleCell.ant == 0) {
      appleCell.apple = 1;
    }
  }

  _deathHandler() {
    // сделать несколько жизней
    
    // Tail collision
    let snakeHead = this._board.getCell(this._snake.coordY, this._snake.coordX);
    if (snakeHead.snake > 0) {
      this._endOfTheGame();
    }

    // eaten by ant
    this._board.pasture.forEach(r => r.forEach(c => {
      if (c.snake > 0 && c.ant == 1){
        this._endOfTheGame();
      }
    }));
  }

  _endOfTheGame() {
    this._stopGame('death'); 
    this._snake = null; // костыль, т.к. clearTimeout не работает внутри setTimeout
  }

  _mouseHandler(event) {
    let x = this._ant.coordX;
    let y = this._ant.coordY;
    this._ant.isRunning = false;

    for (let j = y - 1; j < y + 2; j++)  {
      for (let i = x - 1; i < x + 2; i++) {
        let cell = this._board.getCell(j, i);
        if(!cell) return;
        
        let cellPageCoords = cell.element.getBoundingClientRect();
        /* курсор на соседе муравья */
        if (cellPageCoords.bottom > event.clientY && 
          cellPageCoords.top < event.clientY && 
          cellPageCoords.left < event.clientX && 
          cellPageCoords.right > event.clientX) {
          this._ant.move(j, i, true);
          this._ant.isRunning = true;
        }
      }
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
      this._threadIds.forEach(id => clearInterval(id));
    } else {
      this._startThreads();
      banners.forEach(b => b.classList.add('hidden'));
    }    
  }

}
