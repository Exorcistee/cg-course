import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Ground {
    constructor(width, depth) {
        this.width = width;
        this.depth = depth;
        this.createMesh();
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('../textures/grass.jpg');
        grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(this.width / 2, this.depth / 2);

        const geometry = new THREE.PlaneGeometry(this.width, this.depth);
        const material = new THREE.MeshStandardMaterial({ 
            map: grassTexture,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.receiveShadow = true;
    }
}