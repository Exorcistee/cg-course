import { Vector3 } from './vector3.js';
import { Material } from './material.js';

export class Sphere {
    constructor(center = new Vector3(), radius = 1, material = new Material()) {
        this.center = center;
        this.radius = radius;
        this.material = material;
    }

    intersect(ray) {
        const oc = ray.origin.subtract(this.center);
        const a = ray.direction.dot(ray.direction);
        const b = 2 * oc.dot(ray.direction);
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return null;
        }

        const t = (-b - Math.sqrt(discriminant)) / (2 * a);
        if (t < 0) return null;

        const point = ray.at(t);
        const normal = point.subtract(this.center).normalize();

        return { t, point, normal, object: this };
    }
}