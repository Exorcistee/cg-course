import { TextureManager } from "./TextureManager.js";

export class Card {
    constructor(frontTexture, backTexture, width, height, depth, imageId) { 
        this.frontTexture = frontTexture;
        this.backTexture = backTexture;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.imageId = imageId;
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
            new THREE.MeshStandardMaterial({ map: this.backTexture }), 
            new THREE.MeshStandardMaterial({ map: this.frontTexture }) 
        ];
        
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.rotation.y = 0;
        return mesh;
    }
    
    flip() {
        this.isFlipped = true;
    }
    
    unflip() {
        this.isFlipped = false;
    }
}