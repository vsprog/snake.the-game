export default class Fsm {
  constructor() {
    this._stack = [];
  }

  update() {
    let currentState = this.getCurrentState();

    if(currentState) {
      currentState();
    }
  }

  getCurrentState() {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
  }

  popState() {
    return this._stack.pop();
  }

  pushState(state) {
    if (this.getCurrentState() != state) {
      this._stack.push(state);
    }
  }
}