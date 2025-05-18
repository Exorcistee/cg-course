class MandelbrotFractal {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        if (!this.gl) {
            alert('WebGL не поддерживается в вашем браузере!');
            return;
        }

        this.uniforms = {
            u_resolution: [canvas.width, canvas.height],
            u_offset: [-0.5, 0.0],
            u_zoom: 1.0,
            u_maxIterations: 100,
            u_escapeRadius: 4.0
        };

        this.zoomLevel = 1;
        this.initShaders();
        this.initBuffers();
        this.setupControls();
        this.render();

        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    }

    initShaders() {
        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_offset;
    uniform float u_zoom;
    uniform int u_maxIterations;
    uniform float u_escapeRadius;
    
    vec3 getColor(int iterations, vec2 z) {
        if (iterations == u_maxIterations) return vec3(0.0);
        
        float t = float(iterations) + 1.0 - log(log(length(z)))/log(2.0);
        t = sqrt(t / float(u_maxIterations));
        
        // Заменяем массив на условные выражения
        vec3 color0 = vec3(0.0, 0.0, 0.5);
        vec3 color1 = vec3(0.0, 0.0, 1.0);
        vec3 color2 = vec3(0.0, 0.5, 1.0);
        vec3 color3 = vec3(1.0, 1.0, 0.0);
        vec3 color4 = vec3(1.0, 0.5, 0.0);
        vec3 color5 = vec3(1.0, 0.0, 0.0);
        
        float index = t * 5.0;
        float f = fract(index);
        
        if (index < 1.0) return mix(color0, color1, f);
        else if (index < 2.0) return mix(color1, color2, f);
        else if (index < 3.0) return mix(color2, color3, f);
        else if (index < 4.0) return mix(color3, color4, f);
        else return mix(color4, color5, f);
    }
    
    void main() {
        float aspect = u_resolution.x / u_resolution.y;
        vec2 c = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
        c.x *= aspect;
        c = c / u_zoom - u_offset;
        
        vec2 z = vec2(0.0);
        int iterations = 0;
        
        for(int i = 0; i < 1000; i++) {
            if (i >= u_maxIterations) break;
            
            z = vec2(
                z.x * z.x - z.y * z.y + c.x,
                2.0 * z.x * z.y + c.y
            );
            
            if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
                iterations = i;
                break;
            }
        }
        
        gl_FragColor = vec4(getColor(iterations, z), 1.0);
    }
`;

        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.gl.useProgram(this.program);

        // Получаем локации uniform-переменных
        this.uniformLocations = {
            u_resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            u_offset: this.gl.getUniformLocation(this.program, 'u_offset'),
            u_zoom: this.gl.getUniformLocation(this.program, 'u_zoom'),
            u_maxIterations: this.gl.getUniformLocation(this.program, 'u_maxIterations'),
            u_escapeRadius: this.gl.getUniformLocation(this.program, 'u_escapeRadius')
        };
    }

    createProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);

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

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Ошибка компиляции шейдера: ${gl.getShaderInfoLog(shader)}`);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initBuffers() {
        const gl = this.gl;
        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            const moveSpeed = 0.1 / this.uniforms.u_zoom;
            const zoomFactor = 1.2;

            switch(e.key) {
                case 'ArrowUp':
                    this.uniforms.u_offset[1] -= moveSpeed;
                    break;
                case 'ArrowDown':
                    this.uniforms.u_offset[1] += moveSpeed;
                    break;
                case 'ArrowLeft':
                    this.uniforms.u_offset[0] += moveSpeed;
                    break;
                case 'ArrowRight':
                    this.uniforms.u_offset[0] -= moveSpeed;
                    break;
                case 'PageUp':
                    if (this.uniforms.u_zoom < 1e15) {
                        this.uniforms.u_zoom *= zoomFactor;
                        this.zoomLevel *= zoomFactor;
                        this.uniforms.u_maxIterations = Math.min(1000, 100 + Math.floor(Math.log2(this.zoomLevel) * 50));
                    }
                    break;
                case 'PageDown':
                    this.uniforms.u_zoom /= zoomFactor;
                    this.zoomLevel /= zoomFactor;
                    this.uniforms.u_maxIterations = Math.min(1000, 100 + Math.floor(Math.log2(this.zoomLevel) * 50));
                    break;
                default:
                    return;
            }

            this.render();
        });
    }

    render() {
        const gl = this.gl;
        
        // Устанавливаем uniform-переменные
        gl.uniform2fv(this.uniformLocations.u_resolution, this.uniforms.u_resolution);
        gl.uniform2fv(this.uniformLocations.u_offset, this.uniforms.u_offset);
        gl.uniform1f(this.uniformLocations.u_zoom, this.uniforms.u_zoom);
        gl.uniform1i(this.uniformLocations.u_maxIterations, this.uniforms.u_maxIterations);
        gl.uniform1f(this.uniformLocations.u_escapeRadius, this.uniforms.u_escapeRadius);

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    onResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.uniforms.u_resolution = [this.canvas.width, this.canvas.height];
        this.render();
    }
}

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    const canvas = document.getElementById('fractalCanvas');
    new MandelbrotFractal(canvas);
});