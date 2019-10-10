export default class Lee {
  construcor(matrix) {
    this.matrix = matrix;
    this.distance;
  }

  /**
   * Возвращает путь в виде массива координат
   */
  pathFinder(x1, y1, x2, y2) {
    this._waveMaker(x1, y1, x2, y2);

    let previousValue = this.matrix[x2][y2];
    let successfulRoute = [];

    let x = x2;
    let y = y2;

    while ( !(x === x1 && y === y1) ) {
      for (let i = x-1; i < x+2; i++)  {  // -1, 0, 1
        for (let j = y-1; j < y+2; j++) { // -1, 0, 1
          if (this.matrix[i] && (this.matrix[i][j] === previousValue -1) && // If array x array defined and the matrix value is 0
              !(i === x && j === y) ) {
              previousValue = this.matrix[i][j];
              successfulRoute.push([i, j]);
              x = i;
              y = j;

          } else if (successfulRoute.length == this.matrix[x2][y2] - 1) { // If we got to the end of the route
              x = x1;
              y = y1; // Break the while loop
          }
        }
      }
    }
    successfulRoute.unshift([x2, y2]); // Add end point
    //successfulRoute.push([x1, y1]); // Add start point
    return successfulRoute.reverse(); // Reverse the array so it's at the start
  }

  _waveMaker(x1, y1, x2, y2) {
    let toVisit = [[x1, y1]]; // Initialise at the start square
    
    while(toVisit.length) { // While there are still squares to visit
      let x = toVisit[0][0];
      let y = toVisit[0][1];

      for (let i = x-1; i < x+2; i++)  {  // -1, 0, 1
        for (let j = y-1; j < y+2; j++) { // -1, 0, 1
          if (this._neighbourCheck(x, y, i, j, x1, y1, 0)) {
            this.matrix[i][j] = this.matrix[x][y] + 1;
            toVisit.push([i, j]);
          }
        }
      }
      toVisit.shift();
    }

    this.distance = this.matrix[x2][y2];
  }

  _neighbourCheck() {
    return this.matrix[i] && (this.matrix[i][j] === value) && // If array x array defined and the matrix value is 0
    !(i === x1 && j === y1) && // If it's not the first square
    !(i === x && j === y) //&& // If it's not the center square
    // !(i === x-1 && j === y+1) && /* If it's not the corner squares */
    // !(i === x-1 && j === y-1) &&  
    // !(i === x+1 && j === y+1) &&
    // !(i === x+1 && j === y-1);
  }
}