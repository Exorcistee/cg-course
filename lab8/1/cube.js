import { Vector3 } from './vector3.js';
import { Matrix4 } from './matrix4.js';

export class Cube {
    constructor(center = new Vector3(), size = 2, material, color = [1, 1, 1]) {
        this.center = center;
        this.size = size;
        this.material = material;
        this.color = color;
        this.transform = new Matrix4().identity();
        this.inverseTransform = new Matrix4().identity();
        
        // Инициализируем с учетом центра
        this.transform.translate(center.x, center.y, center.z);
        this.inverseTransform = this.transform.inverse();
    }

    applyTransform(matrix) {
        const newTransform = new Matrix4().copy(matrix);
        newTransform.multiply(this.transform);
        this.transform = newTransform;
        this.inverseTransform = this.transform.inverse();
        return this;
    }

    intersect(ray) {
        // Переводим луч в локальные координаты куба
        const localOrigin = this.inverseTransform.transformPoint(ray.origin);
        const localDirection = this.inverseTransform.transformDirection(ray.direction).normalize();

        // Размер куба (от -1 до 1 по каждой оси)
        const min = -this.size/2;
        const max = this.size/2;

        let tNear = -Infinity;
        let tFar = Infinity;
        let normal = new Vector3();

        // Проверяем пересечение с каждой парой плоскостей
        for (let i = 0; i < 3; i++) {
            if (Math.abs(localDirection.getComponent(i)) < 1e-6) {
                // Луч параллелен плоскостям
                if (localOrigin.getComponent(i) < min || localOrigin.getComponent(i) > max) {
                    return null;
                }
            } else {
                // Вычисляем точки пересечения с плоскостями
                const t1 = (min - localOrigin.getComponent(i)) / localDirection.getComponent(i);
                const t2 = (max - localOrigin.getComponent(i)) / localDirection.getComponent(i);

                let tMin = Math.min(t1, t2);
                let tMax = Math.max(t1, t2);

                if (tMin > tNear) {
                    tNear = tMin;
                    normal = new Vector3();
                    normal.setComponent(i, t1 < t2 ? -1 : 1);
                }

                if (tMax < tFar) {
                    tFar = tMax;
                }

                if (tNear > tFar || tFar < 0) {
                    return null;
                }
            }
        }

        if (tNear < 0) return null;

        // Вычисляем точку пересечения и нормаль
        const localPoint = localOrigin.add(localDirection.multiply(tNear));
        const worldPoint = this.transform.transformPoint(localPoint);
        
        // Преобразуем нормаль в мировые координаты
        const worldNormal = this.inverseTransform.transpose().transformDirection(normal).normalize();

        return {
            t: tNear,
            point: worldPoint,
            normal: worldNormal,
            object: this
        };
    }
}