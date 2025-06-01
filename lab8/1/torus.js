import { Vector3 } from './vector3.js';
import { Matrix4 } from './matrix4.js';

export class Torus {
    constructor(center = new Vector3(), majorRadius = 1, minorRadius = 0.3, material, color = [1, 1, 1]) {
        this.originalCenter = center; 
        this.majorRadius = majorRadius;
        this.minorRadius = minorRadius;
        this.material = material;
        this.color = color;
        this.transform = new Matrix4().identity();
        this.inverseTransform = new Matrix4().identity();
        
        // Учитываем центр в начальной трансформации
        this.transform.translate(center.x, center.y, center.z);
        this.inverseTransform = this.transform.inverse();
    }

    applyTransform(matrix) {
        // Создаем новую матрицу трансформации с учетом центра
        const newTransform = new Matrix4().copy(matrix);
        newTransform.multiply(this.transform);
        this.transform = newTransform;
        this.inverseTransform = this.transform.inverse();
        return this;
    }

    intersect(ray) {
        // Преобразуем луч в локальные координаты тора (уже учитывает центр)
        const localOrigin = this.inverseTransform.transformPoint(ray.origin);
        const localDirection = this.inverseTransform.transformDirection(ray.direction).normalize();

        // Коэффициенты уравнения 4-й степени для тора
        const R = this.majorRadius;
        const r = this.minorRadius;
        const oc = localOrigin;
        const d = localDirection;
        
        const ocDotD = oc.dot(d);
        const ocDotOc = oc.dot(oc);
        const dDotD = d.dot(d);
        const R2 = R * R;
        const r2 = r * r;
        
        const a = dDotD * dDotD;
        const b = 4 * dDotD * ocDotD;
        const c = 2 * dDotD * (ocDotOc - R2 - r2) + 4 * ocDotD * ocDotD + 4 * R2 * d.y * d.y;
        const dd = 4 * (ocDotOc - R2 - r2) * ocDotD + 8 * R2 * oc.y * d.y;
        const e = (ocDotOc - R2 - r2) * (ocDotOc - R2 - r2) - 4 * R2 * (r2 - oc.y * oc.y);

        // Решаем уравнение 4-й степени
        const roots = this.solveQuartic(a, b, c, dd, e);
        
        // Находим ближайшее положительное пересечение
        let closestT = Infinity;
        for (const t of roots) {
            if (t > 0 && t < closestT) {
                closestT = t;
            }
        }

        if (closestT === Infinity) return null;

        // Вычисляем точку пересечения и нормаль
        const localPoint = localOrigin.add(localDirection.multiply(closestT));
        const worldPoint = this.transform.transformPoint(localPoint);
        
        // Нормаль в локальных координатах
        const localNormal = this.computeLocalNormal(localPoint);
        
        // Преобразуем нормаль в мировые координаты
        const worldNormal = this.inverseTransform.transpose().transformDirection(localNormal).normalize();

        return {
            t: closestT,
            point: worldPoint,
            normal: worldNormal,
            object: this
        };
    }

    computeLocalNormal(p) {
        const xzLen = Math.sqrt(p.x * p.x + p.z * p.z);
        const factor = 1.0 - this.majorRadius / xzLen;
        
        return new Vector3(
            p.x * factor,
            p.y,
            p.z * factor
        ).normalize();
    }

    solveQuartic(a, b, c, d, e) {
        // Реализация метода Феррари для решения уравнения 4-й степени
        const roots = [];
        
        // Приводим уравнение к виду x⁴ + ax³ + bx² + cx + d = 0
        const a1 = b / a;
        const b1 = c / a;
        const c1 = d / a;
        const d1 = e / a;
        
        // Решаем кубическую резольвенту
        const p = b1 - (3*a1*a1)/8;
        const q = c1 + (a1*a1*a1)/8 - (a1*b1)/2;
        const r = d1 - (3*a1*a1*a1*a1)/256 + (a1*a1*b1)/16 - (a1*c1)/4;
        
        // Кубическое уравнение для y: y³ + (5p/2)y² + (2p² - r)y + (p³/2 - pr/2 - q²/8) = 0
        const cubicA = 5*p/2;
        const cubicB = 2*p*p - r;
        const cubicC = (p*p*p)/2 - (p*r)/2 - (q*q)/8;
        
        const cubicRoots = this.solveCubic(1, cubicA, cubicB, cubicC);
        const y = cubicRoots[0]; // Берем первый действительный корень
        
        const sqrt2yPlusP = Math.sqrt(2*y + p);
        const sqrtTerm = Math.sqrt(-(3*p + 2*y + 2*q/sqrt2yPlusP));
        const sqrtTerm2 = Math.sqrt(-(3*p + 2*y - 2*q/sqrt2yPlusP));
        
        roots.push((-a1/4) + (sqrt2yPlusP + sqrtTerm)/2);
        roots.push((-a1/4) + (sqrt2yPlusP - sqrtTerm)/2);
        roots.push((-a1/4) + (-sqrt2yPlusP + sqrtTerm2)/2);
        roots.push((-a1/4) + (-sqrt2yPlusP - sqrtTerm2)/2);
        
        // Фильтруем действительные корни
        const realRoots = roots.filter(root => !isNaN(root) && isFinite(root));
        return realRoots;
    }

    solveCubic(a, b, c, d) {
        // Решение кубического уравнения по формуле Кардано
        const roots = [];
        
        const f = ((3*c/a) - (b*b/(a*a)))/3;
        const g = ((2*b*b*b/(a*a*a)) - (9*b*c/(a*a)) + (27*d/a))/27;
        const h = (g*g/4) + (f*f*f/27);
        
        if (h > 0) {
            // Один действительный корень
            const R = -(g/2) + Math.sqrt(h);
            const S = Math.cbrt(R);
            const T = -(g/2) - Math.sqrt(h);
            const U = Math.cbrt(T);
            
            roots.push((S + U) - (b/(3*a)));
        } else {
            // Три действительных корня
            const i = Math.sqrt((g*g/4) - h);
            const j = Math.cbrt(i);
            
            const k = Math.acos(-(g/(2*i)));
            const L = -j;
            const M = Math.cos(k/3);
            const N = Math.sqrt(3)*Math.sin(k/3);
            const P = -(b/(3*a));
            
            roots.push(2*j*Math.cos(k/3) - (b/(3*a)));
            roots.push(L*(M + N) + P);
            roots.push(L*(M - N) + P);
        }
        
        return roots;
    }
}