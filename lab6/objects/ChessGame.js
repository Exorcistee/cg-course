import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import * as TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js';

export class ChessGame {
    constructor(scene, board) {
        this.scene = scene;
        this.board = board;
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.gameState = 'idle'; 
        this.moveHistory = [];
        this.soundEnabled = true;
        this.animationSpeed = 1.0;
    }

    async start() {
        if (this.gameState === 'playing') return;
        
        this.gameState = 'playing';
        console.log('Game started! White moves first.');
        
        await this.playDemoMoves();
        
        this.gameState = 'waitingForInput';
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        this.sounds[type].currentTime = 0;
        this.sounds[type].play().catch(e => console.warn("Sound error:", e));
    }

    async playDemoMoves() {
        const demoMoves = [
            { pieceId: 'wp2', to: [-2.5, 0.3, -0.5] }, // e2-e4
            { pieceId: 'bp7', to: [2.5, 0.3, 0.5] },    // e7-e5
            { pieceId: 'wp2', to: [-2.5, 0.3, 0.5] },    // e4-e5 (взятие)
            { pieceId: 'bn2', to: [1.5, 0.3, 2.5] },    // g8-f6
            { pieceId: 'wr1', to: [-3.5, 0.3, -0.5] }   // h1-h5
        ];

        for (const move of demoMoves) {
            if (this.gameState !== 'playing') break;
            
            const piece = this.board.pieces.find(p => p.id === move.pieceId);
            if (!piece) continue;
            
            await this.movePiece(piece, move.to);
            await this.delay(500); // Пауза между ходами
        }
        
        this.gameState = 'gameOver';
        console.log('Demo game completed!');
    }

    async movePiece(piece, targetPosition) {
        return new Promise(resolve => {
            // 1. Поднимаем фигуру
            new TWEEN.Tween(piece.mesh.position)
                .to({ 
                    y: piece.mesh.position.y + 0.5 
                }, 300 * this.animationSpeed)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
            
            // 2. Перемещаем по X/Z
            new TWEEN.Tween(piece.mesh.position)
                .to({
                    x: targetPosition[0],
                    z: targetPosition[2]
                }, 800 * this.animationSpeed)
                .delay(300 * this.animationSpeed)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            
            // 3. Опускаем фигуру
            new TWEEN.Tween(piece.mesh.position)
                .to({ 
                    y: targetPosition[1] 
                }, 300 * this.animationSpeed)
                .delay(1100 * this.animationSpeed)
                .easing(TWEEN.Easing.Quadratic.In)
                .onComplete(() => {
                    this.playSound('move');
                    this.moveHistory.push({
                        piece,
                        from: piece.originalPosition.clone(),
                        to: new THREE.Vector3(...targetPosition)
                    });
                    piece.originalPosition.copy(piece.mesh.position);
                    resolve();
                })
                .start();
        });
    }

    reset() {
        TWEEN.removeAll();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.gameState = 'idle';
        this.moveHistory = [];
        
        // Возвращаем все фигуры на место
        this.board.pieces.forEach(piece => {
            piece.mesh.position.copy(piece.originalPosition);
            if (piece.isSelected) piece.deselect();
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    update() {
        TWEEN.update();
    }
}