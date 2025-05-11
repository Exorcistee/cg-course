import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Tree {
    constructor() {
        this.createMesh();
    }

    createMesh() {
        const treeGroup = new THREE.Group();
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.8
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228B22,
            roughness: 0.8
        });

        const leavesBottom = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leavesBottom.position.y = 2.5;
        leavesBottom.castShadow = true;
        treeGroup.add(leavesBottom);

        const leavesMiddle = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leavesMiddle.position.y = 3.5;
        leavesMiddle.scale.set(0.8, 0.8, 0.8);
        leavesMiddle.castShadow = true;
        treeGroup.add(leavesMiddle);

        const leavesTop = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leavesTop.position.y = 4.2;
        leavesTop.scale.set(0.6, 0.6, 0.6);
        leavesTop.castShadow = true;
        treeGroup.add(leavesTop);

        this.mesh = treeGroup;
    }
}