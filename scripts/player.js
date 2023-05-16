'use strict';

export default class Player {
  constructor(id, endTurnCallback, isBot = false) {
    this.id = id;
    this.isBot = isBot;
    this.score = 0;
    this.stake = 0;
    this.isMyTurn = false;
    this.onTurnStarted = () => { };
    this.onTurnEnded = () => { };
    this.onStakeChanged = (stake) => { };
    this.onScoreChanged = (score) => { };
    this.endTurnCallback = endTurnCallback;
    // this.onHoldEnabled = () => {};
    // this.onHoldDisabled = () => {};
  }

  activate() {
    this.isMyTurn = true;
    this.onTurnStarted();
  }

  rollDice() {
    if (this.isMyTurn === false) return;
    const dice = Math.min(Math.floor(Math.random() * 6 + 1), 6);
    if (dice === 1) {
      this.stake = 0;
      this.#endTurn();
      console.log('Turn ended');
    } else {
      this.stake += dice;
      this.onStakeChanged(this.stake);
    }
    return dice;
  }

  hold() {
    if (this.stake === 0) return;
    this.score += this.stake;
    this.stake = 0;
    this.#endTurn();
  }

  #endTurn() {
    console.log('Turn ended');
    this.onStakeChanged(this.stake);
    this.onScoreChanged(this.score);
    this.isMyTurn = false;
    this.onTurnEnded(this);
    this.endTurnCallback();
  }
}