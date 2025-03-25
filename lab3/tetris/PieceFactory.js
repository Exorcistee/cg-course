import { Piece } from './Piece.js';

export class PieceFactory {
    constructor() {
      this.tetrominoes = [
        { name: "O", matrix: [[1, 1], [1, 1]] },
        { name: "I", matrix: [[1, 1, 1, 1]] },
        { name: "T", matrix: [[0, 1, 0], [1, 1, 1]] },
        { name: "S", matrix: [[0, 1, 1], [1, 1, 0]] },
        { name: "Z", matrix: [[1, 1, 0], [0, 1, 1]] },
        { name: "J", matrix: [[1, 0, 0], [1, 1, 1]] },
        { name: "L", matrix: [[0, 0, 1], [1, 1, 1]] }
      ];
    }
  
    createPiece() {
      const randomIndex = Math.floor(Math.random() * this.tetrominoes.length);
      const tetromino = this.tetrominoes[randomIndex];
      return new Piece(tetromino.matrix, Math.floor(10 / 2) - Math.floor(tetromino.matrix[0].length / 2), 20);
    }
  }