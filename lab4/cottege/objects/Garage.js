import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Garage {
    constructor() {
        this.width = 4;
        this.depth = 3;
        this.height = 2.5;
        this.createMesh();
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const brickTexture = textureLoader.load('https://threejs.org/examples/textures/brick/brick_diffuse.jpg');
        brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
        brickTexture.repeat.set(1, 0.5);

        const roofTexture = textureLoader.load('https://threejs.org/examples/textures/roof/roof.jpg');
        roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;
        roofTexture.repeat.set(0.5, 0.5);

        const windowTexture = textureLoader.load('https://threejs.org/examples/textures/glass/glass.png');
        windowTexture.transparent = true;

        const garageGroup = new THREE.Group();


        const wallsGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const wallsMaterial = new THREE.MeshStandardMaterial({ 
            map: brickTexture,
            roughness: 0.8
        });
        const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
        walls.position.y = this.height / 2;
        walls.castShadow = true;
        walls.receiveShadow = true;
        garageGroup.add(walls);

        const roofGeometry = new THREE.BoxGeometry(this.width, 0.2, this.depth);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            map: roofTexture,
            roughness: 0.7
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = this.height + 0.1;
        roof.rotation.z = -0.1;
        roof.castShadow = true;
        garageGroup.add(roof);


        const doorGeometry = new THREE.BoxGeometry(2.5, 2, 0.1);
        const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.4
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.2, this.depth / 2 + 0.05);
        garageGroup.add(door);


        const windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            map: windowTexture,
            transparent: true,
            opacity: 0.7,
            metalness: 0.3
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(1.2, 1.8, this.depth / 2 + 0.05);
        garageGroup.add(window);

        this.mesh = garageGroup;
    }
}