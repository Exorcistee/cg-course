import { Vector3 } from './vector3.js';

export class Matrix4 {
    constructor() {
        this.elements = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    identity() {
        this.elements.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }

    multiply(m) {
        const result = new Matrix4();
        const a = this.elements;
        const b = m.elements;
        const r = result.elements;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                r[i*4+j] = 0;
                for (let k = 0; k < 4; k++) {
                    r[i*4+j] += a[i*4+k] * b[k*4+j];
                }
            }
        }

        this.elements.set(r);
        return this;
    }

    translate(x, y, z) {
        const translation = new Matrix4();
        translation.elements.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
        return this.multiply(translation);
    }

    scale(x, y, z) {
        const scaling = new Matrix4();
        scaling.elements.set([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
        return this.multiply(scaling);
    }

    rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotation = new Matrix4();
        rotation.elements.set([
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        ]);
        return this.multiply(rotation);
    }

    rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotation = new Matrix4();
        rotation.elements.set([
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        ]);
        return this.multiply(rotation);
    }

    rotateZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotation = new Matrix4();
        rotation.elements.set([
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this.multiply(rotation);
    }

    inverse() {
        const inv = new Matrix4();
        const m = this.elements;

        // Вычисление обратной матрицы (упрощенное для аффинных преобразований)
        const det = m[0] * (m[5]*m[10] - m[6]*m[9]) 
                  - m[1] * (m[4]*m[10] - m[6]*m[8]) 
                  + m[2] * (m[4]*m[9] - m[5]*m[8]);

        if (det === 0) return this.identity();

        const invDet = 1 / det;

        inv.elements[0] = (m[5]*m[10] - m[6]*m[9]) * invDet;
        inv.elements[1] = (m[2]*m[9] - m[1]*m[10]) * invDet;
        inv.elements[2] = (m[1]*m[6] - m[2]*m[5]) * invDet;
        inv.elements[4] = (m[6]*m[8] - m[4]*m[10]) * invDet;
        inv.elements[5] = (m[0]*m[10] - m[2]*m[8]) * invDet;
        inv.elements[6] = (m[2]*m[4] - m[0]*m[6]) * invDet;
        inv.elements[8] = (m[4]*m[9] - m[5]*m[8]) * invDet;
        inv.elements[9] = (m[1]*m[8] - m[0]*m[9]) * invDet;
        inv.elements[10] = (m[0]*m[5] - m[1]*m[4]) * invDet;

        inv.elements[12] = -(m[12]*inv.elements[0] + m[13]*inv.elements[4] + m[14]*inv.elements[8]);
        inv.elements[13] = -(m[12]*inv.elements[1] + m[13]*inv.elements[5] + m[14]*inv.elements[9]);
        inv.elements[14] = -(m[12]*inv.elements[2] + m[13]*inv.elements[6] + m[14]*inv.elements[10]);

        return inv;
    }

    transpose() {
        const transposed = new Matrix4();
        const m = this.elements;
        transposed.elements.set([
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        ]);
        return transposed;
    }

    transformPoint(point) {
        const x = point.x, y = point.y, z = point.z;
        const m = this.elements;
        return new Vector3(
            m[0]*x + m[4]*y + m[8]*z + m[12],
            m[1]*x + m[5]*y + m[9]*z + m[13],
            m[2]*x + m[6]*y + m[10]*z + m[14]
        );
    }

    transformDirection(dir) {
        const x = dir.x, y = dir.y, z = dir.z;
        const m = this.elements;
        return new Vector3(
            m[0]*x + m[4]*y + m[8]*z,
            m[1]*x + m[5]*y + m[9]*z,
            m[2]*x + m[6]*y + m[10]*z
        );
    }

    copy(m) {
    for (let i = 0; i < 16; i++) {
        this.elements[i] = m.elements[i];
    }
    return this;
}
}