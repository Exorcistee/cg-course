import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/OBJLoader.js';

export class ChessPiece {
    constructor(type, color, position) {
        this.type = type;
        this.color = color;
        this.mesh = null;
        this.position = new THREE.Vector3(...position);
        this.originalPosition = this.position.clone();
    }

    async load() {
    try {
        const modelPath = `models/${this.type}`;
        
        // Загружаем модель
        const object = await new Promise((resolve, reject) => {
            new OBJLoader().load(
                `${modelPath}.obj`,
                resolve,
                undefined,
                reject
            );
        });

        this.mesh = object;
        
        // 1. Сначала центрируем геометрию
        this.mesh.traverse(child => {
            if (child.isMesh && child.geometry) {
                child.geometry.center();
            }
        });

        // 2. Вычисляем автоматический масштаб
        
        this.mesh.scale.set(0.1, 0.1, 0.1);
        
        // 3. Поворот и позиционирование
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.copy(this.position);
        
        if (this.color=="white") {
            this.mesh.rotation.z = -Math.PI;
        }

        // 4. Настройка теней
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Устанавливаем материал, если не загружен
                if (!child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: this.color === 'white' ? 0xffffff : 0x222222,
                        roughness: 0.7
                    });
                }
            }
        });
        
    } catch (error) {
        console.error(`Error loading ${this.color} ${this.type}:`, error);
        this.createFallbackModel();
    }
}

    createFallbackModel() {

        const geometry = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 32);
        const material = new THREE.MeshStandardMaterial({
            color: this.color === 'white' ? 0xffffff : 0x222222,
            roughness: 0.3,
            metalness: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
    }


    select() {
        this.isSelected = true;
        this.mesh.position.y += 0.5;
    }

    deselect() {
        this.isSelected = false;
        this.mesh.position.y -= 0.5;
    }

    startAnimation(targetPosition, duration) {
        this.animation = {
            startTime: performance.now(),
            duration,
            startPosition: this.currentPosition.clone(),
            targetPosition: new THREE.Vector3(...targetPosition)
        };
    }

    updateAnimation(time) {
        if (!this.animation) return false;

        const elapsed = (time - this.animation.startTime) / 1000;
        const progress = Math.min(elapsed / this.animation.duration, 1);

        const liftHeight = 0.5;
        const liftProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        const yOffset = liftProgress * liftHeight;

        this.currentPosition.lerpVectors(
            this.animation.startPosition,
            this.animation.targetPosition,
            progress
        );

        this.mesh.position.set(
            this.currentPosition.x,
            this.currentPosition.y + yOffset,
            this.currentPosition.z
        );

        if (progress === 1) {
            this.originalPosition.copy(this.animation.targetPosition);
            this.animation = null;
            return true;
        }

        return false;
    }
}