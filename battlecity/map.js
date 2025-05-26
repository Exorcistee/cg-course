import { Levels } from "./levels.js";

export class Map {
    constructor(scene) {
        this.scene = scene;
        this.grid = [];
        this.blockSize = 2;
        this.mapSize = 13; // 13x13 blocks (original was 13x13 tiles)
        this.groundTiles = [];
    }

    createTiledGround() {
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            side: THREE.DoubleSide
        });
        
        for (let x = 0; x < this.mapSize; x++) {
            for (let z = 0; z < this.mapSize; z++) {
                const groundGeometry = new THREE.PlaneGeometry(
                    this.blockSize, 
                    this.blockSize
                );
                const edges = new THREE.EdgesGeometry( groundGeometry);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
                const groundTile = new THREE.Mesh(groundGeometry, groundMaterial);
                
                line.rotation.x = -Math.PI / 2;
                line.position.set(
                    (x - this.mapSize/2) * this.blockSize + this.blockSize/2,
                    0,
                    (z - this.mapSize/2) * this.blockSize + this.blockSize/2
                );
                groundTile.rotation.x = -Math.PI / 2;
                groundTile.position.set(
                    (x - this.mapSize/2) * this.blockSize + this.blockSize/2,
                    0,
                    (z - this.mapSize/2) * this.blockSize + this.blockSize/2
                );
                
                groundTile.receiveShadow = true;
                this.groundTiles.push(groundTile);
                this.scene.add(groundTile);
                this.scene.add( line );
            }
        }
    }

    worldToGridCoords(worldPos) {
        return {
            x: Math.floor((worldPos.x + this.mapSize/2 * this.blockSize) / this.blockSize),
            z: Math.floor((worldPos.z + this.mapSize/2 * this.blockSize) / this.blockSize)
        };
    }

    getBlockAt(worldPos) {
        const gridCoords = this.worldToGridCoords(worldPos);
        if (gridCoords.x >= 0 && gridCoords.x < this.mapSize && 
            gridCoords.z >= 0 && gridCoords.z < this.mapSize) {
            return this.grid[gridCoords.x][gridCoords.z];
        }
        return null;
    }

    generate() {

        this.clear();
        let spawnPoint;
        const levelMatrix = Levels.getLevel(1);
        this.createTiledGround();
        console.log(levelMatrix);
        for (let row = 0; row < this.mapSize; row++) {
            for (let col = 0; col < this.mapSize; col++) {
                if (levelMatrix[row][col] == "S") {
                    spawnPoint = this.calculateWorldPosition(col, row);
                    console.log(spawnPoint);
                    const spawnMarkerGeometry = new THREE.SphereGeometry(0.5);
                    const spawnMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                    this.spawnMarker = new THREE.Mesh(spawnMarkerGeometry, spawnMarkerMaterial);
                    this.spawnMarker.position.set(spawnPoint.x, 0, spawnPoint.z);
                    this.scene.add(this.spawnMarker);
                }
            }
        }

        for (let row = 0; row < this.mapSize; row++) {
            for (let col = 0; col < this.mapSize; col++) {
                const blockType = levelMatrix[row][col];
                this.placeBlock(col - 6, row - 6, blockType);
            }
        }
        return spawnPoint;
        
    }

    clear() {
        this.grid.forEach(block => {
            this.scene.remove(block);
        });
        this.grid = [];
    }

    calculateWorldPosition(gridX, gridZ) {
        return {
            x: (gridX - this.mapSize/2) * this.blockSize + this.blockSize/2,
            z: (gridZ - this.mapSize/2) * this.blockSize + this.blockSize/2
        };
}

    placeBlock(x, z, type) {
        let geometry, material;
        
        switch(type) {
            case 1:
                geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0xB22222,
                    map: new THREE.TextureLoader().load('bricks.png')
                });
                break;
            case 3:
                geometry = new THREE.BoxGeometry(this.blockSize, 0.01, this.blockSize);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x1E90FF,
                    transparent: true,
                    opacity: 0.7
                });
                break;
            case 2:
                geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x808080,
                    map: new THREE.TextureLoader().load('wall.png')
                });
                break;
            case 5:
                geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x808080,
                    map: new THREE.TextureLoader().load('grass.jpg')
                });
                break;
            case "F":
                geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x808080,
                    map: new THREE.TextureLoader().load('flag.png')
                });
            default:
                return;
        }
        
        const block = new THREE.Mesh(geometry, material);
        block.position.set(x * this.blockSize, type === 3 ? 0 : this.blockSize/2, z * this.blockSize);
        block.userData = { type, health: type === 2 ? Infinity : 1 };
        this.scene.add(block);
        this.grid.push(block);
    }

    checkCollision(position, radius) {
        for (const block of this.grid) {
            if (block.userData.type === 4) continue;
            const distance = position.distanceTo(block.position);
            if (distance < radius + this.blockSize/2) {
                return block;
            }
        }
        return false;
    }
}