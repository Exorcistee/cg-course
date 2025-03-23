import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export default class Game {
  constructor({ boardWidth = 10, boardHeight = 20, blockSize = 1 } = {}) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.blockSize = blockSize;
    this.dropInterval = 500; // 1 секунда на падение на 1 клетку
    this.lastDropTime = Date.now();
    this.isPaused = true;  // Флаг паузы
    // Инициализируем логическую сетку: null означает пустую клетку
    this.board = [];
    for (let y = 0; y < boardHeight; y++) {
      this.board[y] = new Array(boardWidth).fill(null);
    }

    this.audio_levelUp = new Audio("./audio/levelUp.mp3");
    this.audio_gameOver = new Audio("./audio/gameOver.mp3");
    this.audio_clearLine= new Audio("./audio/clearLine.mp3");
    this.audio_pieceLand = new Audio("./audio/pieceLand.mp3");


    this.blocks = [];
    this.score = 0; // Очки
    this.level = 1; // Уровень
    this.linesLeft = 1; // Линии для перехода на следующий уровень
    this.linesCleared = 0; // Количество очищенных линий
    this.nextPiece = null;

    // Создаем сцену и рендерер с белым фоном
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffffff);
    document.body.appendChild(this.renderer.domElement);

    // Создаем камеру, чтобы видеть всё игровое поле
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(this.boardWidth / 2, this.boardHeight / 2, this.boardHeight * 1.8);
    this.camera.lookAt(new THREE.Vector3(this.boardWidth / 2, this.boardHeight / 2, 0));

    // Группы для падающей фигуры и для фиксированных блоков
    this.pieceGroup = new THREE.Group();
    this.scene.add(this.pieceGroup);
    this.fixedGroup = new THREE.Group();
    this.scene.add(this.fixedGroup);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0, 0, 10);
    this.scene.add(directionalLight);

    // Рисуем границу игрового поля (окружение) из кубиков
    this.drawBorderSquares();

    // Массив стандартных тетрисовых фигур
    this.tetrominoes = [
      { name: "O", matrix: [[1, 1], [1, 1]] },
      { name: "I", matrix: [[1, 1, 1, 1]] },
      { name: "T", matrix: [[0, 1, 0], [1, 1, 1]] },
      { name: "S", matrix: [[0, 1, 1], [1, 1, 0]] },
      { name: "Z", matrix: [[1, 1, 0], [0, 1, 1]] },
      { name: "J", matrix: [[1, 0, 0], [1, 1, 1]] },
      { name: "L", matrix: [[0, 0, 1], [1, 1, 1]] }
    ];

    this.spawnPiece();

    window.addEventListener('keydown', (e) => this.onKeyDown(e)); 
    window.addEventListener('resize', () => this.onWindowResize());

    this.animate();

    this.createPauseMessage();
    this.createSidePanel();
  }

   createSidePanel() {
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
      <div><strong>Уровень:</strong> <span id="level">${this.level}</span></div>
      <div><strong>Очки:</strong> <span id="score">${this.score}</span></div>
      <div><strong>Осталось линий:</strong> <span id="linesLeft">${this.linesLeft}</span></div>
      <div><strong>Следующая фигура:</strong> <span id="nextPiece"></span></div>
    `;

    document.body.appendChild(sidePanel);
  }

  restartGame() {
    this.clearBoardAndScore();
    this.score = 0;
    this.level = 1;
    this.linesLeft = 10;
    this.linesCleared = 0;
    const gameOverMessage = document.getElementById('gameOverMessage');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
    this.isPaused = false;
    this.togglePauseMessage();
    this.spawnPiece();
    this.updateSidePanel();
}

  // Создает куб с видимыми рёбрами, используется для границы и для фигур
  createBorderCube(x, y, color = 0x808080) {
    const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set((x + 0.5) * this.blockSize, (y + 0.5) * this.blockSize, 0);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    cube.add(wireframe);
    return cube;
  }

  // Рисует границу игрового поля (окружение) из кубиков, включая углы
  drawBorderSquares() {
    const borderGroup = new THREE.Group();
    // Левый край: x = -1
    for (let y = 0; y < this.boardHeight; y++) {
      borderGroup.add(this.createBorderCube(-1, y));
    }
    // Правый край: x = boardWidth
    for (let y = 0; y < this.boardHeight; y++) {
      borderGroup.add(this.createBorderCube(this.boardWidth, y));
    }
    // Нижний край: y = -1
    for (let x = 0; x < this.boardWidth; x++) {
      borderGroup.add(this.createBorderCube(x, -1));
    }
    // Верхний край: y = boardHeight
    for (let x = 0; x < this.boardWidth; x++) {
      borderGroup.add(this.createBorderCube(x, this.boardHeight));
    }
    // Угловые кубики
    borderGroup.add(this.createBorderCube(-1, -1));
    borderGroup.add(this.createBorderCube(-1, this.boardHeight));
    borderGroup.add(this.createBorderCube(this.boardWidth, -1));
    borderGroup.add(this.createBorderCube(this.boardWidth, this.boardHeight));
    this.scene.add(borderGroup);
  }

  toggleLevelUpMessage() {
    const pauseMessage = document.getElementById('levelUp');
    if (this.isPaused) {
      pauseMessage.style.display = 'block'; // Show the message
    } else {
      pauseMessage.style.display = 'none'; // Hide the message
    }
  }


  togglePauseMessage() {
    const pauseMessage = document.getElementById('pauseMessage');
    if (this.isPaused) {
      pauseMessage.style.display = 'block'; // Show the message
    } else {
      pauseMessage.style.display = 'none'; // Hide the message
    }
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

  createPauseMessage() {
    const pauseMessage = document.createElement('div');
    pauseMessage.id = 'levelUp';
    pauseMessage.style.position = 'absolute';
    pauseMessage.style.top = '50%';
    pauseMessage.style.left = '50%';
    pauseMessage.style.transform = 'translate(-50%, -50%)';
    pauseMessage.style.fontSize = '48px';
    pauseMessage.style.color = 'black';
    pauseMessage.style.fontWeight = 'bold';
    pauseMessage.style.display = 'none'; // Initially hidden
    pauseMessage.innerHTML = 'Уровень пройден.';
    document.body.appendChild(pauseMessage);
  }

  // Проверяет, можно ли переместить фигуру на dx, dy без коллизии с границами или фиксированными блоками
  isValidPosition(piece, dx, dy) {
    const matrix = piece.shape;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          const newX = piece.x + col + dx;
          const newY = piece.y + row + dy;
          if (newX < 0 || newX >= this.boardWidth || newY < 0) return false;
          if (this.board[newY] && this.board[newY][newX] !== null) return false;
        }
      }
    }
    return true;
  }

  isSpawnPositionValid(piece) {
    const matrix = piece.shape;

    // Проверка только в верхней части, где должна появляться фигура
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const newX = piece.x + col;
                const newY = piece.y + row;

                // Проверка на занятость клетки в верхней части поля
                if (newY < 0 || newX < 0 || newX >= this.boardWidth || newY >= this.boardHeight || this.board[newY][newX] !== null) {
                    return false;  // Место занято или выходит за пределы
                }
            }
        }
    }
    return true;  // Место свободно
}

  // Фиксирует текущую фигуру: добавляет её кубики в логическую сетку и в группу фиксированных блоков
  fixPiece() {
    let index = 0;
    const matrix = this.currentPiece.shape;
  
  
    // Проверка на наличие блоков в массиве blocks перед фиксацией
    if (this.blocks.length === 0) {
      return; // Прерываем выполнение, если нет блоков для фиксации
    }
  
    // Проходим по каждому элементу фигуры
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          const boardX = this.currentPiece.x + col;
          const boardY = this.currentPiece.y + row;
  
          // Получаем блок из массива blocks
          const cube = this.blocks[index];
  
          console.log("Fixing block:", cube);
  
          // Проверяем, что блок существует
          if (cube instanceof THREE.Object3D) {
            this.board[boardY][boardX] = cube;
            this.fixedGroup.add(cube);
          } else {
            console.error("Block is not valid:", cube); // Логирование ошибки, если блок не найден
          }
  
          index++;
        }
      }
    }
    this.audio_pieceLand.play();
    // Очищаем массив blocks и group после их фиксации
    this.blocks = []; // Очищаем массив блоков
    while (this.pieceGroup.children.length > 0) {
      const removedBlock = this.pieceGroup.children[0];
      this.pieceGroup.remove(removedBlock);
    }
  
    this.checkLines();
  }

  checkLines() {
    let count = 0;
    for (let y = 0; y < this.boardHeight; y++) {
      let full = true;
      for (let x = 0; x < this.boardWidth; x++) {
        console.log(this.board[y][x]);
        if (this.board[y][x] === null) {
          full = false;
          break;
        }
      }
      if (full) {
        console.log("full");
        count += 1;
        this.removeLine(y);
        this.linesLeft -= 1;
        y--; // пересмотреть ту же строку после сдвига
      }
    }
    if (this.score - this.updateScore(count) != 0)
    {
      this.audio_clearLine.play();
    }
    console.log(this.score, this.updateScore(count), count);
    this.score = this.score + this.updateScore(count);
    this.updateSidePanel();
  }

  updateScore(count)
  {
    if (count === 1) return 10;  
    if (count === 2) return 30;
    if (count === 3) return 70;  
    if (count === 4) return 150; 
    else return 0;   
  }

  removeLine(lineY) {
    // Удаляем все кубики в строке
    for (let x = 0; x < this.boardWidth; x++) {
      const cube = this.board[lineY][x];
      if (cube) {
        this.fixedGroup.remove(cube);
        this.scene.remove(cube);
        this.board[lineY][x] = null;
      }
    }
    // Опускаем все строки выше на 1
    for (let y = lineY + 1; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        const cube = this.board[y][x];
        if (cube) {
          cube.position.y -= this.blockSize;
          this.board[y - 1][x] = cube;
          this.board[y][x] = null;
        }
      }
    }
  }

  // Спавнит новую фигуру. Если текущая фигура не может опуститься, фиксирует её.
  spawnPiece() {
      // Если уже есть фигура и она не может опуститься вниз, фиксируем её
    if (this.currentPiece && !this.isValidPosition(this.currentPiece, 0, -1)) {
      this.fixPiece();
    }
    
    const randomIndex = Math.floor(Math.random() * this.tetrominoes.length);
    const tetromino = this.tetrominoes[randomIndex];

    this.currentPiece = {
      shape: tetromino.matrix,
      x: Math.floor((this.boardWidth - tetromino.matrix[0].length) / 2),
      y: this.boardHeight - tetromino.matrix.length
    };

    const randomColor = Math.floor(Math.random() * 0xffffff);

    // Очистка группы pieceGroup перед созданием новой фигуры
    this.pieceGroup.clear();
    this.blocks = []; // Очищаем массив блоков перед добавлением новых

    if (!this.isSpawnPositionValid(this.currentPiece)) {
      this.gameOver(); // Если место занято, игра окончена
      return;
  }
    // Создание и добавление блоков в pieceGroup и массив
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const block = this.createBorderCube(0, 0, randomColor);
          block.position.set(
            (this.currentPiece.x + col + 0.5) * this.blockSize,
            (this.currentPiece.y + row + 0.5) * this.blockSize,
            0
          );
          
          this.pieceGroup.add(block);
          this.blocks.push(block); // Добавляем в массив блоков
        }
      }
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

  // Обновляет позицию кубиков падающей фигуры
  updatePiecePosition() {
    let index = 0;
    const matrix = this.currentPiece.shape; 
    const height = matrix.length;  // Количество строк
    const width = matrix[0].length; // Количество колонок
  
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
  isValidMove(dx, dy) {
    return this.isValidPosition(this.currentPiece, dx, dy);
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

  clearBoardAndScore() {
    // Подсчитываем количество чистых строк
    let emptyRowsCount = 0;
    for (let y = 0; y < this.boardHeight; y++) {
        let isRowEmpty = true;
        for (let x = 0; x < this.boardWidth; x++) {
            if (this.board[y][x] !== null) {
                isRowEmpty = false;
                break;
            }
        }
        if (isRowEmpty) {
            emptyRowsCount++;
        }
    }

    this.score += emptyRowsCount * 10;
    this.board = this.board.map(row => row.map(() => null));  
    this.fixedGroup.clear();
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

  rotatePiece() {
    const matrix = this.currentPiece.shape;
    const height = matrix.length;  // Количество строк
    const width = matrix[0].length; // Количество колонок
  
    const newShape = [];
  
    // Поворот по часовой стрелке: транспонируем и инвертируем строки
    for (let col = 0; col < width; col++) {
      newShape[col] = [];
      for (let row = 0; row < height; row++) {
        // Переносим элементы для поворота по часовой стрелке
        newShape[col][height - 1 - row] = matrix[row][col];
      }
    }
  
    // Сохраняем старую форму для отката, если новая позиция недопустима
    const oldShape = this.currentPiece.shape;
    this.currentPiece.shape = newShape;
  
    // Если новая позиция недопустима, возвращаем старую форму
    if (!this.isValidPosition(this.currentPiece, 0, 0)) {
      this.currentPiece.shape = oldShape;
    } else {
      this.updatePiecePosition(); // Обновляем позицию фигуры после вращения
    }
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
            if (this.isPaused) {
                this.restartGame();  // Перезапуск игры
            } else {
                this.isPaused = !this.isPaused; // Переключаем состояние паузы
                this.togglePauseMessage(); // Обновляем видимость сообщения паузы
            }
            break;
      }
  }

  onWindowResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.paused) return;

    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

