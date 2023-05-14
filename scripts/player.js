'use strict';

export default class Player {
  constructor(id, isBot = false) {
    this.id = id;
    this.isBot = isBot;
    this.score = 0;
    this.stake = 0;
    this.isMyTurn = false;
    this.onTurnStarted = () => {};
    this.onTurnEnded = () => {};
    this.onStakeChanged = (stake) => {};
    this.onScoreChanged = (score) => {};
  }

  activate() {
    this.isMyTurn = true;
    this.onTurnStarted();
  }

  rollDice() {
    if (this.isMyTurn === false) {
      this.onTurnStarted();
      this.isMyTurn = true;
    }
    const dice = Math.min(Math.floor(Math.random() * 6 + 1), 6);
    if (dice === 1) {
      this.stake = 0;
      this.onStakeChanged(this.stake);
      this.isMyTurn = false;
      this.onTurnEnded(this);
    } else {
      this.stake += dice;
      this.onStakeChanged(this.stake);
    }
    return dice;
  }
  
  hold() {
    this.score += this.stake;
    this.stake = 0;
    this.isMyTurn = false;
    this.onTurnEnded(this);
    this.onStakeChanged(this.stake);
    this.onScoreChanged(this.score);
  }
}