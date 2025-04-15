import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Porch {
    constructor() {
        this.width = 2;
        this.depth = 1.5;
        this.height = 0.3;
        this.createMesh();
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('https://threejs.org/examples/textures/wood/wood.jpg');
        woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(1, 1);

        const porchGroup = new THREE.Group();
        const porchMaterial = new THREE.MeshStandardMaterial({ 
            map: woodTexture,
            roughness: 0.7
        });

        const baseGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const base = new THREE.Mesh(baseGeometry, porchMaterial);
        base.position.y = this.height / 2;
        base.castShadow = true;
        base.receiveShadow = true;
        porchGroup.add(base);

        const stepGeometry1 = new THREE.BoxGeometry(this.width + 0.5, this.height / 2, this.depth / 3);
        const step1 = new THREE.Mesh(stepGeometry1, porchMaterial);
        step1.position.set(0, this.height / 4, -this.depth / 3);
        step1.castShadow = true;
        step1.receiveShadow = true;
        porchGroup.add(step1);

        const stepGeometry2 = new THREE.BoxGeometry(this.width + 1, this.height / 3, this.depth / 4);
        const step2 = new THREE.Mesh(stepGeometry2, porchMaterial);
        step2.position.set(0, this.height / 6, -this.depth / 2);
        step2.castShadow = true;
        step2.receiveShadow = true;
        porchGroup.add(step2);


        const columnGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const columnMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

        const column1 = new THREE.Mesh(columnGeometry, columnMaterial);
        column1.position.set(-this.width / 2 + 0.2, 1.5, this.depth / 2 - 0.2);
        column1.castShadow = true;
        porchGroup.add(column1);

        const column2 = new THREE.Mesh(columnGeometry, columnMaterial);
        column2.position.set(this.width / 2 - 0.2, 1.5, this.depth / 2 - 0.2);
        column2.castShadow = true;
        porchGroup.add(column2);


        const canopyGeometry = new THREE.BoxGeometry(this.width + 0.5, 0.1, 1);
        const canopyMaterial = new THREE.MeshStandardMaterial({ 
            map: woodTexture,
            roughness: 0.6
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.set(0, 2.5, this.depth / 2 - 0.5);
        canopy.castShadow = true;
        porchGroup.add(canopy);

        this.mesh = porchGroup;
    }
}