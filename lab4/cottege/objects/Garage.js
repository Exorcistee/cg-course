import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Garage {
    constructor() {
        this.width = 6;  // Увеличим размеры для реалистичности
        this.depth = 5;
        this.height = 3;
        this.roofPitch = 30; // Угол наклона крыши в градусах
        this.createMesh();
    }

    createMesh() {

        // Загрузка текстур с обработкой ошибок
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
        
        this.createWindow(windowTexture, garageGroup);

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
        const roofPeakHeight = 2; // Высота конька крыши (меньше чем у дома)
        const overhang = 0.5;     // Свес крыши (умеренный)
    
        // 1. Форма крыши (треугольное сечение)
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-this.depth/2 - overhang, 0);  // Низ ската (свес)
        roofShape.lineTo(0, roofPeakHeight);            // Конек крыши
        roofShape.lineTo(this.depth/2 + overhang, 0);   // Низ ската (свес)
        roofShape.lineTo(-this.depth/2 - overhang, 0);  // Замыкаем
    
        // 2. Выдавливаем по ШИРИНЕ гаража (this.width)
        const extrudeSettings = {
            depth: this.width + overhang * 2,  // Свесы по бокам
            bevelEnabled: false
        };
        const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
        roofGeometry.rotateY(Math.PI/2);
        roofGeometry.translate(-this.width/2 - overhang, this.height, 0);
        // 3. Создаем и настраиваем меш крыши
        const roof = new THREE.Mesh(
            roofGeometry,
            new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.7,
                side: THREE.DoubleSide
            })
        );
    
        // 4. Позиционирование и поворот
    // Конек вдоль короткой стороны
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

    createWindow(texture, group) {
        const windowGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.1);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.6,
            metalness: 0.4
        });
        
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(
            -this.width/2 - 0.05, 
            this.height - 1, 
            0
        );
        window.rotation.y = Math.PI/2;
        group.add(window);
    }

    async loadTexture(url, repeatX = 1, repeatY = 1) {
        return new Promise((resolve) => {
            new THREE.TextureLoader().load(url, (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeatX, repeatY);
                resolve(texture);
            });
        });
    }
}