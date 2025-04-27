export class UIManager {
    constructor(game) {
        this.game = game;
        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-btn');
        this.difficultySelect = document.getElementById('difficulty');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => {
            const difficulty = parseInt(this.difficultySelect.value);
            let rows, cols;
            
            switch (difficulty) {
                case 4:
                    rows = 4;
                    cols = 4;
                    break;
                case 6:
                    rows = 6;
                    cols = 6;
                    break;
                case 8:
                    rows = 6;
                    cols = 8;
                    break;
                default:
                    rows = 6;
                    cols = 6;
            }
            
            this.startScreen.style.display = 'none';
            this.game.init(rows, cols);
        });
    }
    
    showWinMessage() {
        alert('Поздравляем! Вы выиграли!');
    }
}