import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Piece {
  constructor(shape, x, y) {
    this.shape = shape; 
    this.x = x; 
    this.y = y; 
    this.blocks = []; 
  }

  fixPiece(board) {
    let index = 0;
    const matrix = this.shape;

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) { 
          const boardX = this.x + col;
          const boardY = this.y + row;

          const cube = this.blocks[index];

          console.log("Fixing block:", cube);

          if (cube instanceof THREE.Object3D) {
            if (boardY >= 0 && boardY < board.boardHeight && boardX >= 0 && boardX < board.boardWidth) {
              board.board[boardY][boardX] = cube; 
              board.fixedGroup.add(cube); 
            } else {
              console.error("Block is out of bounds:", cube);
            }
          } else {
            console.error("Block is not valid:", cube); 
          }

          index++;
        }
      }
    }

    board.audio_pieceLand.play();

    this.blocks = []; 
    while (board.pieceGroup.children.length > 0) {
      const removedBlock = board.pieceGroup.children[0];
      board.pieceGroup.remove(removedBlock);
    }

    board.checkLines();
  }

  // Метод для вращения фигуры
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
}