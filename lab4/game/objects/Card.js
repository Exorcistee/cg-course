export class Card {
    constructor(frontTexture, backTexture, width, height, depth, symbol) { 
        this.frontTexture = frontTexture;
        this.backTexture = backTexture;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.symbol = symbol; 
        this.isFlipped = false;
        this.isMatched = false;
        this.mesh = this.createMesh();
    }
    
    createMesh() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0x888888 }), 
            new THREE.MeshStandardMaterial({ color: 0x888888 }), 
            new THREE.MeshStandardMaterial({ color: 0x888888 }), 
            new THREE.MeshStandardMaterial({ color: 0x888888 }), 
            new THREE.MeshStandardMaterial({ map: this.frontTexture }), 
            new THREE.MeshStandardMaterial({ map: this.backTexture }) 
        ];
        
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.rotation.y = 0;
        return mesh;
    }
    
    showFront() {
        this.mesh.material[4].map = this.frontTexture;
        this.mesh.material[4].needsUpdate = true;
    }
    
    showBack() {
        this.mesh.material[4].map = this.backTexture;
        this.mesh.material[4].needsUpdate = true;
    }
    
    flip() {
        this.isFlipped = true;
        this.showFront();
    }
    
    unflip() {
        this.isFlipped = false;
        this.showBack();
    }
}