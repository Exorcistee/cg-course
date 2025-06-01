import { Vector3 } from './vector3.js';

export class Plane {
    constructor(normal, point, material) {
        this.normal = normal.normalize();
        this.point = point;
        this.material = material;
    }

    intersect(ray) {
        const denom = this.normal.dot(ray.direction);
        if (Math.abs(denom) < 1e-6) return null; // Параллелен плоскости

        const t = this.point.subtract(ray.origin).dot(this.normal) / denom;
        if (t < 0) return null; // Плоскость позади луча

        return {
            t,
            point: ray.at(t),
            normal: this.normal,
            object: this
        };
    }
}