import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Board {
  constructor(boardWidth, boardHeight, blockSize, scene) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.blockSize = blockSize;
    this.board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(null));
    this.fixedGroup = new THREE.Group();
    this.dropInterval = 500;
  }

  addScene(scene) {
    this.scene = scene; 
    this.scene.add(this.fixedGroup);
  }

  addPiece(piece) {
    if (this.pieceGroup) {
      this.fixedGroup.remove(this.pieceGroup);
    }

    this.pieceGroup = new THREE.Group();

    this.pieceGroup.position.set(
      piece.x * this.blockSize,
      -piece.y * this.blockSize,
      0
    );

    piece.blocks.forEach(block => {
      if (block instanceof THREE.Mesh) {
        this.pieceGroup.add(block.clone());
      }
    });

    this.fixedGroup.add(this.pieceGroup);

  }

  setCurrentPiece(piece) {
    this.currentPiece = piece;
    this.currentPiece.x = Math.floor(this.boardWidth / 2) - 1; 
    this.currentPiece.y = this.boardHeight - 1; 
  }

  isValidSpawn(piece) {
    for (let row = 0; row < piece.matrix.length; row++) {
      for (let col = 0; col < piece.matrix[row].length; col++) {
        if (piece.matrix[row][col]) {
          const x = piece.x + col;
          const y = piece.y + row;
          if (x < 0 || x >= this.boardWidth || y < 0 || this.board[y - 1][x - 1]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  isValidMove(piece, dx, dy) {
    const matrix = piece.matrix;
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const newX = piece.x + col + dx;
                const newY = piece.y + row + dy;
                if (newX < 0 || newX >= this.boardWidth || newY < 0) return false;
                if (newY < this.boardHeight && this.board[newY][newX] !== null) return false;
            }
        }
    }
    return true;
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
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    cube.position.set((x + 0.5) * this.blockSize, (y + 0.5) * this.blockSize, 0);
    cube.add(wireframe);
    return cube;
  }

  countScore(count) {
    console.log(count);
    if (count == 1) return 10;
    if (count == 2) return 30;
    if (count == 3) return 70;
    if (count == 4) return 150;
    else return 0;
  }

  rotatePiece(piece) {
    const matrix = piece.matrix;
    const height = matrix.length;
    const width = matrix[0].length;

    const newShape = [];
    for (let col = 0; col < width; col++) {
        newShape[col] = [];
        for (let row = 0; row < height; row++) {
            newShape[col][row] = matrix[height - 1 - row][col];
        }
    }

    const oldShape = piece.matrix;
    piece.matrix = newShape;

    if (!this.isValidMove(piece, 0, 0)) {
        piece.matrix = oldShape;
    }
}

  fixCurrentPiece(piece, game) {
    if (!this.fixedGroup) {
      this.fixedGroup = new THREE.Group();
      this.scene.add(this.fixedGroup);
    }

    for (let row = 0; row < piece.matrix.length; row++) {
      for (let col = 0; col < piece.matrix[row].length; col++) {
        if (piece.matrix[row][col]) {
          const boardX = piece.x + col;
          const boardY = piece.y + row;

          if (boardY >= 0 && boardY < this.boardHeight &&
            boardX >= 0 && boardX < this.boardWidth) {

            const fixedBlock = this.createBlock(
              boardX,
              boardY,
              piece.color
            );

            this.board[boardY][boardX] = fixedBlock;
            this.fixedGroup.add(fixedBlock);
          }
        }
      }
    }

    let sound = game.getSoundManager();
    sound.playPieceLand();

    this.checkLines(game);
  }

  removeLine(lineY) {
    console.log("Стираем");
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

  checkLines(game) {
    let count = 0;
    let y = 0;
    while (y < this.boardHeight) {
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
      } else {
        y++;
      }
    }
    game.setLinesLeft(game.getLinesLeft() - count);
    game.setScore(game.getScore() + this.countScore(count));
    let sound = game.getSoundManager();
    if (count != 0) sound.playClearLine();
  }

  clearBoard() {
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
  }

}