import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Piece {
  constructor(matrix, x, y, color) {
    this.matrix = matrix;
    this.x = x;
    this.y = y;
    this.color = color || this.randomColor();
  }

  randomColor() {
    return Math.floor(Math.random() * 0xffffff);
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  createBlock(x, y, blockSize, color = 0x808080) { 
    const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const block = new THREE.Mesh(geometry, material);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    block.add(wireframe); 
  
    block.position.set(
      (this.x + x) * blockSize,  
      (this.y - y) * blockSize,  
      0
    );
    return block;
  }

  createBlocks(blockSize) {
    this.blocks = [];
    const matrix = this.matrix;
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
  

}