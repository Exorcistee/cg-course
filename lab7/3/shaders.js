const vertexShaderSource = `
    attribute vec2 aPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform float uMorphProgress;
    
    varying vec3 vNormal;

    vec3 sphereTransform(vec2 pos) {
        float theta = pos.x * 2.0 * 3.1415926;
        float phi = (pos.y - 0.5) * 3.1415926;
        return vec3(cos(theta)*cos(phi), sin(theta)*cos(phi), sin(phi));
    }

    vec3 torusTransform(vec2 pos) {
        float R = 1.0;
        float r = 0.4;
        float u = pos.x * 2.0 * 3.1415926;
        float v = pos.y * 2.0 * 3.1415926;
        return vec3(
            (R + r*cos(v))*cos(u),
            (R + r*cos(v))*sin(u),
            r*sin(v)
        );
    }

    void main() {
        vec3 spherePos = sphereTransform(aPosition);
        vec3 torusPos = torusTransform(aPosition);
        vec3 morphedPos = mix(spherePos, torusPos, uMorphProgress);
        
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(morphedPos, 1.0);
        
        vNormal = normalize(morphedPos);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vNormal;
    
    void main() {
        vec3 lightDir = normalize(vec3(0.5, 0.7, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 color = vec3(1.0) * (diff + 0.3);
        
        gl_FragColor = vec4(color, 1.0);
    }
`;