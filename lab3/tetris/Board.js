import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Board {
  constructor(boardWidth, boardHeight, blockSize) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.blockSize = blockSize;
    this.board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(null));
    this.fixedGroup = new THREE.Group();
    this.dropInterval = 500;
  }

  addPiece(piece) {
    this.pieceGroup = new THREE.Group(); // Создаём группу для текущей фигуры
    piece.blocks.forEach(block => {
      this.pieceGroup.add(block); // Добавляем блоки фигуры в группу
    });
    this.fixedGroup.add(this.pieceGroup); // Добавляем группу на поле
  }

  drawBoard() {
    const borderGroup = new THREE.Group();

    for (let y = 0; y < this.boardHeight; y++) {
      borderGroup.add(this.createBlock(-1, y));
      borderGroup.add(this.createBlock(this.boardWidth, y)); 
    }
    for (let x = 0; x < this.boardWidth; x++) {
      borderGroup.add(this.createBlock(x, -1)); 
    }

    borderGroup.add(this.createBlock(-1, -1));
    borderGroup.add(this.createBlock(-1, this.boardHeight));
    borderGroup.add(this.createBlock(this.boardWidth, -1));
    borderGroup.add(this.createBlock(this.boardWidth, this.boardHeight));

    return borderGroup;
  }

  createBlock(x, y, color = 0x808080) {
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

  isValidMove(piece, dx, dy) {
    const matrix = piece.shape;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          const newX = piece.x + col + dx;
          const newY = piece.y + row + dy;
  
          // Проверка выхода за пределы доски
          if (newX < 0 || newX >= this.boardWidth || newY < 0 || newY >= this.boardHeight) {
            return false;
          }
  
          // Проверка на занятость ячейки
          if (this.board[newY] && this.board[newY][newX] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }


  checkLines() {
    let count = 0;
    for (let y = 0; y < this.boardHeight; y++) {
      let full = true;
      for (let x = 0; x < this.boardWidth; x++) {
        if (this.board[y][x] === null) {
          full = false;
          break;
        }
      }
      if (full) {
        this.removeLine(y);
        count++;
      }
    }
  }

  fixPiece(piece) {
    let index = 0;
    const matrix = piece.shape;
  
    // Проверка на наличие блоков в массиве blocks перед фиксацией
    if (piece.blocks.length === 0) {
      return; // Прерываем выполнение, если нет блоков для фиксации
    }
  
    // Проходим по каждому элементу фигуры
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          const boardX = piece.x + col;
          const boardY = piece.y + row;
  
          // Получаем блок из массива blocks
          const cube = piece.blocks[index];
  
          // Проверяем, что блок существует
          if (cube instanceof THREE.Object3D) {
            console.log(boardX, boardY);
            console.log(this.board);
            this.board[boardY][boardX] = cube; // Сохраняем блок на доске
            this.fixedGroup.add(cube); // Добавляем блок в fixedGroup
          } else {
            console.error("Block is not valid:", cube); // Логирование ошибки, если блок не найден
          }
  
          index++;
        }
      }
    }
  
    this.audio_pieceLand.play();
    
    // Очищаем массив blocks и pieceGroup после их фиксации
    piece.blocks = []; // Очищаем массив блоков
    while (this.pieceGroup.children.length > 0) {
      const removedBlock = this.pieceGroup.children[0];
      this.pieceGroup.remove(removedBlock);
    }
  
    this.checkLines(); // Проверка линий после фиксации фигуры
  }

  removeLine(lineY) {
    for (let x = 0; x < this.boardWidth; x++) {
      this.fixedGroup.remove(this.board[lineY][x]);
      this.board[lineY][x] = null;
    }
    for (let y = lineY - 1; y >= 0; y--) {
      for (let x = 0; x < this.boardWidth; x++) {
        if (this.board[y][x] !== null) {
          this.board[y + 1][x] = this.board[y][x];
          this.board[y][x] = null;
        }
      }
    }
  }

  clearBoardAndScore() {
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

}