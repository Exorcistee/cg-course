import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Renderer {
    constructor(blockSize, boardHeight, board, game) {
        this.board = board;
        this.blockSize = blockSize;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.display = 'block'; // Убирает лишние отступы
        this.renderer.domElement.style.width = '100vw';
        this.renderer.domElement.style.height = '100vh';
        this.renderer.setClearColor(0x000000, 0);
        document.body.appendChild(this.renderer.domElement);
        this.pieceGroup = new THREE.Group(); // Добавьте эту строку
        this.scene.add(this.pieceGroup);
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(board.boardWidth / 2, board.boardHeight / 2, board.boardHeight * 1.8);
        this.camera.lookAt(new THREE.Vector3(board.boardWidth / 2, board.boardHeight / 2, 0));
        this.createLevelUpMessage();
        this.createPauseMessage();
        this.createStartMessage();
        this.createGameOverMessage();
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(0, 0, 10);
        this.scene.add(directionalLight);
        this.toggleStartMessage(game);
        this.drawBoard();
        this.createSidePanel(game);

    }

    addPiece(piece) {
        this.pieceGroup.clear();

        for (let row = 0; row < piece.matrix.length; row++) {
            for (let col = 0; col < piece.matrix[row].length; col++) {
                if (piece.matrix[row][col]) {
                    const block = this.createBlock(piece.color);
                    block.position.set(
                        (piece.x + col + 0.5) * this.blockSize,
                        (piece.y + row + 0.5) * this.blockSize,
                        0
                    );
                    this.pieceGroup.add(block);
                }
            }
        }
    }

    createBlock(color) {
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const cube = new THREE.Mesh(geometry, material);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        cube.add(wireframe);
        return cube;
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
        console.log(game.getStatus());
        const pauseMessage = document.getElementById('levelUp');
        if (game.status == "LevelUp") {
            pauseMessage.style.display = 'block'; // Show the message
        } else {
            pauseMessage.style.display = 'none'; // Hide the message
        }
    }

    toggleStartMessage(game) {
        const pauseMessage = document.getElementById('Start');
        console.log(game.status);
        if (game.status == "Start") {
            pauseMessage.style.display = 'block'; // Show the message
        } else {
            pauseMessage.style.display = 'none'; // Hide the message
        }
    }

    updateNextPiecePreview(nextPiece) {
        const nextPieceContainer = document.getElementById('nextPiece');
        nextPieceContainer.innerHTML = '';
        
        // Определяем размеры фигуры
        const width = nextPiece.matrix[0].length;
        const height = nextPiece.matrix.length;
        
        // Создаем контейнер для превью
        const previewGrid = document.createElement('div');
        previewGrid.style.display = 'grid';
        previewGrid.style.gridTemplateColumns = `repeat(${width}, 20px)`;
        previewGrid.style.gridTemplateRows = `repeat(${height}, 20px)`;
        previewGrid.style.gap = '2px';
        previewGrid.style.marginTop = '10px';
    
        // Отображаем фигуру в том же виде, как она будет спавниться
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const cell = document.createElement('div');
                cell.style.width = '20px';
                cell.style.height = '20px';
                // Отображаем снизу вверх (как в игре)
                const displayRow = height - 1 - row;
                cell.style.backgroundColor = nextPiece.matrix[displayRow][col] 
                    ? `#${nextPiece.color.toString(16).padStart(6, '0')}` 
                    : 'transparent';
                cell.style.border = '1px solid #ddd';
                previewGrid.appendChild(cell);
            }
        }
    
        nextPieceContainer.appendChild(previewGrid);
    }

    createSidePanel(game) {
        const sidePanel = document.createElement('div');
        sidePanel.id = 'sidePanel';
        sidePanel.style.position = 'fixed'; 
        sidePanel.style.top = '20px';
        sidePanel.style.right = '20px';
        sidePanel.style.width = '250px'; 
        sidePanel.style.fontSize = '22px'; 
        sidePanel.style.fontFamily = 'Arial, sans-serif';
        sidePanel.style.color = 'white';
        sidePanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        sidePanel.style.padding = '20px';
        sidePanel.style.borderRadius = '15px';
        sidePanel.style.border = '2px solid #444';
        sidePanel.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
        sidePanel.style.zIndex = '100';
    
        sidePanel.innerHTML = `
            <h2 style="margin-bottom: 20px; text-align: center;">СТАТИСТИКА</h2>
            <div style="margin-bottom: 15px;">
                <strong>Уровень:</strong> 
                <span id="level" style="float: right;">${game.level}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Очки:</strong>
                <span id="score" style="float: right;">${game.score}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Линии:</strong>
                <span id="linesLeft" style="float: right;">${game.linesLeft}</span>
            </div>
            <div style="margin: 25px 0 15px 0;">
                <strong style="font-size: 20px;">Следующая:</strong>
            </div>
            <div id="nextPiece" style="
                display: flex; 
                justify-content: center;
                margin-top: 10px;
                min-height: 100px;
            "></div>
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
        pauseMessage.style.display = 'none';
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
        levelUpmessage.style.display = 'none';
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
        startMessage.style.display = 'none';
        startMessage.innerHTML = 'Press P for start game.';
        document.body.appendChild(startMessage);
    }

    createGameOverMessage() {
        const gameOverMessage = document.createElement('div');
        gameOverMessage.id = 'GameOver';
        gameOverMessage.style.position = 'absolute';
        gameOverMessage.style.top = '50%';
        gameOverMessage.style.left = '50%';
        gameOverMessage.style.transform = 'translate(-50%, -50%)';
        gameOverMessage.style.fontSize = '48px';
        gameOverMessage.style.color = 'red';
        gameOverMessage.style.fontWeight = 'bold';
        gameOverMessage.style.display = 'none'; // Показываем сообщение
        gameOverMessage.innerHTML = 'GAME OVER';
        document.body.appendChild(gameOverMessage);
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

    toggleGameOverMessage(game) {
        const gameOverMessage = document.getElementById('GameOver');
        console.log(game.status);
        if (game.status == "GameOver") {
            gameOverMessage.style.display = 'block'; // Show the message
        } else {
            gameOverMessage.style.display = 'none'; // Hide the message
        }
    }

    updateSidePanel(level, score, linesLeft) {
        const levelElement = document.getElementById('level');
        const scoreElement = document.getElementById('score');
        const linesLeftElement = document.getElementById('linesLeft');
        const nextPieceElement = document.getElementById('nextPiece');

        if (levelElement) levelElement.textContent = level;
        if (scoreElement) scoreElement.textContent = score;
        if (linesLeftElement) linesLeftElement.textContent = linesLeft;
    }

    updatePiecePosition(currentPiece) {
        let index = 0;
        const matrix = currentPiece.matrix;

        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    const block = this.pieceGroup.children[index];

                    if (block instanceof THREE.Object3D) {
                        block.position.set(
                            (currentPiece.x + col + 0.5) * this.blockSize,
                            (currentPiece.y + row + 0.5) * this.blockSize,
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