export class ChessGame {
    constructor(scene) {
        this.scene = scene;
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.gameState = 'idle';
        this.moveHistory = [];
        this.animatingPieces = new Set();
    }

    start() {
        this.gameState = 'playing';
        console.log('Game started! White moves first.');
        this.playDemoMoves();
    }

    reset() {
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.gameState = 'idle';
        this.moveHistory = [];
        this.animatingPieces.clear();
        
        // Сбрасываем все фигуры в исходное положение
        this.scene.chessBoard.pieces.forEach(piece => {
            piece.mesh.position.copy(piece.originalPosition);
            if (piece.isSelected) piece.deselect();
        });
    }

    playDemoMoves() {
        const demoMoves = [
            { pieceId: 'wp2', target: [ -2.5, 0.3, -0.5 ] },
            { pieceId: 'bp7', target: [ 2.5, 0.3, 0.5 ] },
            { pieceId: 'wp2', target: [ -2.5, 0.3, 0.5 ] },
            { pieceId: 'bn2', target: [ 1.5, 0.3, 2.5 ] },
            { pieceId: 'wr1', target: [ -3.5, 0.3, -0.5 ] }
        ];

        let moveIndex = 0;
        
        const playNextMove = () => {
            if (moveIndex >= demoMoves.length || this.gameState !== 'playing') return;
            
            const move = demoMoves[moveIndex];
            const piece = this.scene.chessBoard.pieces.find(p => p.id === move.pieceId);
            
            if (piece) {
                this.movePieceWithAnimation(piece, move.target, 1.5)
                    .then(() => {
                        moveIndex++;
                        setTimeout(playNextMove, 500);
                    });
            }
        };
        
        playNextMove();
    }

    async movePieceWithAnimation(piece, targetPosition, duration) {
        return new Promise((resolve) => {
            piece.startAnimation(targetPosition, duration);
            this.animatingPieces.add(piece);
            
            const checkAnimation = () => {
                const done = piece.updateAnimation(performance.now());
                
                if (done) {
                    this.animatingPieces.delete(piece);
                    this.moveHistory.push({
                        piece,
                        from: piece.originalPosition.clone(),
                        to: new THREE.Vector3(...targetPosition)
                    });
                    piece.originalPosition.copy(piece.currentPosition);
                    resolve();
                } else {
                    requestAnimationFrame(checkAnimation);
                }
            };
            
            checkAnimation();
        });
    }

    update() {
        this.animatingPieces.forEach(piece => {
            piece.updateAnimation(performance.now());
        });
    }
}