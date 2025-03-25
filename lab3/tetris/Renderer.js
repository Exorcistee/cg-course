import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Renderer {
    constructor(board, game) {
        this.board = board;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff);
        document.body.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(board.boardWidth / 2, board.boardHeight / 2, board.boardHeight * 1.8);
        this.camera.lookAt(new THREE.Vector3(board.boardWidth / 2, board.boardHeight / 2, 0));
        this.createLevelUpMessage();
        this.createPauseMessage();
        this.createStartMessage();
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(0, 0, 10);
        this.scene.add(directionalLight);
        this.toggleStartMessage(game);
        this.drawBoard();
        this.createSidePanel(game);

    }

    drawBoard() {
        const board = this.board.drawBoard();
        this.scene.add(board);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    togglePauseMessage(game) {
        const pauseMessage = document.getElementById('pauseMessage');
        if (game.status == "Pause") {
        pauseMessage.style.display = 'block'; // Show the message
        } else {
        pauseMessage.style.display = 'none'; // Hide the message
        }
    }

    toggleLevelUpMessage(game) {
        const pauseMessage = document.getElementById('levelUp');
        if (game.status == "LevelUp") {
        pauseMessage.style.display = 'block'; // Show the message
        } else {
        pauseMessage.style.display = 'none'; // Hide the message
        }
    }

    toggleStartMessage(game) {
        console.log(game);
        console.log(game.getStatus());
        const pauseMessage = document.getElementById('Start');
        if (game.status == "Start") {
            pauseMessage.style.display = 'block'; // Show the message
        } else {
            pauseMessage.style.display = 'none'; // Hide the message
        }  
    }

    createSidePanel(game) {
        const sidePanel = document.createElement('div');
        sidePanel.id = 'sidePanel';
        sidePanel.style.position = 'absolute';
        sidePanel.style.top = '45%';
        sidePanel.style.right = '20%';
        sidePanel.style.fontSize = '20px';
        sidePanel.style.fontFamily = 'Arial, sans-serif';
        sidePanel.style.color = 'black';
        sidePanel.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';

        sidePanel.innerHTML = `
          <div><strong>Уровень:</strong> <span id="level">${game.level}</span></div>
          <div><strong>Очки:</strong> <span id="score">${game.score}</span></div>
          <div><strong>Осталось линий:</strong> <span id="linesLeft">${game.linesLeft}</span></div>
          <div><strong>Следующая фигура:</strong> <span id="nextPiece"></span></div>
        `;

        document.body.appendChild(sidePanel);
    }

    createPauseMessage() {
        const pauseMessage = document.createElement('div');
        pauseMessage.id = 'pauseMessage';
        pauseMessage.style.position = 'absolute';
        pauseMessage.style.top = '50%';
        pauseMessage.style.left = '50%';
        pauseMessage.style.transform = 'translate(-50%, -50%)';
        pauseMessage.style.fontSize = '48px';
        pauseMessage.style.color = 'black';
        pauseMessage.style.fontWeight = 'bold';
        pauseMessage.style.display = 'none'; // Initially hidden
        pauseMessage.innerHTML = 'PAUSED';
        document.body.appendChild(pauseMessage);
    }

    createLevelUpMessage() {
        const levelUpmessage = document.createElement('div');
        levelUpmessage.id = 'levelUp';
        levelUpmessage.style.position = 'absolute';
        levelUpmessage.style.top = '50%';
        levelUpmessage.style.left = '50%';
        levelUpmessage.style.transform = 'translate(-50%, -50%)';
        levelUpmessage.style.fontSize = '48px';
        levelUpmessage.style.color = 'black';
        levelUpmessage.style.fontWeight = 'bold';
        levelUpmessage.style.display = 'none'; // Initially hidden
        levelUpmessage.innerHTML = 'Уровень пройден.';
        document.body.appendChild(levelUpmessage);
    }

    createStartMessage() {
        const startMessage = document.createElement('div');
        startMessage.id = 'Start';
        startMessage.style.position = 'absolute';
        startMessage.style.top = '50%';
        startMessage.style.left = '50%';
        startMessage.style.transform = 'translate(-50%, -50%)';
        startMessage.style.fontSize = '48px';
        startMessage.style.color = 'black';
        startMessage.style.fontWeight = 'bold';
        startMessage.style.display = 'none'; // Initially hidden
        startMessage.innerHTML = 'Press P for start game.';
        document.body.appendChild(startMessage);
    }

    update() {
        if (this.isPaused) return;

        const now = Date.now();
        if (now - this.lastDropTime > this.dropInterval) {
            this.lastDropTime = now;
            if (this.isValidMove(0, -1)) {
                this.currentPiece.y -= 1;
                this.updatePiecePosition();
            } else {
                this.fixPiece();
                this.spawnPiece();
            }
        }

        if (this.linesCleared >= this.linesLeft) {
            this.levelUp();
            this.updateSidePanel();
        }
    }

    gameOver() {
        this.audio_gameOver.play();
        this.isPaused = true; // Включаем паузу
        const gameOverMessage = document.createElement('div');
        gameOverMessage.id = 'gameOverMessage';
        gameOverMessage.style.position = 'absolute';
        gameOverMessage.style.top = '50%';
        gameOverMessage.style.left = '50%';
        gameOverMessage.style.transform = 'translate(-50%, -50%)';
        gameOverMessage.style.fontSize = '48px';
        gameOverMessage.style.color = 'red';
        gameOverMessage.style.fontWeight = 'bold';
        gameOverMessage.style.display = 'block'; // Показываем сообщение
        gameOverMessage.innerHTML = 'GAME OVER';
        document.body.appendChild(gameOverMessage);
    }

    updateSidePanel() {
        console.log("Линия очищена");
        const levelElement = document.getElementById('level');
        const scoreElement = document.getElementById('score');
        const linesLeftElement = document.getElementById('linesLeft');
        const nextPieceElement = document.getElementById('nextPiece');

        if (levelElement) levelElement.textContent = this.level;
        if (scoreElement) scoreElement.textContent = this.score;
        if (linesLeftElement) linesLeftElement.textContent = this.linesLeft;
    }

    updatePiecePosition() {
        let index = 0;
        const matrix = this.currentPiece.shape;
        const height = matrix.length;  
        const width = matrix[0].length; 

        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    const block = this.pieceGroup.children[index];

                    if (block instanceof THREE.Object3D) {
                        block.position.set(
                            (this.currentPiece.x + col + 0.5) * this.blockSize,
                            (this.currentPiece.y + row + 0.5) * this.blockSize,
                            0
                        );
                    } else {
                        console.error("Block is not valid in updatePiecePosition", block);
                    }

                    index++;
                }
            }
        }
    }

}