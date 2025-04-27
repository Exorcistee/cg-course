import { TextureManager } from "./TextureManager.js";
import { Card } from "./Card.js";
import { UIManager } from "./UIManager.js";
import { TWEEN } from "./Tween.js";

export class Game {
    constructor(container) {
        this.container = container;
        this.imagePaths = this.generateImagePaths();
        this.totalPairs = 6;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cards = [];
        this.flippedCards = [];
        this.isFlipping = false;
        this.uiManager = new UIManager(this);
        this.flippedCards = []; 
        this.canFlip = true; 
        this.score = 0; 
        this.symbols = this.generateSymbolPairs();
    }

    generateImagePaths() {
        const paths = [];
        for (let i = 1; i <= this.totalPairs; i++) {
            paths.push(`../pictures/picture${i}.png`);
            paths.push(`assets/images/picture${i}.png`); // Добавляем пару
        }
        return this.shuffleArray(paths);
    }


    init(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.totalPairs = (rows * cols) / 2;
        this.matchedPairs = 0;
        
        this.setupScene();
        this.createBoard();
        this.setupEventListeners();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x333333);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(this.cols * 0.6, this.rows * 0.6, this.rows * 1.2);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }
    
    createBoard() {
        const backTexture = TextureManager.createBackTexture();
        const frontTextures = TextureManager.createFrontTextures(this.symbols);
        
        this.cards = [];
        const cardWidth = 1;
        const cardHeight = 1;
        const cardDepth = 0.05;
        const gap = 0.1;
        
        const startX = -((this.cols * (cardWidth + gap)) / 2 + (cardWidth + gap) / 2);
        const startY = ((this.rows * (cardHeight + gap)) / 2 - (cardHeight + gap) / 2);
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                const symbol = this.symbols[index];
                const texture = frontTextures[index];
                
                const card = new Card(
                    texture,
                    backTexture,
                    cardWidth,
                    cardHeight,
                    cardDepth,
                    symbol 
                );
                
                card.mesh.position.set(
                    startX + col * (cardWidth + gap),
                    startY - row * (cardHeight + gap),
                    0
                );
                
                this.scene.add(card.mesh);
                this.cards.push(card);
            }
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        console.log("ивенты запущены");
        this.renderer.domElement.addEventListener('click', this.onCardClick.bind(this), false);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onCardClick(event) {
        // Блокируем клики во время анимации или при 2 открытых карточках
        if (this.isAnimating || this.flippedCards.length >= 2) return;

        const mouse = this.getMousePosition(event);
        const clickedCard = this.getClickedCard(mouse);

        if (this.isValidCard(clickedCard)) {
            this.processCardFlip(clickedCard);
        }
    }

    getMousePosition(event) {
        return new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
    }

    getClickedCard(mouse) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.cards.map(c => c.mesh));
        return intersects.length > 0 ? 
            this.cards.find(c => c.mesh === intersects[0].object) : null;
    }

    isValidCard(card) {
        return card && !card.isFlipped && !card.isMatched && !this.isAnimating;
    }

    processCardFlip(card) {
        this.isAnimating = true;
        card.isFlipped = true;
        this.flippedCards.push(card);

        this.animateCardFlip(card, Math.PI, () => {
            card.showFront();
            this.isAnimating = false;

            if (this.flippedCards.length === 2) {
                this.checkCardMatch();
            }
        });
    }

    animateCardFlip(card, targetY, onComplete) {
        new TWEEN({ y: card.mesh.rotation.y })
            .to({ y: targetY }, 300)
            .onUpdate(obj => card.mesh.rotation.y = obj.y)
            .onComplete(onComplete)
            .start();
    }

    checkCardMatch() {
        if (this.flippedCards.length !== 2) return;
        
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        this.score += 10;
        this.updateScore();

        // Анимация исчезновения
        new TWEEN({ scale: 1 })
            .to({ scale: 0 }, 500)
            .onUpdate(obj => {
                card1.mesh.scale.set(obj.scale, obj.scale, obj.scale);
                card2.mesh.scale.set(obj.scale, obj.scale, obj.scale);
            })
            .onComplete(() => {
                this.removeMatchedCards(card1, card2);
                this.checkGameEnd();
            })
            .start();
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            this.animateCardFlip(card1, 0, () => {
                card1.showBack();
                card1.isFlipped = false;
                this.checkFlipComplete();
            });

            this.animateCardFlip(card2, 0, () => {
                card2.showBack();
                card2.isFlipped = false;
                this.checkFlipComplete();
            });
        }, 1000);
    }

    removeMatchedCards(card1, card2) {
        card1.mesh.geometry.dispose();
        card2.mesh.geometry.dispose();
        card1.mesh.material.forEach(m => m.dispose());
        card2.mesh.material.forEach(m => m.dispose());
        
        this.scene.remove(card1.mesh);
        this.scene.remove(card2.mesh);
        
        this.renderer.renderLists.dispose();
        this.renderer.info.reset();
        
        card1.isMatched = true;
        card2.isMatched = true;
        this.flippedCards = [];
        this.isAnimating = false;
    }

    checkFlipComplete() {
        if (this.flippedCards.every(c => !c.isFlipped)) {
            this.flippedCards = [];
            this.isAnimating = false;
        }
    }

    checkGameEnd() {
        if (this.cards.every(c => c.isMatched)) {
            this.endGame();
        }
    }

    updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Счет: ${this.score}`;
        }
    }

    endGame() {
        alert(`Игра завершена! Ваш счет: ${this.score}`);

    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        TWEEN.update();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}