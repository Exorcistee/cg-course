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
        this.highlightMesh = null;
        try {
            this.highlightMesh = this.createHighlightMesh();
            this.highlightMesh.visible = false; 
            this.mesh.add(this.highlightMesh);
        } catch (e) {
            console.error('Error creating highlight mesh:', e);
        }
        
        this.highlightIntensity = 0;
    }
    
    createMesh() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true  }), 
            new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true  }), 
            new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true  }), 
            new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true  }), 
            new THREE.MeshStandardMaterial({ map: this.frontTexture, transparent: true  }), 
            new THREE.MeshStandardMaterial({ map: this.backTexture, transparent: true  }) 
        ];
        
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.rotation.y = 0;
        return mesh;
    }

    createHighlightMesh() {
        const geometry = new THREE.PlaneGeometry(this.width * 1.1, this.height * 1.1);
        const material = new THREE.MeshBasicMaterial({
            map: TextureManager.createHighlightTexture(),
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2; 
        mesh.position.z = 0.06;
        
        return mesh;
    }

    updateHighlight(intensity) {
        this.highlightIntensity = intensity;
        this.highlightMesh.material.opacity = intensity * 0.6;
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
    }
    
    unflip() {
        this.isFlipped = false;
    }
}