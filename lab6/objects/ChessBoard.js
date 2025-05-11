import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import {OBJLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/MTLLoader.js';
import { ChessPiece } from './ChessPiece.js';

export class ChessBoard {
    constructor() {
        this.size = 8;
        this.squareSize = 1.0; // Размер клетки (1 единица = 1 клетка)
        this.boardSize = this.size * this.squareSize;
        this.mesh = new THREE.Group();
        this.pieces = [];
        this.pieceScale = 0.4;
    }

    async load() {
        await this.createBoard();
        await this.setupPieces();
        return true;
    }

    createBoard() {
    // Смещение всей доски (фигуры + клетки + основание)
    const boardOffsetX = 2; // Смещение по X (если нужно)
    const boardOffsetZ = 0; // Сдвигаем доску вперед по Z

    // 1. Основание доски
    const boardGeometry = new THREE.BoxGeometry(
        this.boardSize, 
        0, 
        this.boardSize
    );
    const boardMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.8
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(
        boardOffsetX, 
        -0.2, // Чуть ниже фигур
        boardOffsetZ // Сдвиг вперед
    );
    board.receiveShadow = true;
    this.mesh.add(board);

    // 2. Создаем клетки с тем же смещением
    const tileGeometry = new THREE.PlaneGeometry(
        this.squareSize, 
        this.squareSize
    );
    
    const darkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x769656,
        roughness: 0.7
    });
    
    const lightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xeeeed2,
        roughness: 0.5
    });

    for (let x = 0; x < this.size; x++) {
        for (let z = 0; z < this.size; z++) {
            const tile = new THREE.Mesh(
                tileGeometry,
                (x + z) % 2 === 0 ? lightMaterial : darkMaterial
            );
            
            // Позиционируем клетки с учетом смещения доски
            tile.rotation.x = -Math.PI / 2;
            tile.position.set(
                x * this.squareSize - this.boardSize/2 + this.squareSize/2 + boardOffsetX,
                0.01,
                z * this.squareSize - this.boardSize/2 + this.squareSize/2 + boardOffsetZ
            );
            tile.receiveShadow = true;
            this.mesh.add(tile);
        }
    }

    // 3. Сетка для отладки (тоже сдвигаем)
    const gridHelper = new THREE.GridHelper(
        this.boardSize, 
        this.size,
        0x000000,
        0x888888
    );
    gridHelper.position.set(
        boardOffsetX,
        0.02,
        boardOffsetZ
    );
    this.mesh.add(gridHelper);
}

    async setupPieces() {
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        for (let col = 0; col < this.size; col++) {
            let xPos = (col - 3.5) * this.squareSize + 2;
            console.log(xPos);
            // Белые фигуры
            await this.createPiece(pieceOrder[col], 'white', [
                xPos,
                0,
                -3.5 * this.squareSize
            ]);
            
            // Белые пешки
            await this.createPiece('pawn', 'white', [
                xPos,
                0,
                -2.5 * this.squareSize
            ]);
            
            // Черные фигуры
            await this.createPiece(pieceOrder[col], 'black', [
                xPos,
                0,
                3.5 * this.squareSize
            ]);
            
            // Черные пешки
            await this.createPiece('pawn', 'black', [
                xPos,
                0,
                2.5 * this.squareSize
            ]);
        }
    }

    async createPiece(type, color, position) {
        const piece = new ChessPiece(type, color, position, this.squareSize * this.pieceScale);
        await piece.load();
        
        // Центрируем фигуру в клетке
        piece.mesh.position.set(
            position[0],
            this.squareSize * 0.3, // Подъем над доской
            position[2]
        );
        
        this.mesh.add(piece.mesh);
        this.pieces.push(piece);
    }
}