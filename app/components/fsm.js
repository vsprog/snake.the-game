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
    return stack.length > 0 ? stack[stack.length - 1] : null;
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