import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Cottage {
    constructor() {
        this.width = 15;
        this.depth = 7;
        this.height = 7;
        this.createMesh();
    }

    createWindowWithFrame(position, rotationY = 0, isFront = true) {
        const windowGroup = new THREE.Group();
        const width = 1.5;
        const height = 1.5;
        const depth = 0.15;
        const frameWidth = 0.1;
        const glassThickness = 0.02;

        // Загрузка текстур
        const textureLoader = new THREE.TextureLoader();
        const glassTexture = textureLoader.load('./textures/glass_texture.jpg');
        glassTexture.wrapS = glassTexture.wrapT = THREE.RepeatWrapping;
        glassTexture.repeat.set(1, 1);

        // Материал рамы (без изменений)
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3632,
            roughness: 0.7
        });

        // Улучшенный материал стекла с текстурой и отражениями
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            map: glassTexture, // Текстура стекла
            transmission: 0.85,
            roughness: 0.05, 
            metalness: 0.1, 
            transparent: true,
            opacity: 0.9,
            thickness: glassThickness * 2,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
        });

        // Основная рама
        const frameGeometry = new THREE.BoxGeometry(width + frameWidth*2, height + frameWidth*2, depth);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = isFront ? 0.05 : -0.05;
        windowGroup.add(frame);

        // Вертикальные элементы
        const verticalFrameGeometry = new THREE.BoxGeometry(frameWidth, height, depth);
        for (let i = -1; i <= 1; i += 2) {
            const verticalFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
            verticalFrame.position.x = i * width/2;
            windowGroup.add(verticalFrame);
        }

        // Горизонтальные элементы
        const horizontalFrameGeometry = new THREE.BoxGeometry(width, frameWidth, depth);
        for (let i = -1; i <= 1; i += 2) {
            const horizontalFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
            horizontalFrame.position.y = i * height/2;
            windowGroup.add(horizontalFrame);
        }

        // Стекло
        const glassGeometry = new THREE.BoxGeometry(width - frameWidth*0.5, height - frameWidth*0.5, glassThickness);
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.z = isFront ? depth/2 + glassThickness/2 : -depth/2 - glassThickness/2;
        windowGroup.add(glass);

        // Подоконник
        const sillGeometry = new THREE.BoxGeometry(width + 0.3, 0.05, 0.2);
        const sill = new THREE.Mesh(sillGeometry, frameMaterial);
        sill.position.set(0, -height/2 - 0.025, isFront ? 0.1 : -0.1);
        windowGroup.add(sill);

        windowGroup.position.set(position.x, position.y, position.z);
        windowGroup.rotation.y = rotationY;
        
        return windowGroup;
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader(); 
        const brickTexture = textureLoader.load('./textures/red_brick.jpg');
        brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
        brickTexture.repeat.set(2, 1);

        const roofTexture = textureLoader.load('./textures/white_brick.png');
        roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;
        roofTexture.repeat.set(10, 1);

        const cottageGroup = new THREE.Group();

        // Стены
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

        // Крыша
        const roofPeakHeight = 3;
        const overhang = 1;
        const roofOffsetX = -1.5; // Сдвиг крыши влево на 1.5 метра

        // Форма крыши (треугольное сечение)
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-this.depth/2 - overhang, 0);
        roofShape.lineTo(0, roofPeakHeight);
        roofShape.lineTo(this.depth/2 + overhang, 0);
        roofShape.lineTo(-this.depth/2 - overhang, 0);

        // Выдавливаем по ширине дома
        const extrudeSettings = {
            depth: this.width + overhang * 2,
            bevelEnabled: false
        };
        const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);

        // Поворачиваем и позиционируем крышу
        roofGeometry.rotateY(Math.PI/2);
        roofGeometry.translate(-this.width/2 - overhang, this.height, 0); // Добавляем смещение по X

        // Создаем меш крыши
        const roof = new THREE.Mesh(
            roofGeometry,
            new THREE.MeshStandardMaterial({ 
                map: roofTexture,
                roughness: 0.7
            })
        );

        roof.castShadow = true;
        roof.receiveShadow = true;
        cottageGroup.add(roof);

        // Дверь
        const doorGeometry = new THREE.BoxGeometry(2, 2.5, 0.15);
        const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.6,
            metalness: 0.2
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.25, this.depth / 2 + 0.075);
        cottageGroup.add(door);

        // Окна
        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(-4.5, 2.2, this.depth/2 + 0.1), 
            0, 
            true
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(4.5, 2.2, this.depth/2 + 0.1), 
            0, 
            true
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(0, 6, this.depth/2 + 0.1), 
            0, 
            true
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(-4.5, 6, this.depth/2 + 0.1), 
            0, 
            true
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(4.5, 6, this.depth/2 + 0.1), 
            0, 
            true
        ));

        // Боковые окна
        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(-this.width/2, 6, 0), 
            Math.PI/2, 
            false
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(-this.width/2, 2.2, 0), 
            Math.PI/2, 
            false
        ));

        // Задние окна
        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(-3.5, 6, -this.depth/2 - 0.1), 
            0, 
            false
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(-3.5, 2.2, -this.depth/2 - 0.1), 
            0, 
            false
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(0, 6, -this.depth/2 - 0.1), 
            0, 
            false
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(0, 2.2, -this.depth/2 - 0.1), 
            0, 
            false
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(3.5, 6, -this.depth/2 - 0.1), 
            0, 
            false
        ));

        cottageGroup.add(this.createWindowWithFrame(
            new THREE.Vector3(3.5, 2.2, -this.depth/2 - 0.1), 
            0, 
            false
        ));

        this.mesh = cottageGroup;
    }
}