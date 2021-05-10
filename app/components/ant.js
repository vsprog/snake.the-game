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
        this.isFrozen = false;
        this.isSnakeNear = false;
        this.visibleRatio = 15;
        this.dim = 0;

        this._initBrains();
    }

    move(y, x, isReflectable) {
        this.prevX = this.coordX;
        this.prevY = this.coordY;
        let newX = isReflectable ? this._reflectCoordinates(x, this.prevX) : x;
        let newY = isReflectable ? this._reflectCoordinates(y, this.prevY) : y;

        this.coordX = newX;
        this.coordY = newY;
    }

    updateState(board) {
        this._gameField = board;
        this._brain.update();
    }

    _initBrains() {
        this._brain = new Fsm();
        this._brain.pushState(this._patrol.bind(this));

        this._leftHemisphere = new Lee([]);
    }

    _reflectCoordinates(a, b) {
        return a === b ? b : a === (b-1) ? (b+1) : (b-1);
    }

    /* патрулировать */
    _patrol() {
        if(this.isFrozen) {
            this._brain.popState();
            this._brain.pushState(this._freeze.bind(this));
            return;
        }

        if(this.isSnakeNear) {
            this._brain.popState();
            this._brain.pushState(this._hunt.bind(this));
            return;
        }

        let newCoords = this._moveCounterclockwise();
        this.move(newCoords[0], newCoords[1], false);
    }

    /* охотиться */
    _hunt() {
        if(this.isFrozen) {
            this._brain.popState();
            this._brain.pushState(this._freeze.bind(this));
            return;
        }

        let huntCoords = this._getHuntCoords();
        let minDistToHuntCoord = this._findMinDistanceToCellInCoordsArray(huntCoords);
        let newCoords = this._findTheWay(minDistToHuntCoord);

        this.move(newCoords[0], newCoords[1], false);
    }

    /* замереть на время действия бонуса */
    _freeze() {
        if(this.isSnakeNear) {
            this._brain.popState();
            this._brain.pushState(this._hunt.bind(this));
        } else {
            this._brain.popState();
            this._brain.pushState(this._patrol.bind(this));
        }

    }

    /* убегать от змеи/курсора */
    _runAway() {

    }

    _findTheWay(distCoords) {
        this._leftHemisphere.matrix = this._convertGameFieldToMatrix();
        let pathToDist = this._leftHemisphere.pathFinder(this.coordY, this.coordX, distCoords[0], distCoords[1]);

        // if(!pathToDist || !~this._leftHemisphere.distance) {
        //   return;
        // }

        return pathToDist[0];
    }

    _convertGameFieldToMatrix(){
        let result = this._gameField.pasture.map(row => row.map(c => c.ant || c.wall ?  -1 : 0));
        //let transpose = m => m[0].map((x,i) => m.map(a => a[i]));
        return result;
    }

    _findMinDistanceToCellInCoordsArray(coords) {
        //return coords[0];
        let distCoords = coords.reduce((acc, curr) => {
            let dist = this._heuristic(curr[0], curr[1], this.coordX, this.coordY);
            acc[dist] = curr;
            return acc;
        }, {});
        let minDist = Math.min(...Object.keys(distCoords));

        return distCoords[minDist];
    }

    _heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    _moveCounterclockwise() {
        let row = this.coordY;
        let col = this.coordX;

        while (this.dim < 4) {
            switch(this.dim) {
                case 0:
                    if(++row === this._gameField.height - 1)
                        ++this.dim;
                    break;
                case 1:
                    if(++col === this._gameField.width - 1)
                        ++this.dim;
                    break;
                case 2:
                    if(--row === 0)
                        ++this.dim;
                    break;
                case 3:
                    if(--col === 0)
                        this.dim = 0;
                    break;
            }
            return [row, col];
        }
    }

    _getHuntCoords() {
        let result = [];
        this._gameField.pasture.forEach((row, j) => {
            row.forEach((c, i) => {
                if(c.snake > 0 || c.apple > 0) {
                    result.push([j, i]);
                }
            });
        });

        return result;
    }

}
