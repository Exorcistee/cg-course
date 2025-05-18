export function createCanabolaProgram(gl) {
    // Вершинный шейдер
    const vertexShaderSource = `
        attribute vec3 position;
        uniform mat4 projectionMatrix;
        uniform float u_time;
        
        float canabolaR(float x) {
            return (1.0 + sin(x)) * 
                   (1.0 + 0.9 * cos(8.0 * x)) * 
                   (1.0 + 0.1 * cos(24.0 * x)) * 
                   (0.5 + 0.05 * cos(140.0 * x));
        }
        
        void main() {
            float x = position.x;
            float R = canabolaR(x + u_time * 0.1);
            float x_new = R * cos(x);
            float y_new = R * sin(x);
            
            gl_Position = projectionMatrix * vec4(x_new, y_new, 0.0, 1.0);
        }
    `;
    
    // Фрагментный шейдер
    const fragmentShaderSource = `
        precision mediump float;
        
        void main() {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        }
    `;
    
    // Компиляция шейдеров
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    // Создание программы
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Ошибка линковки программы:', gl.getProgramInfoLog(program));
        return null;
    }
    
    return program;
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Ошибка компиляции шейдера:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}