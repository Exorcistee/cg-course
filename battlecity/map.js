import { Levels } from "./levels.js";

export class Map {
    constructor(scene) {
        this.scene = scene;
        this.grid = [];
        this.blockSize = 2;
        this.mapSize = 13; // 13x13 blocks (original was 13x13 tiles)
        this.groundTiles = [];
        this.enemySpawnPoints = [];
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
        let playerSpawn;
        this.enemySpawnPoints = []; // Очищаем массив точек спавна
        
        const levelMatrix = Levels.getLevel(1);
        this.createTiledGround();
        
        // Первый проход: находим точки спавна
        for (let row = 0; row < this.mapSize; row++) {
                    for (let col = 0; col < this.mapSize; col++) {
                        const blockType = levelMatrix[row][col];
                        if (blockType === "S") {
                            playerSpawn = this.calculateWorldPosition(col, row);
                        }
                        else if (blockType === "E") {
                            const enemySpawn = this.calculateWorldPosition(col, row);
                            this.enemySpawnPoints.push(enemySpawn);
                            
                            // Визуализация точки спавна (красная сфера)
                            const markerGeometry = new THREE.SphereGeometry(0.5);
                            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                            marker.position.set(enemySpawn.x, 0.5, enemySpawn.z);
                            this.scene.add(marker);
                        }
                    }
                }

                // Второй проход: создаем блоки
                for (let row = 0; row < this.mapSize; row++) {
                    for (let col = 0; col < this.mapSize; col++) {
                        const blockType = levelMatrix[row][col];
                        this.placeBlock(col - 6, row - 6, blockType);
                    }
                }

                return { 
                    playerSpawn: playerSpawn, 
                    enemySpawns: this.enemySpawnPoints 
                };
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
            case "E":
                geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x808080,
                });
            default:
                return;
        }
        
        const block = new THREE.Mesh(geometry, material);
        block.position.set(x * this.blockSize, type === 3 ? 0 : this.blockSize/2, z * this.blockSize);
        block.userData = {
            type: type,
            passable: type === 5, 
            destructible: type === 1, 
            isWater: type === 3 
        };
        
        this.scene.add(block);
        this.grid.push(block);
    }

    checkCollision(position, radius = 0) {
        const blockSize = this.blockSize;
        const gridX = Math.round(position.x / blockSize);
        const gridZ = Math.round(position.z / blockSize);
        
        // Проверяем выход за границы карты
        if (Math.abs(gridX) > this.mapSize/2 || Math.abs(gridZ) > this.mapSize/2) {
            return null; // Возвращаем null вместо true
        }
        
        // Проверяем столкновение с блоками
        for (const block of this.grid) {
            if (!block.userData.passable) { // Только непроходимые блоки
                const distance = position.distanceTo(block.position);
                if (distance < blockSize/2 + radius) {
                    return block;
                }
            }
        }
        
        return null;
    }
}