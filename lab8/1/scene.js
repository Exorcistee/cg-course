import { Sphere } from './sphere.js';
import { Vector3 } from './vector3.js';

export class Scene {
    constructor() {
        this.objects = [];
        this.lights = [];
    }

    add(object) {
        this.objects.push(object);
    }

    addLight(light) {
        this.lights.push(light);
    }

    intersect(ray) {
        let closestIntersection = null;
        
        for (const object of this.objects) {
            const intersection = object.intersect(ray);
            if (intersection && (!closestIntersection || intersection.t < closestIntersection.t)) {
                closestIntersection = intersection;
            }
        }
        
        return closestIntersection;
    }
}