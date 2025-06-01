import { Vector3 } from './vector3.js';

export class AreaLight {
    constructor(position = new Vector3(0, 5, 0), size = 1, samples = 16) {
        this.position = position;
        this.size = size;
        this.samples = samples;
        this.diffuse = [1, 1, 1];
        this.specular = [1, 1, 1];
        this.ambient = [0.1, 0.1, 0.1];
    }

    getSamplePoints() {
        const points = [];
        const halfSize = this.size / 2;
        
        for (let i = 0; i < this.samples; i++) {

            const u = Math.random();
            const v = Math.random();
            
            const x = this.position.x + (u - 0.5) * this.size;
            const y = this.position.y;
            const z = this.position.z + (v - 0.5) * this.size;
            
            points.push(new Vector3(x, y, z));
        }
        
        return points;
    }
}