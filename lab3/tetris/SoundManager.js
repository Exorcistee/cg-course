export class SoundManager {
    constructor() {
      this.audioLevelUp = new Audio("./audio/levelUp.mp3");
      this.audioGameOver = new Audio("./audio/gameOver.mp3");
      this.audioClearLine = new Audio("./audio/clearLine.mp3");
      this.audioPieceLand = new Audio("./audio/pieceLand.mp3");
      this.audioMain = new Audio("./audio/main.mp3");
    }
  
    playLevelUp() {
      this.audioLevelUp.play();
    }
  
    playGameOver() {
      this.audioGameOver.play();
    }
  
    playClearLine() {
      this.audioClearLine.play();
    }
  
    playPieceLand() {
      this.audioPieceLand.play();
    }

    playMain() {
      this.audioMain.volume = 0.1;
      this.audioMain.loop = true;
      this.audioMain.play();
    }

  }