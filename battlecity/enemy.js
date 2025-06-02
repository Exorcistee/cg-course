import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/GLTFLoader.js';
import { Projectile } from './projectile.js';

export class EnemyTank {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.model = null;
        this.speed = 0.03;
        this.position = new THREE.Vector3();
        this.direction = new THREE.Vector3(1, 0, 0); // Начальное направление
        this.health = 1;
        this.destroyed = false;
        this.shootCooldown = 2000;
        this.lastShotTime = 0;
        this.tankSize = 1.5;
        this.moveTimer = 0;
        this.moveDuration = 2000 + Math.random() * 3000; // Время движения в одном направлении
        this.stuckTimer = 0;
        this.currentDirection = this.getRandomDirection(); // Начальное направление
    }

    async loadModel() {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load('tank.glb', (gltf) => {
                this.model = gltf.scene;
                
                // Масштабируем модель под размер карты
                const bbox = new THREE.Box3().setFromObject(this.model);
                const size = bbox.getSize(new THREE.Vector3());
                const scale = this.game.map.blockSize / Math.max(size.x, size.z);
                this.model.scale.set(scale, scale, scale);
                
                // Находим башню для поворота
                this.model.traverse(child => {
                    if (child.isMesh && child.name.includes('Turret')) {
                        this.turret = child;
                    }
                });
                
                resolve();
            }, undefined, reject);
        });
    }

    getRandomDirection() {
        const directions = [
            new THREE.Vector3(1, 0, 0),  // Вправо
            new THREE.Vector3(-1, 0, 0), // Влево
            new THREE.Vector3(0, 0, 1),  // Вверх
            new THREE.Vector3(0, 0, -1)  // Вниз
        ];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    update(deltaTime) {
        if (this.destroyed) return;
        
        this.moveTimer += deltaTime;
        
        // Меняем направление каждые moveDuration миллисекунд
        if (this.moveTimer > this.moveDuration) {
            this.changeDirection();
            this.moveTimer = 0;
        }
        
        // Движение
        const newPosition = this.position.clone().add(
            this.direction.clone().multiplyScalar(this.speed * deltaTime / 16)
        );
        
        // Проверка коллизий
        if (!this.game.map.checkCollision(newPosition, this.tankSize * 0.4)) {
            this.position.copy(newPosition);
        } else {
            this.changeDirection();
        }
        
        // Обновление позиции и поворота модели
        if (this.model) {
            this.model.position.copy(this.position);
            this.model.rotation.y = Math.atan2(this.direction.x, this.direction.z);
        }
    }

    changeDirection() {
            // Возможные направления (только вверх/вниз/влево/вправо)
            const directions = [
                new THREE.Vector3(1, 0, 0),   // Вправо
                new THREE.Vector3(-1, 0, 0),  // Влево
                new THREE.Vector3(0, 0, 1),   // Вверх
                new THREE.Vector3(0, 0, -1)   // Вниз
            ];
            
            // Выбираем случайное направление, исключая текущее
            const possibleDirections = directions.filter(dir => !dir.equals(this.direction));
            this.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            this.model.rotation.set(0, Math.PI * -1, 0); 
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.destroy();
            // Добавляем эффект взрыва
            this.createExplosion();
        }
    }

    createExplosion() {
        const explosionGeometry = new THREE.SphereGeometry(1, 8, 8);
        const explosionMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            transparent: true,
            opacity: 0.8
        });
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(this.position);
        this.scene.add(explosion);
        
        // Анимация взрыва
        let scale = 1;
        const animateExplosion = () => {
            scale += 0.1;
            explosion.scale.set(scale, scale, scale);
            explosionMaterial.opacity -= 0.05;
            
            if (explosionMaterial.opacity > 0) {
                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(explosion);
            }
        };
        animateExplosion();
    }

    canSeePlayer() {
        if (!this.game.player || this.game.player.destroyed) return false;
        
        const directionToPlayer = new THREE.Vector3().subVectors(
            this.game.player.position, 
            this.position
        ).normalize();
        
        const isAligned = Math.abs(directionToPlayer.x) > 0.9 || 
                         Math.abs(directionToPlayer.z) > 0.9;
        
        return isAligned && !this.game.map.checkLineOfSight(this.position, this.game.player.position);
    }

    shoot() {
        if (this.destroyed) return;
        
        const shootPosition = this.position.clone().add(
            this.currentDirection.clone().multiplyScalar(1.5)
        );
        
        const projectile = new Projectile(
            this.scene,
            this.game,
            shootPosition,
            this.currentDirection.clone(),
            'enemy'
        );
        
        this.game.projectiles.push(projectile);
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.destroyed = true;
        if (this.model) this.scene.remove(this.model);
        if (this.collider) this.scene.remove(this.collider);
    }

    spawn(x, z) {
        this.position.set(x, 0, z);
        if (this.model) {
            this.model.position.set(0, 0, 0);
            this.model.rotation.set(0, Math.PI, 0); // Поворот на 180°
            this.model.updateMatrixWorld(true);
            
            // Установка позиции
            this.model.position.copy(this.position);
            this.scene.add(this.model);
        }
    }

}

export class BasicEnemy extends EnemyTank {
    constructor(scene, game) {
        super(scene, game);
        this.speed = 0.03;
        this.health = 1;
        this.color = 0xff0000;
    }
}

export class FastEnemy extends EnemyTank {
    constructor(scene, game) {
        super(scene, game);
        this.speed = 0.06;
        this.health = 1;
        this.color = 0xffff00;
        this.shootCooldown = 1500;
    }
}

export class HeavyEnemy extends EnemyTank {
    constructor(scene, game) {
        super(scene, game);
        this.speed = 0.02;
        this.health = 3;
        this.color = 0x800080;
        this.shootCooldown = 3000;
    }
}