import { Board } from './Board.js';
import { Renderer } from './Renderer.js';
import { SoundManager } from './SoundManager.js';
import { PieceFactory } from './PieceFactory.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export default class Game {
  constructor({ boardWidth = 10, boardHeight = 20, blockSize = 1 } = {}) {
    this.level = 1;
    this.score = 0;
    this.linesLeft = 1;
    this.linesCleared = 0;
    this.status = "Start";
    this.isPaused = true;
    this.lastDropTime = Date.now();
    this.board = new Board(boardWidth, boardHeight, blockSize);
    this.renderer = new Renderer(this.board, this);
    this.soundManager = new SoundManager();
    this.pieceFactory = new PieceFactory();

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('resize', () => this.onWindowResize());

    this.animate();

  }

  setStatus(newStatus) {
    this.status = newStatus;
  }

  getStatus() {
    console.log(this.status);
    return this.status;
  }

  getLevel() {
    return this.level;
  }

  getScore() {
    return this.score;
  }

  getlinesLeft() {
    return this.linesLeft; 
  }

  spawnPiece() {
    this.currentPiece = this.pieceFactory.createPiece(); 
    this.board.addPiece(this.currentPiece); 
  }

  updateSidePanel() {
    console.log("Обновление панели");
     this.renderer.updateSidePanel(this.getLevel(), this.getScore(), this.getLinesLeft());
  }

  update() {
    if (this.isPaused) return;

    const now = Date.now();
    if (now - this.lastDropTime > this.board.dropInterval) {
      this.lastDropTime = now;
      if (this.board.isValidMove(this.currentPiece, 0, -1)) {
        this.currentPiece.y -= 1;
      } else {
        this.board.fixPiece(this.currentPiece);
        this.spawnPiece();
      }
    }
  }

  restartGame() {
    this.score = 0;
    this.level = 1;
    this.linesLeft = 10;
    this.linesCleared = 0;
    this.renderer.updateSidePanel();
    const gameOverMessage = document.getElementById('gameOverMessage');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
    this.isPaused = false;
    this.renderer.togglePauseMessage();
    this.pieceFactory.();
    this.updateSidePanel();
}

  levelUp() {
    this.clearBoardAndScore();
    this.isPaused = !this.isPaused;
    this.toggleLevelUpMessage();
    this.level++;
    this.linesLeft = 10 + (this.level - 1) * 2; // На каждом уровне добавляется 2 линии для следующего уровня
    this.dropInterval *= 0.8; // Уменьшаем время падения на 10%
    this.linesCleared = 0; // Обнуляем количество очищенных линий
    this.audio_levelUp.play();
  }

  onKeyDown(e) {
    switch (e.key) {
      case "ArrowLeft":
        if (this.isValidMove(-1, 0)) {
          this.currentPiece.x -= 1;
          this.updatePiecePosition();
        }
        break;
      case "ArrowRight":
        if (this.isValidMove(1, 0)) {
          this.currentPiece.x += 1;
          this.updatePiecePosition();
        }
        break;
      case "ArrowDown":
        if (this.isValidMove(0, -1)) {
          this.currentPiece.y -= 1;
          this.updatePiecePosition();
        }
        break;
      case "ArrowUp":
        this.rotatePiece(); 
        break;
      case "p":
            if (this.status == "GameOver") {
                this.restartGame();  // Перезапуск игры
            } else if (this.status == "Start") {
              this.restartGame();
            }
            else {
              this.isPaused = !this.isPaused; // Переключаем состояние паузы
              //this.togglePauseMessage(); // Обновляем видимость сообщения паузы
            }
            break;
      }
  }

  animate() {
    if (this.paused) return;

    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }


}