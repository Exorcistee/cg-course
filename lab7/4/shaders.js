const vertexShader = `
    attribute vec2 position;
    varying vec2 vUv;

    void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 center;
    uniform float zoom;
    uniform vec2 resolution;

    vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.0, 0.10, 0.20);
        return a + b * cos(6.28318 * (c * t + d));
    }

    void main() {
        vec2 c = (vUv - 0.5) * 4.0 * vec2(resolution.x/resolution.y, 1.0);
        c = c / zoom + center;
        
        vec2 z = vec2(0.0);
        float iterations = 0.0;
        const float max_iterations = 100.0;
        
        for(float i = 0.0; i < max_iterations; i++) {
            z = vec2(
                z.x * z.x - z.y * z.y + c.x,
                2.0 * z.x * z.y + c.y
            );
            
            if(dot(z, z) > 4.0) break;
            iterations++;
        }
        
        float color = iterations / max_iterations;
        gl_FragColor = vec4(palette(color), 1.0);
    }
`;