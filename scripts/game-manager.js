'use strict';

import Player from './player.js';
import Bot from './bot.js';

export default class GameManager {
  constructor() {
    console.log(`Original GameManager is ${this.activePlayer}`);
    this.players = [];
    this.activePlayer = undefined;
    this.gameStarted = false;
    this.gameEnded = false;
    this.isLowerLimitReached = false;
    this.onDiceRolled = () => { };
    this.onPlayerAdded = (player) => { };
    this.onGameStarted = () => { };
    this.onGameEnded = (player) => { };
    this.onLowerLimitReached = () => { };
    this.onLowerLimitUnreached = () => { };
  }

  addPlayer(isBot) {
    const oldPlayerCount = this.players.length;
    const id = `player${oldPlayerCount + 1}`;
    const player = (isBot)
      ? new Bot(id, this.#onPlayerEndsTurn.bind(this))
      : new Player(id, this.#onPlayerEndsTurn.bind(this));

    player.onEndTurn = this.#onPlayerEndsTurn;
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

  #onPlayerEndsTurn() {
    this.#checkForWin();
    this.#cyclePlayer();
  }

  #checkForWin() {
    console.log(`Checking for winner as ${this.activePlayer.id}`);
    if (this.activePlayer.score >= 100) {
      this.gameEnded = true;
      this.onGameEnded(this.activePlayer);
    }
  }

  #cyclePlayer() {
    // console.log(`Switching player as ${this.activePlayer.id}`);
    if (this.gameEnded) return;

    const oldIndex = this.players.findIndex(player => player === this.activePlayer);
    const newIndex = (oldIndex + 1) % this.players.length;

    this.#switchPlayerTo(newIndex);
  }

  #switchPlayerTo(newIndex) {
    console.log(`Switching player to ${this.players[newIndex].id}`);

    this.activePlayer = this.players[newIndex];
    this.activePlayer.activate();

    if (this.activePlayer.isBot) this.#cyclePlayer();
  }

  rollDice() {
    if (this.onLowerLimitReached === false) return;
    this.#startGameIfNotStarted();
    if (this.#conditionsForActivePlayMet() === false) return;

    const dice = this.activePlayer.rollDice();
    // if (dice === 1) this.#cyclePlayer();

    this.onDiceRolled(dice);
  }

  #startGameIfNotStarted() {
    if (this.gameStarted === false) {
      this.gameStarted = true;
      this.onGameStarted();
      this.#switchPlayerTo(0);
    }
  }

  holdStake() {
    if (this.#conditionsForActivePlayMet() === false) return;
    if (this.activePlayer.stake <= 1) return;
    this.activePlayer.hold();
  }

  #conditionsForActivePlayMet() {
    if (this.gameStarted === false) return false;
    if (this.gameEnded) return false;
    if (this.activePlayer.isBot) return false;
  }
}