import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class StreetLight {
    constructor() {
        this.height = 5;
        this.lightIntensity = 10;
        this.createLight();
        this.createPole();
    }

    createPole() {
        const poleGroup = new THREE.Group();

        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, this.height, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.3
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = this.height / 2;
        pole.castShadow = true;
        poleGroup.add(pole);

        const bracketGeometry = new THREE.BoxGeometry(1, 0.05, 0.05);
        const bracket = new THREE.Mesh(bracketGeometry, poleMaterial);
        bracket.position.set(0.5, this.height - 0.5, 0);
        poleGroup.add(bracket);

        const lampGeometry = new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const lampMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffffaa,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(0.5, this.height - 0.5, 0);
        lamp.rotation.z = Math.PI;
        poleGroup.add(lamp);

        this.mesh = poleGroup;
    }

    createLight() {
        this.light = new THREE.PointLight(0xffeedd, this.lightIntensity, 1, 2);
        this.light.position.set(0.5, this.height - 0.8, 0);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;
    }

    getLight() {
        return this.light;
    }
}