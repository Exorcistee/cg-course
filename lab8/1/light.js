import { Vector3 } from './vector3.js';

export class Light {
    constructor(position = new Vector3(0, 0, 5), 
                diffuse = [1, 1, 1], 
                specular = [1, 1, 1], 
                ambient = [0.2, 0.2, 0.2]) {
        this.position = position;
        this.diffuse = diffuse;
        this.specular = specular;
        this.ambient = ambient;
    }
}