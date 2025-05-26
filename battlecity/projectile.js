export class Projectile {
    constructor(scene, position, direction, source) {
        this.scene = scene;
        this.position = position;
        this.direction = direction;
        this.speed = 0.3;
        this.source = source; // 'player' or 'enemy'
        this.destroyed = false;
        
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshStandardMaterial({ 
                color: source === 'player' ? 0x00FF00 : 0xFF0000 
            })
        );
        this.mesh.position.copy(position);
        this.scene.add(this.mesh);
    }

    update() {
        if (this.destroyed) return;
        
        this.position.add(this.direction.clone().multiplyScalar(this.speed));
        this.mesh.position.copy(this.position);
        
        const collidedBlock = this.game.map.checkCollision(this.position, 0.2);
        if (collidedBlock) {
            if (collidedBlock.userData.type === 'brick') {
                this.scene.remove(collidedBlock);
                this.game.map.grid = this.game.map.grid.filter(b => b !== collidedBlock);
            }
            this.destroy();
            return;
        }
        
        if (this.source === 'player') {
            for (const enemy of this.game.enemies) {
                if (!enemy.destroyed && this.position.distanceTo(enemy.position) < 1) {
                    enemy.takeDamage();
                    this.destroy();
                    return;
                }
            }
        } else {
            if (!this.game.player.destroyed && 
                this.position.distanceTo(this.game.player.position) < 1) {
                this.game.player.takeDamage();
                this.destroy();
                return;
            }
        }
        
        // Destroy if out of bounds
        const mapSize = this.game.map.mapSize * this.game.map.blockSize;
        if (Math.abs(this.position.x) > mapSize/2 || 
            Math.abs(this.position.z) > mapSize/2) {
            this.destroy();
        }
    }

    destroy() {
        this.destroyed = true;
        this.scene.remove(this.mesh);
    }
}