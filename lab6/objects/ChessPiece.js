import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/MTLLoader.js';

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
        const modelPath = 'models/';
        const mtlFile = {
            pawn: '12944_Stone_Chess_Pawn_Side_A_V2_L3.mtl',
            rook: '12941_Stone_Chess_Rook_Side_A_V2_l1.mtl',
            knight: '12943_Stone_Chess_Knight_Side_A_v2_l1.mtl',
            bishop: '12942_Stone_Chess_Bishop_V2_l1.mtl',
            queen: '12940_Stone_Chess_Queen_Side_A_V2_l1.mtl',
            king: '12939_Stone_Chess_King_Side_A_V2_l1.mtl'
        };


        const materials = await new Promise((resolve, reject) => {
            new MTLLoader()
                .setPath(modelPath)
                .load(
                    mtlFile[this.type],
                    (materials) => {

                        materials.preload();
                        console.log(materials);
                        
                        if (this.color === 'black') {
                            Object.values(materials.materials).forEach(material => {
                                material.map = material.specularMap;
                                material.metalness = 0.8;
                                material.roughness = 0.3;
                            });
                        }
                        resolve(materials);
                    },
                    undefined,
                    reject
                );
        });

        const object = await new Promise((resolve, reject) => {
            new OBJLoader()
                .setMaterials(materials)
                .setPath(modelPath)
                .load(
                    `${this.type}.obj`,
                    (obj) => {
                        
                        obj.traverse(child => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        resolve(obj);
                    },
                    undefined,
                    reject
                );
        });

        this.mesh = object;
        const axes = new THREE.AxesHelper(5);
        this.mesh.add(axes);
        
       
        this.mesh.traverse(child => {
            if (child.isMesh && child.geometry) {
                child.geometry = child.geometry.clone();
                child.geometry.center();  
                
                child.geometry.computeBoundingBox();
                const bbox = child.geometry.boundingBox;
                let height = bbox.max.y - bbox.min.y;
                const minY = bbox.min.y;
                
                const heightAdjustments = {
                    pawn: 2.5,
                    rook: 3.5,
                    knight: 5.4,
                    bishop: 2,
                    queen: 2.1,
                    king: 2
                };
                
                if (heightAdjustments[this.type]) {
                    height -= heightAdjustments[this.type];
                }
    
                const position = child.geometry.attributes.position;
                for (let i = 0; i < position.count; i++) {
                    position.setY(i, position.getY(i) + height/2);
                    position.setZ(i, position.getZ(i) + height);
                }              
                position.needsUpdate = true;
                child.geometry.computeBoundingBox();
            }
        });
    
        this.mesh.scale.set(0.1, 0.1, 0.1);
        
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.copy(this.position);
        this.mesh.position.y = 10;
        this.mesh.updateMatrix();
    
        if (this.color === "white") {
            this.mesh.rotation.z = -Math.PI;
        }
    
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                console.log('Texture status:', child.material.map ? 'Loaded' : 'Missing');
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