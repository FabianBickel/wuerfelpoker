'use strict';

import Player from './player.js';

export default class Bot extends Player {
  constructor(name) {
    super(name, true);
    this.stakeGoal = undefined;
  }

  async makeHoldDecision(diceRoll) {
    const stakeGoal = Math.floor(Math.random() * 38) + 12;
    await new Promise(resolve => setTimeout(resolve, 1.5 * 1000));
    if (this.stake >= stakeGoal) {
      this.hold();
      return true;
    }
    return false;
  }
}