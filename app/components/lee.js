export default class Lee {
    construcor(matrix) {
        this.matrix = matrix;
        this.distance;
    }

    /**
     * Возвращает путь в виде массива координат
     */
    pathFinder(y1, x1, y2, x2) {
        this._waveMaker(y1, x1, y2, x2);

        let previousValue = this.matrix[y2][x2];
        let successfulRoute = [];

        let x = x2;
        let y = y2;

        while ( !(x === x1 && y === y1) ) {
            for (let j = y-1; j < y+2; j++)  {  // -1, 0, 1
                for (let i = x-1; i < x+2; i++) { // -1, 0, 1
                    if (this.matrix[j] && (this.matrix[j][i] === previousValue -1) && // If array x array defined and the matrix value is 0
                        !(i === x && j === y) ) {
                        previousValue = this.matrix[j][i];
                        successfulRoute.push([j, i]);
                        x = i;
                        y = j;

                    } else if (successfulRoute.length == this.matrix[y2][x2] - 1) { // If we got to the end of the route
                        x = x1;
                        y = y1; // Break the while loop
                    }
                }
            }
        }
        successfulRoute.unshift([y2, x2]); // Add end point
        //successfulRoute.push([y1, x1]); // Add start point

        return successfulRoute.reverse(); // Reverse the array so it's at the start
    }

    _waveMaker(y1, x1, y2, x2) {
        let toVisit = [[y1, x1]]; // Initialise at the start square

        while(toVisit.length) { // While there are still squares to visit
            let x = toVisit[0][1];
            let y = toVisit[0][0];

            for (let j = y-1; j < y+2; j++)  {  // -1, 0, 1
                for (let i = x-1; i < x+2; i++) { // -1, 0, 1
                    if (this._neighbourCheck(y, x, j, i, y1, x1, 0)) {
                        this.matrix[j][i] = this.matrix[y][x] + 1;
                        toVisit.push([j, i]);
                    }
                }
            }
            toVisit.shift();
        }

        this.distance = this.matrix[y2][x2];
    }

    _neighbourCheck(y, x, j, i, y1, x1, value) {
        return this.matrix[j] && (this.matrix[j][i] === value) && // If array x array defined and the matrix value is 0
            !(i === x1 && j === y1) && // If it's not the first square
            //  !(i === x && j === y) && //&& // If it's not the center square
            !(i === x-1 && j === y+1) && /* If it's not the corner squares */
            !(i === x-1 && j === y-1) &&
            !(i === x+1 && j === y+1) &&
            !(i === x+1 && j === y-1);
    }
}