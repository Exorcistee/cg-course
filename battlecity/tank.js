import { Projectile } from "./projectile.js";

export class PlayerTank {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.model = null;
        this.speed = 0.05;
        this.rotationSpeed = 0.02;
        this.position = new THREE.Vector3(0, 0, 0);
        this.direction = new THREE.Vector3(0, 0, 1);
        this.health = 1;
        this.destroyed = false;
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        this.shootCooldown = 500;
        this.lastShotTime = 0;
        this.tankSize = 1;
        this.tankRotation = 0; 
        this.rotateSpeed = Math.PI / 60; 
        this.currentBlock = null; 
        this.adjacentBlocks = [];
        this.setupCollider();
    }

    setupCollider() {
        // Создаем простой коллайдер (цилиндр для танка)
        const geometry = new THREE.CylinderGeometry(
            this.tankSize * 0.5, 
            this.tankSize * 0.5, 
            this.tankSize * 0.6, 
            16 
        );
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            wireframe: true,
            visible: false 
        });
        
        this.collider = new THREE.Mesh(geometry, material);
        this.collider.rotation.x = Math.PI / 2; 
        this.scene.add(this.collider);
    }

    updateCollider() {
        if (this.model && this.collider) {

            this.collider.position.copy(this.model.position);
            this.collider.position.y = this.tankSize * 0.3; 
            
            this.collider.rotation.z = this.tankRotation;
        }
    }

    async loadModel() {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        loader.load('tank.glb', (gltf) => {
            this.model = gltf.scene;
            
            const bbox = new THREE.Box3().setFromObject(this.model);
            const size = bbox.getSize(new THREE.Vector3());
            const scale = this.game.map.blockSize / Math.max(size.x, size.y, size.z);
            this.model.scale.set(scale, scale, scale);
            
            this.model.traverse(child => {
                if (child.name.includes('Tank_Gun') || child.name.includes('Tower')) {
                    this.turret = child;
                }
            });
            
            this.isModelLoaded = true;
            resolve();
        }, undefined, reject);
    });
}

    createPlaceholder() {
        
        const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);
        const turretGeometry = new THREE.BoxGeometry(0.8, 0.6, 1);
        turretGeometry.translate(0, 0.3, 0);
        
        const tank = new THREE.Group();
        tank.add(new THREE.Mesh(bodyGeometry, new THREE.MeshStandardMaterial({ color: 0x00FF00 })));
        tank.add(new THREE.Mesh(turretGeometry, new THREE.MeshStandardMaterial({ color: 0x007700 })));
        
        this.model = tank;
        this.scene.add(this.model);
    }

    checkCollision(position, radius = 0) {
        for (const block of this.grid) {
            // Снаряды должны сталкиваться только с непроходимыми и неводными блоками
            if (!block.userData.passable && !block.userData.isWater) {
                const distance = position.distanceTo(block.position);
                if (distance < this.blockSize/2 + radius) {
                    return block;
                }
            }
        }
        return null;
    }

    updateAdjacentBlocks() {
        this.adjacentBlocks = [];
        
        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                if (x === 0 && z === 0) continue; 
                
                const neighborPos = new THREE.Vector3(
                    this.position.x + x * this.game.map.blockSize,
                    this.position.y,
                    this.position.z + z * this.game.map.blockSize
                );
                
                const block = this.game.map.getBlockAt(neighborPos);
                if (block) {
                    this.adjacentBlocks.push({
                        block,
                        direction: new THREE.Vector3(x, 0, z).normalize()
                    });
                }
            }
        }
    }

    checkMovementCollision(newPosition) {
        // Проверяем коллизию с картой
        const gridX = Math.round(newPosition.x / this.game.map.blockSize);
        const gridZ = Math.round(newPosition.z / this.game.map.blockSize);
        
        // Проверяем выход за границы карты
        if (Math.abs(gridX) > this.game.map.mapSize/2 || 
            Math.abs(gridZ) > this.game.map.mapSize/2) {
            return true; // Коллизия с границей карты
        }
        
        // Проверяем все блоки в радиусе
        for (const block of this.game.map.grid) {
            if (block.userData.isWater) {
                // Танк не может ездить по воде
                const distance = newPosition.distanceTo(block.position);
                if (distance < this.game.map.blockSize * 1) {
                    return true;
                }
            }
            else if (!block.userData.passable) {
                // Для непроходимых блоков (кроме воды)
                const distance = newPosition.distanceTo(block.position);
                if (distance < this.game.map.blockSize * 1) {
                    return true;
                }
            }
        }
        
        return false; // Коллизий нет
    }

    update() {
        if (!this.isModelLoaded) return;

        if (this.keys.ArrowLeft) this.tankRotation += this.rotateSpeed;
        if (this.keys.ArrowRight) this.tankRotation -= this.rotateSpeed;
        
        this.direction.set(
            Math.sin(this.tankRotation),
            0,
            Math.cos(this.tankRotation)
        ).normalize();
        
        const newPosition = this.position.clone();
        if (this.keys.ArrowUp) newPosition.add(this.direction.clone().multiplyScalar(this.speed));
        if (this.keys.ArrowDown) newPosition.add(this.direction.clone().multiplyScalar(-this.speed));
        
        if (!this.checkMovementCollision(newPosition)) {
            this.position.copy(newPosition);
        }
        
        this.updateCollider();    
        
        // Обновление модели
        this.model.position.copy(this.position);
        this.model.rotation.y = this.tankRotation - Math.PI; // Учёт начального поворота!
        if (this.keys.Space) {
            this.shoot();
            this.keys.Space = false; // Сбрасываем флаг нажатия пробела
        }
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.destroy();
            this.game.lives--;
            document.getElementById('lives').textContent = `Lives: ${this.game.lives}`;
            
            if (this.game.lives > 0) {
                setTimeout(() => this.respawn(), 2000);
            } else {
                this.game.gameOver = true;
                alert('Game Over!');
            }
        }
    }

    respawn() {
        this.destroyed = false;
        this.health = 1;
        this.spawn(this.game.playerSpawn.x, this.game.playerSpawn.z);
    }

    spawn(x, z) {
        this.position.set(x, 0, z);
        this.tankRotation = 0; // Начальный угол
        
        if (this.model) {
            // Сброс трансформаций
            this.model.position.set(0, 0, 0);
            this.model.rotation.set(0, Math.PI, 0); // Поворот на 180°
            this.model.updateMatrixWorld(true);
            
            // Установка позиции
            this.model.position.copy(this.position);
            this.scene.add(this.model);
        } else {
            this.createPlaceholder();
        }
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.shootCooldown) return;
        
        const shootPosition = this.position.clone().add(
            this.direction.clone().multiplyScalar(1.5)
        );
        
        const projectile = new Projectile(
            this.scene,
            this.game, // Передаем ссылку на игру
            shootPosition,
            this.direction.clone(),
            'player'
        );
        
        this.game.projectiles.push(projectile);
        this.lastShotTime = currentTime;
    }

    handleKeyDown(event) {
        if (event.code in this.keys) {
            this.keys[event.code] = true;
        }
    }

    handleKeyUp(event) {
        if (event.code in this.keys) {
            this.keys[event.code] = false;
        }
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.destroy();
            this.game.lives--;
            document.getElementById('lives').textContent = `Lives: ${this.game.lives}`;
            
            if (this.game.lives > 0) {
                setTimeout(() => this.spawn(), 2000);
            } else {
                this.game.gameOver = true;
                alert('Game Over!');
            }
        }
    }

    destroy() {
        this.destroyed = true;
        if (this.model) this.scene.remove(this.model);
        if (this.collider) this.scene.remove(this.collider);
    }
}