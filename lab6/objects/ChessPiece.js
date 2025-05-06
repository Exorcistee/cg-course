import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class ChessPiece {
    constructor(type, color, position) {
        this.type = type;
        this.color = color;
        this.mesh = new THREE.Group();
        this.originalPosition = new THREE.Vector3(...position);
        this.currentPosition = new THREE.Vector3(...position);
        this.isSelected = false;
        this.animation = null;
        
        this.mesh.position.copy(this.originalPosition);
    }

    async load() {
        // Создаем материал с учетом цвета фигуры
        const material = new THREE.MeshStandardMaterial({ 
            color: this.color === 'white' ? 0xffffff : 0x222222,
            roughness: 0.3,
            metalness: this.color === 'white' ? 0.7 : 0.3
        });

        // Базовый цилиндр для всех фигур
        const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.2, 32);
        const base = new THREE.Mesh(baseGeometry, material);
        base.position.y = -0.1;
        this.mesh.add(base);

        // Создаем специфичные части для каждого типа фигуры
        switch (this.type) {
            case 'pawn':
                this.createPawn(material);
                break;
            case 'rook':
                this.createRook(material);
                break;
            case 'knight':
                this.createKnight(material);
                break;
            case 'bishop':
                this.createBishop(material);
                break;
            case 'queen':
                this.createQueen(material);
                break;
            case 'king':
                this.createKing(material);
                break;
        }

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    createPawn(material) {
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 32);
        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.y = 0.3;
        this.mesh.add(body);

        const topGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const top = new THREE.Mesh(topGeometry, material);
        top.position.y = 0.7;
        this.mesh.add(top);
    }

    createRook(material) {
        const towerGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 4);
        const tower = new THREE.Mesh(towerGeometry, material);
        tower.position.y = 0.3;
        this.mesh.add(tower);

        const topGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.2, 4);
        const top = new THREE.Mesh(topGeometry, material);
        top.position.y = 0.7;
        this.mesh.add(top);
    }

    createKnight(material) {
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 32);
        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.y = 0.2;
        this.mesh.add(body);

        // Голова коня (упрощенная версия)
        const headGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.3);
        const head = new THREE.Mesh(headGeometry, material);
        head.position.set(0, 0.5, 0.2);
        head.rotation.x = -Math.PI / 8;
        this.mesh.add(head);
    }

    createBishop(material) {
        const bodyGeometry = new THREE.ConeGeometry(0.3, 1.0, 32);
        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.y = 0.5;
        this.mesh.add(body);

        const topGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const top = new THREE.Mesh(topGeometry, material);
        top.position.y = 1.0;
        this.mesh.add(top);
    }

    createQueen(material) {
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 32);
        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.y = 0.4;
        this.mesh.add(body);

        const crownGeometry = new THREE.ConeGeometry(0.3, 0.4, 4);
        const crown = new THREE.Mesh(crownGeometry, material);
        crown.position.y = 0.9;
        this.mesh.add(crown);
    }

    createKing(material) {
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.9, 32);
        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.y = 0.45;
        this.mesh.add(body);

        const crossGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        const cross = new THREE.Mesh(crossGeometry, material);
        cross.position.y = 0.95;
        this.mesh.add(cross);
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