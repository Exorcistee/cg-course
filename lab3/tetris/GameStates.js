import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

class GameState {
  constructor(game) {
    this.game = game;
    this.name = 'base-state';
  }

  enter() {}
  exit() {}
  handleInput(e) {}
  update(delta) {}
}

export class MenuState extends GameState {
  constructor(game) {
    super(game);
    this.name = 'menu';
  }

  enter() {
    this.game.renderer.toggleStartMessage(true);
  }

  exit() {
    this.game.renderer.toggleStartMessage(false);
  }

  handleInput(e) {
    if (e.key === 'p') {
      this.game.changeState('playing');
      this.game.spawnPiece();
    }
  }
}

export class PlayingState extends GameState {
  constructor(game) {
    super(game);
    this.name = 'playing';
    this.moveCooldown = 100;
    this.lastMoveTime = 0;
  }

  enter() {
    this.game.isPaused = false;
    this.game.renderer.hideAllMessages();
  }

  handleInput(e) {
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveCooldown) return;

    const { currentPiece } = this.game;

    switch(e.key) {
      case 'ArrowLeft':
        if (this.game.board.isValidMove(currentPiece, -1, 0)) {
          currentPiece.x -= 1;
          this.lastMoveTime = now;
        }
        break;
      case 'ArrowRight':
        if (this.game.board.isValidMove(currentPiece, 1, 0)) {
          currentPiece.x += 1;
          this.lastMoveTime = now;
        }
        break;
      case 'ArrowDown':
        if (this.game.board.isValidMove(currentPiece, 0, -1)) {
          currentPiece.y -= 1;
          this.lastMoveTime = now;
        }
        break;
      case 'ArrowUp':
        this.game.board.rotatePiece(currentPiece);
        this.lastMoveTime = now;
        break;
      case 'p':
        this.game.changeState('paused');
        break;
    }

    this.game.renderer.updatePiecePosition(currentPiece);
  }

  update(delta) {
    if (!this.game.currentPiece) return;

    this.game.dropCounter += delta;
    if (this.game.dropCounter > this.game.dropInterval) {
      if (this.game.board.isValidMove(this.game.currentPiece, 0, -1)) {
        this.game.currentPiece.y -= 1;
      } else {
        this.game.lockPiece();
      }
      this.game.dropCounter = 0;
    }
  }
}

export class PausedState extends GameState {
  constructor(game) {
    super(game);
    this.name = 'paused';
  }

  enter() {
    this.game.isPaused = true;
    this.game.renderer.togglePauseMessage(true);
  }

  exit() {
    this.game.renderer.togglePauseMessage(false);
  }

  handleInput(e) {
    if (e.key === 'p') {
      this.game.changeState('playing');
    }
  }
}

export class LevelUpState extends GameState {
  constructor(game) {
    super(game);
    this.name = 'level-up';
    this.duration = 2000;
    this.startTime = 0;
  }

  enter() {
    this.startTime = Date.now();
    this.game.renderer.toggleLevelUpMessage(true);
  }

  update() {
    if (Date.now() - this.startTime > this.duration) {
      this.game.changeState('playing');
    }
  }

  exit() {
    this.game.renderer.toggleLevelUpMessage(false);
  }
}

export class GameOverState extends GameState {
  constructor(game) {
    super(game);
    this.name = 'game-over';
  }

  enter() {
    this.game.renderer.toggleGameOverMessage(true);
  }

  exit() {
    this.game.renderer.toggleGameOverMessage(false);
  }

  handleInput(e) {
    if (e.key === 'p') {
      this.game.restart();
    }
  }
}