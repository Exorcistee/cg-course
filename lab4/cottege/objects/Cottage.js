import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Cottage {
    constructor() {
        this.width = 15;
        this.depth = 7;
        this.height = 5;
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
            // Параметры крыши
    const roofPeakHeight = 3; // Высота конька крыши
    const overhang = 1;       // Свес крыши со всех сторон

    // 1. Форма крыши (треугольное сечение)
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-this.depth/2 - overhang, 0);  // Низ ската (свес)
    roofShape.lineTo(0, roofPeakHeight);            // Конек крыши
    roofShape.lineTo(this.depth/2 + overhang, 0);   // Низ ската (свес)
    roofShape.lineTo(-this.depth/2 - overhang, 0);  // Замыкаем

    // 2. Выдавливаем по ШИРИНЕ дома (this.width)
    const extrudeSettings = {
        depth: this.width + overhang * 2,  // Свесы спереди/сзади
        bevelEnabled: false
    };
    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);

    // 3. Создаем меш крыши
    const roof = new THREE.Mesh(
        roofGeometry,
        new THREE.MeshStandardMaterial({ 
            map: roofTexture,
            roughness: 0.7
        })
    );

    // 4. Позиционирование
    roof.position.set(-this.width/2 - overhang, this.height, 0);  // Ставим на стены
         // Ориентируем конек вдоль короткой стороны
    roof.castShadow = true;
    cottageGroup.add(roof);
    roof.rotation.set(0, Math.PI/2, 0);
    this.mesh = cottageGroup;


    const doorGeometry = new THREE.BoxGeometry(2, 2.5, 0.15); // Ширина: 2м, Высота: 2.5м, Толщина: 0.15м
const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, // Коричневый цвет
    roughness: 0.6,
    metalness: 0.2
});
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, 1.25, this.depth / 2 + 0.075); // Центрируем по высоте
cottageGroup.add(door);

// Параметры окон
const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1); // Увеличенные окна
const windowMaterial = new THREE.MeshStandardMaterial({ 
    map: windowTexture,
    transparent: true,
    opacity: 0.7,
    metalness: 0.3,
    roughness: 0.1
});

// Окна на передней стене
const windowFront1 = new THREE.Mesh(windowGeometry, windowMaterial);
windowFront1.position.set(-2.5, 2.2, this.depth / 2 + 0.05);
cottageGroup.add(windowFront1);

const windowFront2 = new THREE.Mesh(windowGeometry, windowMaterial);
windowFront2.position.set(2.5, 2.2, this.depth / 2 + 0.05);
cottageGroup.add(windowFront2);

// Окна на боковых стенах
const windowSide1 = new THREE.Mesh(windowGeometry, windowMaterial);
windowSide1.position.set(this.width / 2 + 0.05, 2.2, -2);
windowSide1.rotation.y = Math.PI / 2;
cottageGroup.add(windowSide1);

const windowSide2 = new THREE.Mesh(windowGeometry, windowMaterial);
windowSide2.position.set(this.width / 2 + 0.05, 2.2, 2);
windowSide2.rotation.y = Math.PI / 2;
cottageGroup.add(windowSide2);

// Окна на задней стене
const windowBack1 = new THREE.Mesh(windowGeometry, windowMaterial);
windowBack1.position.set(-2.5, 2.2, -this.depth / 2 - 0.05);
cottageGroup.add(windowBack1);

const windowBack2 = new THREE.Mesh(windowGeometry, windowMaterial);
windowBack2.position.set(2.5, 2.2, -this.depth / 2 - 0.05);
cottageGroup.add(windowBack2);

this.mesh = cottageGroup;
    }
}