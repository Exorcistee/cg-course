import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Fence {
    constructor(width, depth) {
        this.width = width;
        this.depth = depth;
        this.createMesh();
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('./textures/wood.jpg');
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


        const createFenceSection = (x, z, rotationY, rotate) => {
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
                rail.castShadow = true;
                if (rotate == true) {
                    rail.rotation.y = Math.PI / 2; 
                }
                else{
                    rail.rotation.y = Math.PI; 
                }

                fenceGroup.add(rail);

            }
        };


        for (let z = -this.depth / 2; z < this.depth / 2; z += spacing) {
            createFenceSection(-this.width / 2, z, 0, true);
        }


        for (let x = -this.width / 2; x < this.width / 2; x += spacing) {
            createFenceSection(x, this.depth / 2, Math.PI / 2, false);
        }


        for (let z = this.depth / 2; z > -this.depth / 2; z -= spacing) {
            createFenceSection(this.width / 2, z, Math.PI, true);
        }

        for (let x = this.width / 2; x > -this.width / 2; x -= spacing) {
            createFenceSection(x, -this.depth / 2, -Math.PI / 2, false);
        }

        this.mesh = fenceGroup;
    }
}