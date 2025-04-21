import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Porch {
    constructor() {
        this.width = 4;      // Ширина веранды (вдоль фасада)
        this.depth = 6;    // Глубина веранды
        this.height = 0.5;   // Высота основания
        this.roofHeight = 3; // Высота крыши от верха колонн
        this.createMesh();
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('./textures/wood.jpg');
        woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(4, 4); // Увеличиваем повтор текстуры

        const porchGroup = new THREE.Group();

        // Основание веранды
        const baseGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            map: woodTexture,
            roughness: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = this.height / 2;
        base.receiveShadow = true;
        porchGroup.add(base);

        // Ступени (3 широкие ступени)
        const stepMaterial = new THREE.MeshStandardMaterial({ 
            map: woodTexture,
            roughness: 0.6
        });
        
        for (let i = 0; i < 3; i++) {
            const stepWidth = this.width + 0.5 * (i + 1);
            const stepDepth = this.depth * 0.3;
            const stepGeometry = new THREE.BoxGeometry(
                stepWidth, 
                this.height * 0.4, 
                stepDepth
            );
            
            const step = new THREE.Mesh(stepGeometry, stepMaterial);
            step.position.set(
                0, 
                this.height * 0.2 * (i + 1), 
                -this.depth/2 + stepDepth/2 * (i + 1)
            );
            step.castShadow = true;
            porchGroup.add(step);
        }

        // Колонны (4 угловые колонны)
        const columnGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 8);
        const columnMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.5
        });

        const columnsPositions = [
            [-this.width/2 + 0.3, 1.4, this.depth/2 - 0.3],
            [this.width/2 - 0.3, 1.4, this.depth/2 - 0.3],
            [-this.width/2 + 0.3, 1.4, -this.depth/2 + 0.3],
            [this.width/2 - 0.3, 1.4, -this.depth/2 + 0.3]
        ];

        columnsPositions.forEach(pos => {
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            column.position.set(pos[0], pos[1], pos[2]);
            column.castShadow = true;
            porchGroup.add(column);
        });

        // Односкатная крыша
        const roofOverhang = 0.5;
        const roofSlopeHeight = 1.2; // Разница высот между передним и задним краем
        
        // 1. Форма крыши (трапеция с одним наклоном)
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-this.width/2 - roofOverhang, 0);              // Нижний задний угол
        roofShape.lineTo(this.width/2, 0);               // Нижний задний угол
        roofShape.lineTo(this.width/2, roofSlopeHeight); // Верхний передний угол
        roofShape.lineTo(-this.width/2 - roofOverhang, 0);              // Замыкаем
        
        // 2. Выдавливаем по глубине веранды
        const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
            depth: this.depth + roofOverhang * 2,
            bevelEnabled: false
        });
        
        // 4. Создаем меш крыши
        const roofMaterial = new THREE.MeshStandardMaterial({
            map: woodTexture,
            roughness: 0.6,
            side: THREE.DoubleSide
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(-this.width/2 - roofOverhang * 2.62, this.roofHeight, 0); 
        roof.rotation.y = Math.PI/2; 
        roof.castShadow = true;
        porchGroup.add(roof);

        // Перила
        const railingMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const railingHeight = 0.8;
        
        // Боковые перила
        const railingGeometry = new THREE.BoxGeometry(0.1, railingHeight, this.depth - 0.6);
        const leftRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        leftRailing.position.set(-this.width/2 + 0.05, railingHeight/2 + this.height, 0);
        porchGroup.add(leftRailing);
        
        const rightRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        rightRailing.position.set(this.width/2 - 0.05, railingHeight/2 + this.height, 0);
        porchGroup.add(rightRailing);

        this.mesh = porchGroup;
    }
}