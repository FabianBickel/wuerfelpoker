'use strict';

import Player from './player.js';
import Bot from './bot.js';

export default class GameManager {
  constructor() {
    this.players = [];
    this.gameStarted = false;
    this.gameEnded = false;
    this.onDiceRolled = () => { };
    this.onPlayerAdded = (player) => { };
    this.onGameStarted = () => { };
    this.onGameEnded = (player) => { };
    this.isLowerLimitReached = false;
    this.onLowerLimitReached = () => { };
    this.lowerLimitUnreached = () => { };
  }

  addPlayer(isBot) {
    const oldPlayerCount = this.players.length;
    const id = `player${oldPlayerCount + 1}`;
    const player = (isBot)
      ? new Bot(id)
      : new Player(id);

    this.players.push(player);
    this.onPlayerAdded(player);

    const newPlayerCount = this.players.length;
    this.#checkLowerLimit(newPlayerCount);
  }

  #checkLowerLimit(playerCount) {
    if (playerCount >= 2 && this.isLowerLimitReached === false) {
      this.isLowerLimitReached = true;
      this.onLowerLimitReached();
    } else if (playerCount <= 1 && this.isLowerLimitReached === true) {
      this.isLowerLimitReached = false;
      this.onLowerLimitUnreached();
    }
  }

  #startGameIfNotStarted() {
    if (this.gameStarted === false) {
      this.gameStarted = true;
      this.onGameStarted();
      this.activePlayer = this.players[0];
    }
  }

  #switchPlayer() {
    const oldIndex = this.players.findIndex(player => player === this.activePlayer);
    console.log(oldIndex);
    const newIndex = (oldIndex + 1) % this.players.length;
    console.log(newIndex);
    this.activePlayer = this.players[newIndex];
    this.activePlayer.activate();
  }

  #checkForWin() {
    if (this.activePlayer.score >= 100) {
      this.onGameEnded(this.activePlayer);
      this.gameEnded = true;
    }
  }

  rollDice() {
    if (this.gameEnded) return;
    if (this.onLowerLimitReached === false) return;
    this.#startGameIfNotStarted();

    const dice = this.activePlayer.rollDice();
    if (dice === 1) this.#switchPlayer();

    this.onDiceRolled(dice);
    if (this.activePlayer.isBot) this.activePlayer.makeHoldDecision(dice);

    this.#checkForWin();
  }

  holdStake() {
    if (this.gameEnded) return;
    if (this.onLowerLimitReached === false) return;
    if (this.activePlayer.isBot) return;
    if (this.activePlayer.stake <= 1) return;

    this.activePlayer.hold();

    this.#checkForWin();
    this.#switchPlayer();
  }
}

