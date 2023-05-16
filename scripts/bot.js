'use strict';

import Player from './player.js';

const THINK_TIME = 1000;

export default class Bot extends Player {
  constructor(id, endTurnCallback) {
    super(id, endTurnCallback, true);
    this.stakeGoal = undefined;
  }

  // overwrite #startTurn() method
  activate() {
    console.log('Bot activated');
    this.isMyTurn = true;
    this.onTurnStarted();

    const stakeGoal = Math.floor(Math.random() * 38) + 12;

    console.log(this.isMyTurn);
    this.#makeDecisions(stakeGoal);
    // Do something asynchronously

    console.log('Bot deactivated');
  }

  #makeDecisions(stakeGoal) {
    setTimeout(() => {
      if (this.isMyTurn === false) return;
      console.log(this.isMyTurn);
      if (this.stake >= stakeGoal) this.hold();
      this.rollDice();
      this.#makeDecisions(stakeGoal);
    }, 1000);
  }

  decisionTime() {
    // Wait for 1 second synchronously
    const start = Date.now();
    let now = start;
    while (now - start < THINK_TIME) {
      now = Date.now();
    }
  }
}