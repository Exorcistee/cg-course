import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { ChessPiece } from './ChessPiece.js';

export class ChessBoard {
    constructor() {
        this.size = 8;
        this.squareSize = 1.2;
        this.mesh = new THREE.Group();
        this.pieces = [];
        this.textures = {
            wood: null,
            whiteSquare: null,
            blackSquare: null
        };
    }

    async load() {
        await this.loadTextures();
        await this.createBoard();
        await this.setupPieces();
    }

    loadTextures() {
        const textureLoader = new THREE.TextureLoader();
        
        return new Promise((resolve) => {
            let loaded = 0;
            const total = 3;
            
            const onLoad = () => {
                loaded++;
                if (loaded === total) resolve();
            };
            
            textureLoader.load('../textures/wood.jpg', (texture) => {
                this.textures.wood = texture;
                this.textures.wood.wrapS = THREE.RepeatWrapping;
                this.textures.wood.wrapT = THREE.RepeatWrapping;
                this.textures.wood.repeat.set(2, 2);
                onLoad();
            }, undefined, (err) => {
                console.error('Error loading wood texture:', err);
                onLoad();
            });
            
            textureLoader.load('../textures/white.jpg', (texture) => {
                this.textures.whiteSquare = texture;
                onLoad();
            }, undefined, (err) => {
                console.error('Error loading white square texture:', err);
                onLoad();
            });
            
            textureLoader.load('../textures/black.jpg', (texture) => {
                this.textures.blackSquare = texture;
                onLoad();
            }, undefined, (err) => {
                console.error('Error loading black square texture:', err);
                onLoad();
            });
        });
    }

    createBoard() {

        const boardGeometry = new THREE.BoxGeometry(
            this.size * this.squareSize + 0.5, 
            0.2, 
            this.size * this.squareSize + 0.5
        );
        
        const boardMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood || null,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.y = -0.1;
        board.receiveShadow = true;
        this.mesh.add(board);
        
        const squareGeometry = new THREE.PlaneGeometry(this.squareSize, this.squareSize);
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const isBlack = (i + j) % 2 === 1;
                const material = new THREE.MeshStandardMaterial({
                    map: isBlack ? 
                        (this.textures.blackSquare || new THREE.Color(0x222222)) : 
                        (this.textures.whiteSquare || new THREE.Color(0xeeeeee)),
                    roughness: 0.7,
                    metalness: 0.1
                });
                
                const square = new THREE.Mesh(squareGeometry, material);
                square.rotation.x = -Math.PI / 2;
                square.position.set(
                    (i - this.size / 2 + 0.5) * this.squareSize,
                    0.001,
                    (j - this.size / 2 + 0.5) * this.squareSize
                );
                square.receiveShadow = true;
                this.mesh.add(square);
            }
        }
    }

    async setupPieces() {
        const pieceTypes = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook', 'pawn'];
        
        let idCounter = 0;
        const generateId = (type, color) => `${color[0]}${type[0]}${++idCounter}`;
        
        for (let i = 0; i < this.size; i++) {

            const mainPieceType = pieceTypes[i];
            
            const whitePiece = new ChessPiece(
                mainPieceType,
                'white',
                [(i - this.size / 2 + 0.5) * this.squareSize, 0.3, (-this.size / 2 + 0.5) * this.squareSize]
            );
            whitePiece.id = generateId(mainPieceType, 'white');
            await whitePiece.load();
            this.mesh.add(whitePiece.mesh);
            this.pieces.push(whitePiece);
            
            const whitePawn = new ChessPiece(
                'pawn',
                'white',
                [(i - this.size / 2 + 0.5) * this.squareSize, 0.3, (-this.size / 2 + 1.5) * this.squareSize]
            );
            whitePawn.id = generateId('pawn', 'white');
            await whitePawn.load();
            this.mesh.add(whitePawn.mesh);
            this.pieces.push(whitePawn);
            
            const blackPiece = new ChessPiece(
                mainPieceType,
                'black',
                [(i - this.size / 2 + 0.5) * this.squareSize, 0.3, (this.size / 2 - 0.5) * this.squareSize]
            );
            blackPiece.id = generateId(mainPieceType, 'black');
            await blackPiece.load();
            this.mesh.add(blackPiece.mesh);
            this.pieces.push(blackPiece);
            
            const blackPawn = new ChessPiece(
                'pawn',
                'black',
                [(i - this.size / 2 + 0.5) * this.squareSize, 0.3, (this.size / 2 - 1.5) * this.squareSize]
            );
            blackPawn.id = generateId('pawn', 'black');
            await blackPawn.load();
            this.mesh.add(blackPawn.mesh);
            this.pieces.push(blackPawn);
        }
    }
}