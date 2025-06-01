export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const len = this.length();
        return new Vector3(this.x / len, this.y / len, this.z / len);
    }

    reflect(normal) {
        const dot = this.dot(normal);
        return this.subtract(normal.multiply(2 * dot));
    }
    
    getComponent(index) {
        if (index === 0) return this.x;
        if (index === 1) return this.y;
        if (index === 2) return this.z;
        throw new Error('Invalid component index');
    }

    setComponent(index, value) {
        if (index === 0) this.x = value;
        else if (index === 1) this.y = value;
        else if (index === 2) this.z = value;
        else throw new Error('Invalid component index');
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

}