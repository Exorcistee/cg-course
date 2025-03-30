import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Piece {
  constructor(shape, x, y) {
    this.shape = shape; 
    this.x = x; 
    this.y = y; 
    this.blocks = []; 
  }

    createBlocks(blockSize) {
      this.blocks = [];
      const matrix = this.shape;
      const color = Math.floor(Math.random() * 0xFFFFFF);
      for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
          if (matrix[row][col]) {
            const block = this.createBlock(col, row, blockSize, color);
            this.blocks.push(block);
          }
        }
      }
    }
  
    createBlock(x, y, blockSize, color = 0x808080) { 
      const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
      const material = new THREE.MeshPhongMaterial({ color: color });
      const block = new THREE.Mesh(geometry, material);
      const edges = new THREE.EdgesGeometry(geometry); 
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); 
      const wireframe = new THREE.LineSegments(edges, lineMaterial); 
      block.add(wireframe); // Добавляем рёбра к блоку
    
      block.position.set(
        (this.x + x) * blockSize,  
        (this.y - y) * blockSize,  
        0
      );
      return block;
    }
  
    updateBlocks() {
      const blockSize = this.blocks[0].geometry.parameters.width; 
      this.blocks.forEach((block, index) => {
        const matrix = this.shape;
        const row = Math.floor(index / matrix[0].length);
        const col = index % matrix[0].length;
        if (matrix[row][col]) {
          block.position.set(
            (this.x + col) * blockSize,
            (this.y - row) * blockSize,
            0
          );
        }
      });
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