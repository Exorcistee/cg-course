class MorphGeometry {
    constructor(segments = 64) {
        this.segments = segments;
        this.positions = [];
        this.indices = [];
        this.generate();
    }

    generate() {
        const step = 1.0 / this.segments;
        
        for (let y = 0; y <= this.segments; y++) {
            for (let x = 0; x <= this.segments; x++) {
                this.positions.push(x * step, y * step);
                
                if (x < this.segments && y < this.segments) {
                    const a = y * (this.segments + 1) + x;
                    const b = a + 1;
                    const c = a + this.segments + 1;
                    const d = c + 1;
                    
                    this.indices.push(a, b, c);
                    this.indices.push(b, d, c);
                }
            }
        }
    }
}