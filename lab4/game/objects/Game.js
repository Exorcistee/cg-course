import { TextureManager } from "./TextureManager.js";
import { Card } from "./Card.js";
import { UIManager } from "./UIManager.js";
import { TWEEN } from "./Tween.js";

export class Game {
    constructor(container, totalPairs) {
        this.container = container;
        this.totalPairs = totalPairs;
        this.imageData = this.generateImageData(); 
        this.textures = {};
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cards = [];
        this.flippedCards = [];
        this.isAnimating = false;
        this.score = 0;
        this.uiManager = new UIManager(this);
        this.hoveredCard = null;
        this.prevMousePosition = new THREE.Vector2();
    }

    generateImageData() {
        return [
            { id: 1, path: '../pictures/1.png' },
            { id: 2, path: '../pictures/2.jpg' },
            { id: 3, path: '../pictures/3.jpg' },
            { id: 4, path: '../pictures/4.png' },
            { id: 5, path: '../pictures/5.png' },
            { id: 6, path: '../pictures/6.png' },
            { id: 7, path: '../pictures/7.jpg' },
            { id: 8, path: '../pictures/kola.png' },
            { id: 9, path: '../pictures/i.webp' },
            { id: 10, path: '../pictures/10.jpg' },
            { id: 11, path: '../pictures/11.jpg' },
            { id: 12, path: '../pictures/1.webp' },
            { id: 13, path: '../pictures/3.webp' },
            { id: 14, path: '../pictures/kyle.jpeg' },
            { id: 16, path: '../pictures/stan.jpg' },
            { id: 17, path: '../pictures/python.png' },
            { id: 18, path: '../pictures/cpp.png' },
            { id: 19, path: '../pictures/c#.jpg' },
            { id: 20, path: '../pictures/5.webp' },
            { id: 21, path: '../pictures/4.webp' },
            { id: 15, path: '../pictures/orig.webp' },
        ];
    }

    init(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        
        this.cardImageIds = this.generateCardIds();
        
        const uniquePaths = [...new Set(this.imageData.map(img => img.path))];
        
        TextureManager.loadImages(
            uniquePaths,
            (percent) => {
            },
            (loadedTextures) => {
                this.textures = loadedTextures; 
                this.backTexture = TextureManager.createBackTexture();
                this.setupScene();
                this.createBoard();
                this.setupEventListeners();
                this.animate();
            }
        );
    }

    generateCardIds() {
        const pairs = [];
        for (let i = 1; i <= this.totalPairs; i++) {
            pairs.push(i, i); 
        }
        return this.shuffleArray(pairs);
    }

    onMouseMove(event) {
        this.prevMousePosition.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.prevMousePosition, this.camera);
        
        if (!this.cards || this.cards.length === 0) return;
        const intersects = raycaster.intersectObjects(this.cards.map(c => c.mesh));
    
        if (this.hoveredCard && this.hoveredCard.highlightMesh) {
            this.hoveredCard.updateHighlight(0);
            this.hoveredCard = null;
        }
    
        if (intersects.length > 0 && intersects[0].object) {
            const card = this.cards.find(c => c.mesh === intersects[0].object);
            if (card && !card.isFlipped && !card.isMatched && card.highlightMesh) {
                this.hoveredCard = card;
                
                if (intersects[0].uv) {
                    const uv = intersects[0].uv;
                    card.highlightMesh.position.x = (uv.x - 0.5) * card.width * 0.8;
                    card.highlightMesh.position.y = -(uv.y - 0.5) * card.height * 0.8;
                }
                card.updateHighlight(1);
                this.scene.add(card.highlightMesh);
            }
        }

    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x333333);
        
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, -5, 10); 
        this.camera.lookAt(0, 0, 0); 
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    createBoard() {
        this.cards = [];
        const cardWidth = 1;
        const cardHeight = 1.5;
        const cardDepth = 0.3;
        const gap = 0.1;
        
        const startX = -((this.cols * (cardWidth + gap)) / 2 + (cardWidth + gap) / 2);
        const startY = ((this.rows * (cardHeight + gap)) / 2 - (cardHeight + gap) / 2);
        
        console.log('Available textures:', this.textures); 
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                const imageId = this.cardImageIds[index];
                const imageInfo = this.imageData.find(img => img.id === imageId);
                
                if (!imageInfo) {
                    console.error('Image info not found for id:', imageId);
                    continue;
                }
                
                const texture = this.textures[imageInfo.path];
                
                if (!texture) {
                    console.error('Texture not loaded for path:', imageInfo.path);
                    continue;
                }
                
                const card = new Card(
                    texture,
                    this.backTexture,
                    cardWidth,
                    cardHeight,
                    cardDepth,
                    imageId
                );
                
                card.mesh.position.set(
                    startX + col * (cardWidth + gap),
                    startY - row * (cardHeight + gap),
                    0
                );
                
                this.scene.add(card.mesh);
                this.cards.push(card);
                this.scene.add(card.highlightMesh);
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
        this.renderer.domElement.addEventListener('click', this.onCardClick.bind(this), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onCardClick(event) {
        if (this.isAnimating) return;
    
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.cards.map(c => c.mesh));
    
        if (intersects.length > 0) {
            const clickedCard = this.cards.find(c => c.mesh === intersects[0].object);
            
            if (clickedCard.isFlipped && !clickedCard.isMatched) {
                this.flipCardBack(clickedCard);
            } 
            else if (!clickedCard.isFlipped && !clickedCard.isMatched && this.flippedCards.length < 2) {
                this.flipCard(clickedCard);
            }
        }
    }

    flipCard(card) {
        this.isAnimating = true;
        card.isFlipped = true;
        this.flippedCards.push(card);
    
        new TWEEN({
            y: 0 
        })
        .to({
            y: Math.PI 
        }, 300)
        .onUpdate(obj => {
            card.mesh.rotation.y = obj.y;
        })
        .onComplete(() => {
            this.isAnimating = false;
            
            if (this.flippedCards.length === 2) {
                this.checkForMatch();
            }
        })
        .start();
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        console.log(card1.imageId);
        console.log(card2.imageId, card1.imageId === card2.imageId);
        if (card1.imageId === card2.imageId) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        setTimeout(() => {
            this.score += 10;
            this.isAnimating = true;
            this.removeMatchedCards(card1, card2);
            this.checkGameEnd();
        }, 500);
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            this.flipCardBack(card1);
            this.flipCardBack(card2);
        }, 1000);
    }

    flipCardBack(card) {
        this.isAnimating = true;
        
        this.flippedCards = this.flippedCards.filter(c => c !== card);
        
        new TWEEN({
            y: Math.PI
        })
        .to({
            y: 0 
        }, 300)
        .onUpdate(obj => {
            card.mesh.rotation.y = obj.y;
        })
        .onComplete(() => {
            card.isFlipped = false;
            this.isAnimating = false;
        })
        .start();
    }

    removeMatchedCards(card1, card2) {
        console.log(card1, card2);
        this.scene.remove(card1.mesh);
        this.scene.remove(card2.mesh);
        
        card1.mesh.geometry.dispose();
        card2.mesh.geometry.dispose();
        card1.mesh.material.forEach(m => m.dispose());
        card2.mesh.material.forEach(m => m.dispose());
        
        card1.isMatched = true;
        card2.isMatched = true;
        this.flippedCards = [];
        this.isAnimating = false;
    }

    checkGameEnd() {
        if (this.cards.every(c => c.isMatched)) {
            this.endGame();
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        if (this.hoveredCard && this.hoveredCard.highlightMesh && this.hoveredCard.highlightMesh.material) {
            const time = performance.now() * 0.002;
            const pulse = Math.sin(time * 3) * 0.1 + 0.9;
            
            if (this.hoveredCard.highlightMesh.material.opacity !== undefined) {
                this.hoveredCard.highlightMesh.material.opacity = pulse * 0.6;
                if (this.hoveredCard.highlightMesh.position) {
                    this.hoveredCard.highlightMesh.position.x += Math.sin(time) * 0.01;
                    this.hoveredCard.highlightMesh.position.y += Math.cos(time * 0.7) * 0.01;
                }
            }
        }

        if (TWEEN && typeof TWEEN.update === 'function') {
            TWEEN.update();
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    endGame() {
        this.renderer.domElement.remove();
        
        const endMessage = document.createElement('div');
        endMessage.id = 'end-message';
        endMessage.innerHTML = `
            <h2>Победа! Ваш счет: ${this.score}</h2>
            <button id="return-btn">Вернуться в меню</button>
        `;
        document.body.appendChild(endMessage);
        
        document.getElementById('return-btn').addEventListener('click', () => {
            document.body.removeChild(endMessage);
            document.getElementById('start-screen').style.display = 'block';
        });
        
        this.dispose();
    }
    
    dispose() {
        this.cards.forEach(card => {
            this.scene.remove(card.mesh);
            card.mesh.geometry.dispose();
            card.mesh.material.forEach(m => m.dispose());
        });
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }

}
