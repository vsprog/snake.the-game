import Snake from './components/snake.js';
import Cell from './components/cell.js';
import Board from './components/board.js';
import Ant from './components/ant.js';
import '../node_modules/hammerjs/hammer.js';

export default class Game{
  constructor() {
    this._board = this._createBoard();
    this._time = 200;
    this._score = 0;
    this._threadIds = [];
    this._isStopped = false;
    
    this._initEventListeners();
    this._drawBoard();
    this._initGame();
    this._startThreads();
  }

  _initEventListeners() {
    window.addEventListener('keyup', this._enterKey.bind(this));
    // window.addEventListener('mouseover', this._mouseHandler.bind(this));
    // window.addEventListener('click', this._mouseHandler.bind(this));

    document.querySelectorAll('.container__layer').forEach(c => c.addEventListener('touchend', () => this._stopGame('pause')));
    document.querySelector('h1').addEventListener('touchend', () => this._stopGame('pause'));
    this._swipeEventHandler();
  }

  _initGame() {
    this._snake = new Snake(Math.floor(this._board.width / 2), Math.floor(this._board.height / 2), 5, 'Up');
    this._ant = new Ant(0, 0);
    this._clearField();
    this._setApplePosition();
    this._drawWall();
  }

  _createBoard() {
    let isMob = window.outerWidth < 500;
    return isMob ? new Board(30, 60) : new Board(70, 45);
  }

  _startThreads() {
    const gt = this._gameThread.bind(this);    
    const at = this._aiThread.bind(this);
    
    this._threadIds = [
      setInterval(gt, this._time),
      setInterval(at, this._time),
    ];
  }

  _gameThread() {
    this._snake.move();
    this._board.boundlessBoard(this._snake);
    this._deathHandler();
    this._collectApple();
    this._updateScore();
    this._updateSnakePosition();
    this._renderField();
  }
  
  _aiThread() {
    this._updateAntPosition();
    this._ant.updateState(this._board);
    this._checkSnakeIsClose();
  }

  // _toggleGoldenApple() {
  //   let appleX = this._randomRange(this._board.width - 1);
  //   let appleY = this._randomRange(this._board.height - 1);
  //   let appleCell = this._board.getCell(appleY, appleX);
  //   if (appleCell.snake == 0 && appleCell.ant == 0 && appleCell.apple == 0) {
  //     appleCell.bonusApple = 1;
  //   }
  // }

  _collectApple() {
    let snakeHead = this._board.getCell(this._snake.coordY, this._snake.coordX);
    
    if (snakeHead.apple === 1) {
      snakeHead.apple = 0;
      this._snake.length++;
      this._score += 1;
      this._setApplePosition();
      this._freezeAnt();
      this._increaseVisibleRatio();
      this._drawWall();
      this._speedUp();
    }
  }

  _increaseVisibleRatio() {
    if (this._score % 5 === 0 && this._score < 20) {
      this._ant.visibleRatio+=2;
      console.log(this._ant.visibleRatio);
    }
  }

  _speedUp() {
    if (this._score > 0 && this._score < 20 && this._score % 2 === 0) {
      this._time = 200 - this._score*5;
      this._threadIds.forEach(id => clearInterval(id));
      this._startThreads();
    }
  }

  _freezeAnt() {
    this._ant.isFrozen = !this._ant.isFrozen;
    setTimeout(() => this._ant.isFrozen = !this._ant.isFrozen, 2000);
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

  _checkSnakeIsClose() {
    let visibleRatio = this._ant.visibleRatio;
    let visibleCells = [];
    
    for (let y = this._ant.coordY - visibleRatio; y < this._ant.coordY + visibleRatio; y++) {
      for (let x = this._ant.coordX - visibleRatio; x < this._ant.coordX + visibleRatio; x++) {
        let cell = this._board.getCell(y, x);
        if (cell) {
          visibleCells.push(cell);
        }
      }
    }

    this._ant.isSnakeNear = visibleCells.some(c => c.snake > 0);
  }

  _renderField() {
    for (let y = 0; y < this._board.height; y++) {
      for (let x = 0; x < this._board.width; x++) {
        let cell = this._board.getCell(y, x);
        

        if (cell.snake > 0) {
          cell.element.classList = this._classMap('snake');
          cell.snake--;
        } else if (cell.ant === 1) {
          cell.element.classList = this._classMap('ant');
          this._toggleAntFreeze(cell.element)
        } else if (cell.wall === 1) {
          cell.element.classList = this._classMap('wall');
        } else if (cell.apple === 1) {
          cell.element.classList = this._classMap('apple');
        } else if (cell.bonus === 1) {
          cell.element.classList = this._classMap('bonus');
        } else {
          cell.element.classList = this._classMap('field');
        }
        
      }
    }
  }

  _classMap(key) {
    let map = {
      'snake': 'cell cell_snake',
      'ant': 'cell cell_ant',
      'wall': 'cell cell_wall',
      'apple': 'cell cell_apple',
      'bonus': 'cell cell_bonus',
      'field': 'cell cell_field',
    };
    return map[key];
  }

  _toggleAntFreeze(cellElement) {
    this._ant.isFrozen ? cellElement.classList.add('frozen') : cellElement.classList.remove('frozen');
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

  _getFrequency() {
    let input = document.querySelector('.frequency-input');
    return input.value;
  }

  _updateScore() {
    let elem = document.querySelector('#score');
    elem.innerText = this._score;
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

  _clearWalls() {
    for (let y = 0; y < this._board.height; ++y) {
      for (let x = 0; x < this._board.width; ++x) {
        this._board.getCell(y, x).wall = 0;
      }
    }
  }

  _drawWall() {
    let freq = this._getFrequency();
    if (this._score % freq !== 0) return;

    this._clearWalls();

    let wallCount = this._randomRange(8, 2);
    let currentWall = 0;

    while (currentWall < wallCount) {
      let wallX = this._randomRange(this._board.width - 1);
      let wallY = this._randomRange(this._board.height - 1);
      let wallLength = this._randomRange(20, 3);
      let dim = this._randomRange(4);

      let getCoord = (n) => [wallY, wallX + n];
      
      switch(dim)
      {
          case 1: 
              getCoord = (n) => [wallY + n, wallX];
              break;
          case 2: 
              getCoord = (n) => [wallY, wallX - n];
              break;
          case 3: 
              getCoord = (n) => [wallY - n, wallX];
              break;
      }

      let checkedWall = true;

      for(let i = 0; i < wallLength; i++) {
        let coord = getCoord(i);
        let cell = this._board.getCell(coord[0], coord[1]);
        
        if (cell === undefined || cell.wall || cell.snake || cell.ant || cell.apple || coord[0] === 0 || coord[0] == this._board.height-1 || coord[1] === 0 || coord[1] == this._board.width-1) {
            checkedWall = false;
            break;
          }
      }

      if (!checkedWall) continue;

      for(let i = 0; i < wallLength; i++) { 
        let coord = getCoord(i);
        let cell = this._board.getCell(coord[0], coord[1]).wall = 1;
      }

      currentWall++;
    }
  }

  _setApplePosition() {
    let appleX = this._randomRange(this._board.width - 1);
    let appleY = this._randomRange(this._board.height - 1);
    let appleCell = this._board.getCell(appleY, appleX);
    if (!appleCell.snake && 
      !appleCell.ant &&
      !appleCell.wall) {
      appleCell.apple = 1;
    } else {
      this._setApplePosition();
    }
  }

  _deathHandler() {
    // сделать несколько жизней
    
    // Tail collision or meeting the wall
    let snakeHead = this._board.getCell(this._snake.coordY, this._snake.coordX);
    if (snakeHead.snake > 0 || snakeHead.wall === 1) {
      this._endOfTheGame();
    }

    // eaten by ant
    let antCell = this._board.getCell(this._ant.coordY, this._ant.coordX);
    if(antCell.snake > 0) {
      this._endOfTheGame();
    }
  }

  _endOfTheGame() {
    this._stopGame('death');
    this._score = 0;
    this._snake = null;
  }

/*
  _mouseHandler(event) {
    let x = this._ant.coordX;
    let y = this._ant.coordY;
    this._ant.isRunning = false;

    for (let j = y - 1; j < y + 2; j++)  {
      for (let i = x - 1; i < x + 2; i++) {
        let cell = this._board.getCell(j, i);
        if(!cell) return;
        
        let cellPageCoords = cell.element.getBoundingClientRect();
        // курсор на соседе муравья 
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
*/
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

// TODO: создать метод setDirection
  _swipeEventHandler() {
    const container = document.querySelector('.container');
    const mc = new Hammer(container);
    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    mc.on('swipeleft', () => this._snake.direction !== 'Right' && (this._snake.direction = 'Left') );
    mc.on('swiperight', () => this._snake.direction !== 'Left' && (this._snake.direction = 'Right') );
    mc.on('swipeup', () => this._snake.direction !== 'Down' && (this._snake.direction = 'Up') );
    mc.on('swipedown', () => this._snake.direction !== 'Up' && (this._snake.direction = 'Down') );
  }

  _stopGame(reason) {
    this._isStopped = !this._isStopped;
    let banner = document.querySelector(`.container__layer_${reason}`);
    let banners = document.querySelectorAll('.container__layer');
    
    if (!this._snake) {
      this._initGame();
      console.clear();
    }

    if (reason === 'death') {
      this._time = 200;
    }

    if (this._isStopped) {
      banner.classList.remove('hidden');
      this._threadIds.forEach(id => clearInterval(id));
    } else {
      this._startThreads();
      banners.forEach(b => b.classList.add('hidden'));
      
      //если умираешь несколько раз подряд отваливается управление на моб
      this._swipeEventHandler();
    }    
  }

  _randomRange(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}
