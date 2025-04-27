import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Porch {
    constructor() {
        this.width = 10;      // Ширина веранды (вдоль фасада)
        this.depth = 6;       // Глубина веранды
        this.height = 0.5;    // Высота основания
        this.roofHeight = 3;  // Высота крыши от верха колонн
        this.createMesh();
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('./textures/wood.jpg');
        woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(4, 4);

        const porchGroup = new THREE.Group();

        // Основание веранды (смещено на -2.5 по X)
        const baseGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            map: woodTexture,
            roughness: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(-2.5, this.height / 2, 0);
        base.receiveShadow = true;
        porchGroup.add(base);

        // Колонны (4 угловые колонны)
        const columnGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 8);
        const columnMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.5
        });

        // Позиции колонн с учетом смещения основания
        const columnsPositions = [
            [-this.width/2 + 0.3 - 2.5, 1.8, this.depth/2 - 0.3],  // Левая передняя
            [this.width/2 - 0.3 - 2.5, 1.8, this.depth/2 - 0.3],   // Правая передняя
            [-this.width/2 + 0.3 - 2.5, 1.8, -this.depth/2 + 0.3], // Левая задняя
            [this.width/2 - 0.3 - 2.5, 1.8, -this.depth/2 + 0.3]    // Правая задняя
        ];

        columnsPositions.forEach(pos => {
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            column.position.set(pos[0], pos[1], pos[2]);
            column.castShadow = true;
            porchGroup.add(column);
        });

        // Односкатная крыша
        const roofOverhang = 2.0; // Свес по бокам веранды
        const roofSlopeHeight = 1.2; // Высота ската
        
        // 1. Форма крыши (правильный скат ОТ дома)
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-this.depth/4, 0);  // Ближний к дому край (низкий)
        roofShape.lineTo(this.depth/4 + roofOverhang, roofSlopeHeight); // Дальний от дома край (высокий)
        roofShape.lineTo(this.depth/4 + roofOverhang, 0); // Дальний от дома край (низкий)
        roofShape.lineTo(-this.depth/4, 0);  // Замыкаем
        
        // 2. Выдавливаем по ширине веранды
        const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
            depth: this.width, // Ширина + свесы
            bevelEnabled: false
        });
        
        // 3. Материал крыши
        const roof = new THREE.Mesh(roofGeometry, new THREE.MeshStandardMaterial({
            map: woodTexture,
            roughness: 0.6,
            side: THREE.DoubleSide
        }));
        
        // 4. Позиционирование и поворот крыши
        roof.position.set(-7.5, this.roofHeight, 2); // Центровка по X как у основания 
        roof.rotation.y = Math.PI/2;  // Поворот на 90° вокруг Y
        roof.castShadow = true;
        porchGroup.add(roof);
        this.mesh = porchGroup;
    }
}