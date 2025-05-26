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
        this.shootCooldown = 0;
        this.tankSize = 1;
        this.tankRotation = 0; // Текущий угол поворота в радианах
        this.rotateSpeed = Math.PI / 60; 
        this.currentBlock = null; // Текущий блок под танком
        this.adjacentBlocks = [];
    }

    async loadModel() {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        loader.load('tank.glb', (gltf) => {
            this.model = gltf.scene;
            
            // Масштабирование
            const bbox = new THREE.Box3().setFromObject(this.model);
            const size = bbox.getSize(new THREE.Vector3());
            const scale = this.game.map.blockSize / Math.max(size.x, size.y, size.z);
            this.model.scale.set(scale, scale, scale);
            
            // Находим башню
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

    checkCollisions() {
        const tankRadius = this.game.map.blockSize * 0.4; 
        
        for (const {block, direction} of this.adjacentBlocks) {
            console.log(block.userData);
            if (!block.userData.passable) {
                const distance = this.position.distanceTo(block.position);
                if (distance < tankRadius + this.game.map.blockSize/2) {
                    const pushForce = direction.clone()
                        .multiplyScalar(this.game.map.blockSize * 0.6);
                    
                    this.position.add(pushForce);
                    this.model.position.copy(this.position);
                }
            }
        }
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

    update() {
        if (!this.isModelLoaded) return;

        // Поворот
        if (this.keys.ArrowLeft) this.tankRotation += this.rotateSpeed;
        if (this.keys.ArrowRight) this.tankRotation -= this.rotateSpeed;
        
        // Направление движения
        this.direction.set(
            Math.sin(this.tankRotation),
            0,
            Math.cos(this.tankRotation)
        ).normalize();
        
        // Движение
        const newPosition = this.position.clone();
        if (this.keys.ArrowUp) newPosition.add(this.direction.clone().multiplyScalar(this.speed));
        if (this.keys.ArrowDown) newPosition.add(this.direction.clone().multiplyScalar(-this.speed));
        
        // Коллизии
        if (!this.game.map.checkCollision(newPosition)) {
            this.position.copy(newPosition);
        }
        
        // Обновление модели
        this.model.position.copy(this.position);
        this.model.rotation.y = this.tankRotation - Math.PI; // Учёт начального поворота!
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
        if (this.destroyed) return;
        
        const projectile = new Projectile(
            this.scene,
            this.position.clone(),
            this.direction.clone(),
            'player'
        );
        this.game.projectiles.push(projectile);
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
        if (this.model) {
            this.scene.remove(this.model);
        }
    }
}