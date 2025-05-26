export class EnemyTank {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.model = null;
        this.speed = 0.05;
        this.rotationSpeed = 0.03;
        this.position = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.health = 1;
        this.destroyed = false;
        this.moveTimer = 0;
        this.shootTimer = 0;
        this.type = Math.floor(Math.random() * 3); // Different enemy types
    }

    spawn() {
        const modelNames = ['enemy_tank_1', 'enemy_tank_2', 'enemy_tank_3'];
        const modelName = modelNames[this.type % modelNames.length];
        
        if (this.game.models[modelName]) {
            this.model = this.game.models[modelName].clone();
            this.model.position.copy(this.position);
            this.model.lookAt(this.position.clone().add(this.direction));
            this.scene.add(this.model);
        } else {
            console.warn(`Enemy tank model ${modelName} not found`);
            const colors = [0xff0000, 0x00ff00, 0x0000ff];
            this.model = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: colors[this.type % colors.length] })
            );
            this.scene.add(this.model);
        }
    }

    update() {
        if (this.destroyed) return;
        
        this.moveTimer--;
        this.shootTimer--;
        
        // AI movement
        if (this.moveTimer <= 0) {
            // Change direction randomly
            const rotation = new THREE.Quaternion();
            rotation.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                (Math.random() - 0.5) * Math.PI
            );
            this.direction.applyQuaternion(rotation);
            this.direction.normalize();
            
            this.moveTimer = Math.floor(Math.random() * 100) + 50;
        }
        
        // Move forward
        const moveVector = this.direction.clone().multiplyScalar(this.speed);
        const newPosition = this.position.clone().add(moveVector);
        
        // Check collision with map
        const collidedBlock = this.game.map.checkCollision(newPosition, 0.8);
        if (!collidedBlock || collidedBlock.userData.type === 'water') {
            this.position.copy(newPosition);
        } else {
            // Change direction if collided
            this.moveTimer = 0;
        }
        
        // Update model
        if (this.model) {
            this.model.position.copy(this.position);
            this.model.lookAt(this.position.clone().add(this.direction));
        }
        
        // Shooting
        if (this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = Math.floor(Math.random() * 100) + 100;
        }
    }

    shoot() {
        if (this.destroyed) return;
        
        const projectile = new Projectile(
            this.scene,
            this.position.clone(),
            this.direction.clone(),
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
        if (this.model) {
            this.scene.remove(this.model);
        }
    }
}