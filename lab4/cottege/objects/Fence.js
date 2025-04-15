import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export class Fence {
    constructor(width, depth) {
        this.width = width;
        this.depth = depth;
        this.createMesh();
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('https://threejs.org/examples/textures/wood/wood.jpg');
        woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(0.5, 0.5);

        const fenceGroup = new THREE.Group();
        const fenceMaterial = new THREE.MeshStandardMaterial({ 
            map: woodTexture,
            roughness: 0.9
        });


        const postHeight = 1.5;
        const postWidth = 0.1;
        const postDepth = 0.1;
        const railHeight = 0.05;
        const railWidth = 0.8;
        const railDepth = 0.05;
        const spacing = 0.9;


        const createFenceSection = (x, z, rotationY) => {
            // Столбы
            const postGeometry = new THREE.BoxGeometry(postWidth, postHeight, postDepth);
            
            const post1 = new THREE.Mesh(postGeometry, fenceMaterial);
            post1.position.set(x, postHeight / 2, z);
            post1.castShadow = true;
            fenceGroup.add(post1);

            const post2 = new THREE.Mesh(postGeometry, fenceMaterial);
            post2.position.set(
                x + railWidth * Math.sin(rotationY), 
                postHeight / 2, 
                z + railWidth * Math.cos(rotationY)
            );
            post2.castShadow = true;
            fenceGroup.add(post2);

            const railGeometry = new THREE.BoxGeometry(railWidth, railHeight, railDepth);
            
            for (let y = 0.3; y < postHeight; y += 0.4) {
                const rail = new THREE.Mesh(railGeometry, fenceMaterial);
                rail.position.set(
                    x + railWidth / 2 * Math.sin(rotationY),
                    y,
                    z + railWidth / 2 * Math.cos(rotationY)
                );
                rail.rotation.y = rotationY;
                rail.castShadow = true;
                fenceGroup.add(rail);
            }
        };


        for (let z = -this.depth / 2; z < this.depth / 2; z += spacing) {
            createFenceSection(-this.width / 2, z, 0);
        }


        for (let x = -this.width / 2; x < this.width / 2; x += spacing) {
            createFenceSection(x, this.depth / 2, Math.PI / 2);
        }


        for (let z = this.depth / 2; z > -this.depth / 2; z -= spacing) {
            createFenceSection(this.width / 2, z, Math.PI);
        }

        for (let x = this.width / 2; x > -this.width / 2; x -= spacing) {
            createFenceSection(x, -this.depth / 2, -Math.PI / 2);
        }

        this.mesh = fenceGroup;
    }
}