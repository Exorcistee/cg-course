import { Board } from './Board.js';
import { Renderer } from './Renderer.js';
import { SoundManager } from './SoundManager.js';
import { PieceFactory } from './PieceFactory.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

class GameState {
  constructor(game) {
    this.game = game;
  }
  handleInput() {}
}

class PlayingState extends GameState {
  handleInput(e) {
    switch(e.key) {
      case 'ArrowLeft': this.game.moveLeft(); break;
      case 'p': this.game.pause(); break;
    }
  }
}

export default class Game {
  constructor({ boardWidth = 10, boardHeight = 20, blockSize = 1 } = {}) {
    this.level = 1;
    this.score = 0;
    this.linesLeft = 1;
    this.linesCleared = 0;
    this.status = "Start";
    this.isPaused = false;
    this.lastDropTime = Date.now();
    this.board = new Board(boardWidth, boardHeight, blockSize);
    this.soundManager = new SoundManager();
    this.pieceFactory = new PieceFactory();
    this.nextPiece = null;
    this.renderer = new Renderer(blockSize, boardHeight, this.board, this);
    this.board.addScene(this.renderer.scene);
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  setStatus(newStatus) {
    this.status = newStatus;
  }

  getStatus() {
    return this.status;
  }

  getLevel() {
    return this.level;
  }

  setLevel(newLevel) {
    this.level = newLevel;
  }

  getScore() {
    return this.score;
  }

  setScore(newScore) {
    console.log(newScore);
    this.score = newScore;
  }

  getLinesLeft() {
    return this.linesLeft;
  }

  setLinesLeft(newLinesLeft) {
    if (newLinesLeft <= 0) {
      this.levelUp();
    }
    else {
      this.linesLeft = newLinesLeft;
    }
  }

  getSoundManager() {
    return this.soundManager;
  }

  spawnPiece() {
    if (!this.currentPiece) {
        this.currentPiece = this.pieceFactory.createPiece();
        this.nextPiece = this.pieceFactory.createPiece();
    } else {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.pieceFactory.createPiece();
    }
    this.currentPiece.createBlocks(this.board.blockSize);
    this.board.setCurrentPiece(this.currentPiece);
    this.renderer.addPiece(this.currentPiece);
    this.renderer.updateNextPiecePreview(this.nextPiece);  
    if (!this.board.isValidSpawn(this.currentPiece)) {
        this.gameOver();
    }

}


  updateSidePanel() {
    this.renderer.updateSidePanel(this.getLevel(), this.getScore(), this.getLinesLeft());
  }

  update(game) {
    if (this.isPaused) return;

    const now = Date.now();
    if (now - this.lastDropTime > this.board.dropInterval) {
      this.lastDropTime = now;

      if (this.board.isValidMove(this.currentPiece, 0, -1)) {
        this.board.currentPiece.y -= 1;
        this.renderer.updatePiecePosition(this.board.currentPiece);
      } else {
        this.board.fixCurrentPiece(this.board.currentPiece, game);
        this.updateSidePanel();
        this.spawnPiece();
      }
    }
  }

  gameOver() {
    this.isPaused = true;
    this.setStatus("GameOver");
    this.soundManager.playGameOver();
    this.renderer.toggleGameOverMessage(this);
    this.board.clearBoard();
  }

  restartGame() {
    this.score = 0;
    this.level = 1;
    this.linesLeft = 1;
    this.linesCleared = 0;
    this.renderer.updateSidePanel(this.score, this.level, this.linesLeft);
    const gameOverMessage = document.getElementById('gameOverMessage');
    if (gameOverMessage) {
      gameOverMessage.remove();
    }
    this.isPaused = false;
    this.renderer.toggleStartMessage(this);
    this.renderer.updateSidePanel();
    this.spawnPiece();
  }

  levelUp() {
    this.board.clearBoard();
    this.isPaused = !this.isPaused;
    this.setStatus("LevelUp");
    this.renderer.toggleLevelUpMessage(this);
    this.level++;
    this.linesLeft = 1 + (this.level - 1) * 2;
    this.dropInterval *= 0.8;
    this.linesCleared = 0;
    this.renderer.updateSidePanel(this.score, this.level, this.linesLeft);
    this.soundManager.playLevelUp();
  }

  onKeyDown(e) {
    switch (e.key) {
      case "ArrowLeft":
        if (this.board.isValidMove(this.currentPiece, -1, 0) && !this.isPaused) {
          this.currentPiece.x -= 1;
          this.renderer.updatePiecePosition(this.currentPiece);
        }
        break;
      case "ArrowRight":
        if (this.board.isValidMove(this.currentPiece, 1, 0) && !this.isPaused) {
          this.currentPiece.x += 1;
          this.renderer.updatePiecePosition(this.currentPiece);
        }
        break;
      case "ArrowDown":
        if (this.board.isValidMove(this.currentPiece, 0, -1) && !this.isPaused) {
          this.currentPiece.y -= 1;
          this.renderer.updatePiecePosition(this.currentPiece);
        }
        break;
      case "ArrowUp":
        if (!this.isPaused) {
          this.board.rotatePiece(this.currentPiece);
          this.renderer.updatePiecePosition(this.currentPiece);
          break;
        }
      case "p":
        if (this.status == "GameOver") {
          this.isPaused = !this.isPaused;
          this.status = "OnGoing";
          this.renderer.toggleGameOverMessage(this);
          this.animate();
        } else if (this.status == "Start") {
          this.isPaused = !this.isPaused;
          this.status = "OnGoing";
          this.restartGame();
          this.animate();
        } else if (this.status == "Pause") {
          this.status = "OnGoing";
          this.renderer.togglePauseMessage(this);
          this.isPaused = !this.isPaused;
          this.animate();
        } else if (this.status == "LevelUp") {
          this.isPaused = !this.isPaused;
          this.status = "OnGoing";
          this.renderer.toggleLevelUpMessage(this);
          this.animate();
        }
        else {
          this.status = "Pause";
          this.renderer.togglePauseMessage(this);
          this.isPaused = !this.isPaused;
        }

        break;
    }
  }

  animate() {
    if (this.isPaused) return;

    requestAnimationFrame(() => this.animate());
    this.update(this);
    this.renderer.render();
  }


}