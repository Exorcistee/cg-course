import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Cottage {
    constructor() {
        this.width = 20;
        this.depth = 7;
        this.height = 5;
        this.createMesh();
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const brickTexture = textureLoader.load('../textures/red_brick.jpg');
        brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
        brickTexture.repeat.set(2, 1);

        const roofTexture = textureLoader.load('../textures/white_brick.png');
        roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;
        roofTexture.repeat.set(10, 1);

        const windowTexture = textureLoader.load('');
        windowTexture.transparent = true;

        const cottageGroup = new THREE.Group();

        const wallsGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const wallsMaterial = new THREE.MeshStandardMaterial({ 
            map: brickTexture,
            roughness: 0.8
        });
        const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
        walls.position.y = this.height / 2;
        walls.castShadow = true;
        walls.receiveShadow = true;
        cottageGroup.add(walls);
        const roofGeometry = new THREE.ConeGeometry(this.width / 2, 4, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            map: roofTexture,
            roughness: 0.7
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = this.height + 1;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        cottageGroup.add(roof);

        const doorGeometry = new THREE.BoxGeometry(1.2, 2, 0.1);
        const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.6
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1, this.depth / 2 + 0.05);
        cottageGroup.add(door);

        const windowGeometry = new THREE.BoxGeometry(1, 1, 0.1);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            map: windowTexture,
            transparent: true,
            opacity: 0.7,
            metalness: 0.3
        });

        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-1.5, 2, this.depth / 2 + 0.05);
        cottageGroup.add(window1);

        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(1.5, 2, this.depth / 2 + 0.05);
        cottageGroup.add(window2);

        const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
        window3.position.set(this.width / 2 + 0.05, 2, 0);
        window3.rotation.y = Math.PI / 2;
        cottageGroup.add(window3);

        this.mesh = cottageGroup;
    }
}