export default class Fsm {
  constructor() {
    this._stack = [];
  }

  update() {
    let currentState = this._getCurrentState();

    if(currentState) {
      currentState();
    }
  }

  popState() {
    return this._stack.pop();
  }

  pushState(state) {
    if (this._getCurrentState() != state) {
      this._stack.push(state);
    }
  }

  _getCurrentState() {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
  }

}