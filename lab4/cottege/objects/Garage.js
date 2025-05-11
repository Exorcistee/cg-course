import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Garage {
    constructor() {
        this.width = 6; 
        this.depth = 5;
        this.height = 3;
        this.roofPitch = 30;
        this.createMesh();
    }

    createMesh() {

        const textureLoader = new THREE.TextureLoader();
        const brickTexture = textureLoader.load('./textures/red_brick.jpg');
        brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
        brickTexture.repeat.set(2, 1);

        const roofTexture = textureLoader.load('./textures/white_brick.png');
        roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;
        roofTexture.repeat.set(10, 1);
        const windowTexture = textureLoader.load('./textures/white_brick.png');
        windowTexture.transparent = true;

        const garageGroup = new THREE.Group();

        this.createWalls(brickTexture, garageGroup);
        
        this.createSlopedRoof(roofTexture, garageGroup);
        
        this.createGarageDoor(garageGroup);

        const window = this.createWindowWithFrame(
            new THREE.Vector3(this.width/2 + 0.05, 1.8, 0), 
            Math.PI/2 
        );
        garageGroup.add(window);

        this.mesh = garageGroup;
    }

    createWalls(texture, group) {
        const wallsGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const wallsMaterial = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.8
        });
        
        const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
        walls.position.y = this.height / 2;
        walls.castShadow = true;
        walls.receiveShadow = true;
        group.add(walls);
    }

    createSlopedRoof(texture, group) {
        const roofPeakHeight = 2;
        const overhang = 0.5;  
    
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-this.depth/2 - overhang, 0); 
        roofShape.lineTo(0, roofPeakHeight);          
        roofShape.lineTo(this.depth/2 + overhang, 0); 
        roofShape.lineTo(-this.depth/2 - overhang, 0); 
    
        const extrudeSettings = {
            depth: this.width + overhang * 2, 
            bevelEnabled: false
        };
        const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
        roofGeometry.rotateY(Math.PI/2);
        roofGeometry.translate(-this.width/2 - overhang, this.height, 0);
        const roof = new THREE.Mesh(
            roofGeometry,
            new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.7,
                side: THREE.DoubleSide
            })
        );
    
        roof.castShadow = true;
        group.add(roof);
    }

    createGarageDoor(group) {
        const doorGeometry = new THREE.BoxGeometry(3.5, 2.5, 0.1);
        const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.5, this.depth/2 + 0.05);
        door.castShadow = true;
        group.add(door);
        
        const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
        
        const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        leftHandle.position.set(-0.5, 1.5, this.depth/2 + 0.08);
        leftHandle.rotation.z = Math.PI/2;
        group.add(leftHandle);
        
        const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        rightHandle.position.set(0.5, 1.5, this.depth/2 + 0.08);
        rightHandle.rotation.z = Math.PI/2;
        group.add(rightHandle);
    }


    createWindowWithFrame(position, rotationY = 0) {
        const windowGroup = new THREE.Group();
        const width = 1.0;
        const height = 0.8;
        const frameWidth = 0.1;
        const glassThickness = 0.02;

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3632,
            roughness: 0.7
        });

        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xa0c0e0,
            transmission: 0.7,
            roughness: 0.1,
            metalness: 0.2,
            transparent: true,
            opacity: 0.8
        });

        const frameGeometry = new THREE.BoxGeometry(width + frameWidth*2, height + frameWidth*2, 0.1);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        windowGroup.add(frame);

        const verticalFrameGeometry = new THREE.BoxGeometry(frameWidth, height, 0.1);
        for (let i = -1; i <= 1; i += 2) {
            const verticalFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
            verticalFrame.position.x = i * width/2;
            windowGroup.add(verticalFrame);
        }

        const horizontalFrameGeometry = new THREE.BoxGeometry(width, frameWidth, 0.1);
        for (let i = -1; i <= 1; i += 2) {
            const horizontalFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
            horizontalFrame.position.y = i * height/2;
            windowGroup.add(horizontalFrame);
        }

        const glassGeometry = new THREE.BoxGeometry(width - frameWidth*0.5, height - frameWidth*0.5, glassThickness);
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.z = 0.06;
        windowGroup.add(glass);

        windowGroup.position.set(position.x, position.y, position.z);
        windowGroup.rotation.y = rotationY;
        
        return windowGroup;
    }
}