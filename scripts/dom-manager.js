'use strict';

import GameManager from './game-manager.js';

export const SCORE_NAME = "score";
export const STAKE_NAME = "stake";

let gameManager;

const gameRunningMessages = [
  "Das Spiel ist im vollen Gange! Bleib dran und zeig, was du kannst!",
  "Runde um Runde - deine Strategie zählt!",
  "Jeder Wurf könnte das Spiel ändern. Bleib fokussiert!",
  "Es ist nicht vorbei, bis es vorbei ist. Weiter geht's!",
  "Das Spiel ist hart, aber du bist härter. Lass uns weiterspielen!",
  "Achte auf deine Züge, sie könnten das Spiel entscheiden.",
  "Das ist ein intensives Spiel! Bleib ruhig und spiel weiter.",
  "Bist du bereit, das Blatt zu wenden? Jeder Wurf zählt!",
  "Mach dich bereit für die nächste Runde. Du kannst das!",
  "Das ist ein spannendes Spiel! Zeig uns, was du drauf hast!"
];

const botWonMessageFunctions = [
  (name) => `${name} gewinnt. Du bist dem Sieg aber näher als je zuvor.`,
  (name) => `${name} siegt. Aber du bist ihm auf den Fersen.`,
  (name) => `${name} triumphiert. Erwarte das Unerwartete im nächsten Spiel.`,
  (name) => `${name} holt den Sieg. Bleib dran, dein Moment kommt noch.`,
  (name) => `Der Bot hat's geschafft. Kopf hoch, es ist noch nicht vorbei.`,
  (name) => `Der Bot schnappt sich den Sieg. Nicht aufgeben, weitermachen.`,
  (name) => `Der Bot hat uns überlistet. Aber jeder neue Tag ist eine neue Gelegenheit.`,
  (name) => `Der Bot hat gewonnen. Aber du bist nicht weit entfernt.`,
  (name) => `Ein Punkt für die Maschine. Lass den Kopf nicht hängen, du kommst zurück!`,
  (name) => `Die Maschine hat uns dieses Mal ausgetrickst. Aber du bist bereit für die nächste Runde!`,
];

const playerWonMessageFunctions = [
  (name) => `Glückwunsch zum Sieg, ${name}! Deine Strategie hat sich ausgezahlt.`,
  (name) => `Sensationell, ${name}! Dein Name leuchtet im Siegesglanz!`,
  (name) => `${name}, du bist der Held des Spiels! Meisterliche Leistung!`,
  (name) => `Siegesschrei für ${name}! Du hast das Spiel gemeistert!`,
  (name) => `Fantastisch, ${name}! Du hast bewiesen, dass Geduld und Taktik sich auszahlen.`,
  (name) => `Glückwunsch, ${name}! Du hast deine Fähigkeiten unter Beweis gestellt.`,
  (name) => `Beeindruckend, ${name}! Dein Sieg war wohlverdient.`,
  (name) => `Exzellent, ${name}! Du hast bewiesen, dass Übung den Meister macht.`,
  (name) => `Starke Leistung, ${name}! Dein Sieg war kein Zufall.`,
];

const newGameMessages = [
  "Der Schlüssel zum Sieg liegt in deinen Händen. Lass das Spiel beginnen!",
  "Mach dich bereit für den Triumph. Das Spiel wartet auf dich!",
  "Sei mutig, sei schlau, sei gewitzt. Auf ins Spiel!",
  "Das Glück begünstigt die Vorbereiteten. Zeit zu spielen!",
  "Jeder Zug zählt. Zeig uns, was du kannst!",
  "Ein wahrer Spieler kennt kein Zögern. Lass uns spielen!",
  "Bist du bereit, deine Fähigkeiten unter Beweis zu stellen? Das Spiel beginnt jetzt!",
  "Deine Strategie könnte den Unterschied machen. Zeig uns, was du drauf hast!"
];

function getPlayers() {
  return document.querySelectorAll('.player');
};

function onDiceRolled(number) {
  let path = '';
  switch (number) {
    case 1:
      path = 'icons/one.svg';
      break;
    case 2:
      path = 'icons/two.svg';
      break;
    case 3:
      path = 'icons/three.svg';
      break;
    case 4:
      path = 'icons/four.svg';
      break;
    case 5:
      path = 'icons/five.svg';
      break;
    case 6:
      path = 'icons/six.svg';
      break;
    default:
      path = 'icons/dice.svg';
  }
  const icon = document.querySelector('#diceIcon');
  icon.src = path;
}

function onPlayerAdded(player) {
  let oldPlayerCount = getPlayers().length;
  const id = player.id;
  console.log(id);
  const name = (player.isBot)
  ? `Bot ${oldPlayerCount + 1}`
  : `Player ${oldPlayerCount + 1}`;
  addPlayerEventHandlers();
  addPlayerToDom();
  adjustDomToPlayerCount();
  const playerDom = document.querySelector(`#${id}`);

  function addPlayerEventHandlers() {
    player.onScoreChanged = onScoreChanged;
    player.onStakeChanged = onStakeChanged;
    player.onTurnStarted = onTurnStarted;
    player.onTurnEnded = onTurnEnded;
  }

  function adjustDomToPlayerCount() {
    let newPlayerCount = getPlayers().length;
    if (newPlayerCount > 2)
      adjustPlayerContainerFor3To4Players();
    if (newPlayerCount >= 4)
      disablePlayerAddButtons();
  }

  function onStakeChanged(stake) {
    const stakeContainer = playerDom.querySelector(`.${STAKE_NAME}`);
    const digits = stakeContainer.querySelectorAll('.digit');
    const stakeString = '+' + String(stake).padStart(3, '0');
    digits.forEach((digit, index) => {
      digit.textContent = stakeString[index];
    });
  }

  function onScoreChanged(score) {
    const scoreContainer = playerDom.querySelector(`.${SCORE_NAME}`);
    const digits = scoreContainer.querySelectorAll('.digit');
    const scoreString = ' ' + String(score).padStart(3, '0');
    digits.forEach((digit, index) => {
      digit.textContent = scoreString[index];
    });
  }

  function onTurnStarted() {
    playerDom.classList.remove('inactive');
    playerDom.classList.add('active');
    if (gameManager.activePlayer.isBot) {
      disablePlayingButtons();
    } else {
      enablePlayingButtons();
    }
  }

  function onTurnEnded() {
    playerDom.classList.remove('active');
    playerDom.classList.add('inactive');
    if (gameManager.activePlayer.isBot) {
      enablePlayingButtons();
    } else {
      disablePlayingButtons();
    }
  }

  function addPlayerToDom() {
    function addPlayerChildren(player) {
      const input = getPlayerNameDomObject(name);
      const score = getPlayerDigitContainerDomObject(SCORE_NAME);
      const stake = getPlayerDigitContainerDomObject(STAKE_NAME);
      player.appendChild(input);
      player.appendChild(score);
      player.appendChild(stake);
    }

    function getPlayerNameDomObject(name) {
      function changePlayerName(event) {
        const newName = event.target.value;
        console.log(`Changing player name to ${newName}`);
        const parent = event.target.parentNode;
        const parentId = parent.id;
        console.log(`The ID of the parent element is: ${parentId}`);
      }

      const result = document.createElement('input');
      result.setAttribute('title', 'playerName');
      result.setAttribute('type', 'text');
      result.setAttribute('value', name);
      result.addEventListener('change', changePlayerName);
      result.classList.add('name');
      return result;
    }

    function getPlayerDigitContainerDomObject(className) {
      function getDigit(i) {
        const digit = document.createElement('span');
        digit.classList.add('digit');
        digit.textContent = getDigitTextContent(i);
        return digit;
      }

      function getDigitTextContent(index) {
        if (index == 0 && className == SCORE_NAME) {
          return '';
        } else if (index == 0 && className == STAKE_NAME) {
          return '+';
        }
        return '0';
      }

      const digitContainer = document.createElement('div');
      digitContainer.classList.add(className);
      for (let i = 0; i < 4; i++) {
        digitContainer.appendChild(getDigit(i));
      }
      return digitContainer;
    }

    const playerContainer = document.querySelector('.playerContainer');
    const player = document.createElement('div');
    player.classList.add('player');
    player.id = id;
    addPlayerChildren(player);
    playerContainer.appendChild(player);
  }
}

function onGameStarted() {
  const playerContainer = document.querySelector('.playerContainer');
  const playerAddContainer = document.querySelector('.playerAddContainer');
  const menu = document.querySelector('.menu');
  const title = menu.querySelector('.menuTitle');
  const message = menu.querySelector('.menuMessage');
  playerContainer.classList.remove('reduced');
  playerAddContainer.classList.add('hidden');
  title.textContent = 'Spiel im Gange...';
  const randomIndex = Math.floor(Math.random() * gameRunningMessages.length);
  message.textContent = gameRunningMessages[randomIndex];
}

function onGameEnded(playerWhoWon) {
  const menu = document.querySelector('.menu');
  const title = menu.querySelector('.menuTitle');
  const message = menu.querySelector('.menuMessage');
  title.textContent = 'Spiel Vorbei';
  const playerDom = document.querySelector(`#${playerWhoWon.id}`);
  const playerName = playerDom.querySelector('.name').value;
  const random = Math.random();
  message.textContent = (playerWhoWon.isBot)
    ? botWonMessageFunctions[Math.floor(random * botWonMessageFunctions.length)](playerName)
    : playerWonMessageFunctions[Math.floor(random * playerWonMessageFunctions.length)](playerName);
  menu.classList.add('visible');
}

function onGameRestarted() {
  const playerContainer = document.querySelector('.playerContainer');
  const playerAddContainer = document.querySelector('.playerAddContainer');
  const menu = document.querySelector('.menu');
  const title = menu.querySelector('.menuTitle');
  const message = menu.querySelector('.menuMessage');
  playerContainer.classList.add('reduced');
  playerAddContainer.classList.remove('hidden');
  title.textContent = 'Spiel wird vorbereitet...';
  const randomIndex = Math.floor(Math.random() * newGameMessages.length);
  message.textContent = newGameMessages[randomIndex];
}

function disablePlayerAddButtons() {
  const playerAddButtons = document.querySelectorAll('.playerAddButton');
  playerAddButtons.forEach(button => {
    button.disabled = true;
  });
}

function lowerLimitReached() {
  console.log('Lower limit reached');
  enablePlayingButtons();
}

function lowerLimitUnreached() {
  console.log('Lower limit UNreached');
  disablePlayingButtons();
}

function enablePlayingButtons() {
  document.querySelector('.buttonRollDice').disabled = false;
  document.querySelector('.buttonHoldStake').disabled = false;
}

function disablePlayingButtons() {
  document.querySelector('.buttonRollDice').disabled = true;
  document.querySelector('.buttonHoldStake').disabled = true;
}

function addClickEventListenerToAllOfClass(className, handler) {
  const elements = document.querySelectorAll(`.${className}`);
  elements.forEach(element => {
    element.addEventListener('click', handler);
  });
}

function adjustPlayerContainerFor3To4Players() {
  const playerContainer = document.querySelector('.playerContainer');
  playerContainer.style.gridTemplateRows = '1fr 1fr';
}

function newGame() {
  document.querySelector('.menu').classList.remove('visible');
  gameManager = new GameManager();
  gameManager.onDiceRolled = onDiceRolled;
  gameManager.onPlayerAdded = onPlayerAdded;
  gameManager.onGameStarted = onGameStarted;
  gameManager.onGameEnded = onGameEnded;
  gameManager.onLowerLimitReached = lowerLimitReached;
  gameManager.lowerLimitUnreached = lowerLimitUnreached;
  addClickEventListenerToAllOfClass('buttonAddPlayer', () => gameManager.addPlayer(false));
  addClickEventListenerToAllOfClass('buttonAddBot', () => gameManager.addPlayer(true));
  addClickEventListenerToAllOfClass('buttonRollDice', () => gameManager.rollDice());
  addClickEventListenerToAllOfClass('buttonHoldStake', () => gameManager.holdStake());
  gameManager.addPlayer();
}

newGame();
addClickEventListenerToAllOfClass('buttonNewGame', () => newGame());