import { Vector3 } from './vector3.js';

export class Ray {
    constructor(origin = new Vector3(), direction = new Vector3()) {
        this.origin = origin;
        this.direction = direction.normalize();
    }

    at(t) {
        return this.origin.add(this.direction.multiply(t));
    }
}