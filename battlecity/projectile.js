export class Projectile {
    constructor(scene, game, position, direction, source) {
        this.scene = scene;
        this.game = game;
        this.position = position.clone();
        this.direction = direction.clone().normalize();
        this.speed = 0.5;
        this.source = source; // 'player' или 'enemy'
        this.destroyed = false;
        
        // Создаем меш снаряда
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: source === 'player' ? 0x00FF00 : 0xFF0000 
            })
        );
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    update() {
        if (this.destroyed) return;
        
        // Движение снаряда
        this.position.add(this.direction.clone().multiplyScalar(this.speed));
        this.mesh.position.copy(this.position);
        
        // Проверка столкновений с картой
        const collidedBlock = this.game.map.checkCollision(this.position, 0.2);
        if (collidedBlock && collidedBlock.userData.destructible) {
            this.game.scene.remove(collidedBlock);
            this.game.map.grid = this.game.map.grid.filter(b => b !== collidedBlock);
            this.destroy();
            return;
        }
        
        // Проверка попадания в танки
        if (this.source === 'player') {
            // Проверка по вражеским танкам
            for (const enemy of this.game.enemies) {
                if (!enemy.destroyed && this.checkTankHit(enemy)) {
                    enemy.takeDamage();
                    this.destroy();
                    return;
                }
            }
        } else {
            // Проверка по игроку
            if (this.game.player && !this.game.player.destroyed && 
                this.checkTankHit(this.game.player)) {
                this.game.player.takeDamage();
                this.destroy();
                return;
            }
        }
        
        // Уничтожение снаряда за пределами карты
        const mapSize = this.game.map.mapSize * this.game.map.blockSize;
        if (Math.abs(this.position.x) > mapSize/2 || 
            Math.abs(this.position.z) > mapSize/2) {
            this.destroy();
        }
    }

    checkTankHit(tank) {
        if (!tank.model || tank.destroyed) return false;
        
        // Создаем ограничивающую сферу для танка
        const tankBoundingSphere = new THREE.Sphere(
            tank.position,
            tank.tankSize * 0.5 // Радиус коллизии
        );
        
        // Проверяем пересечение со снарядом
        return tankBoundingSphere.containsPoint(this.position);
    }

    destroy() {
        this.destroyed = true;
        this.scene.remove(this.mesh);
    }
}