class USSRFlag {
    constructor() {
        this.canvas = document.getElementById('flagCanvas');
        this.gl = this.canvas.getContext('webgl');
        
        if (!this.gl) {
            alert('WebGL не поддерживается в вашем браузере!');
            return;
        }
        
        this.program = null; // Инициализируем как null
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.init().catch(error => {
            console.error('Ошибка инициализации:', error);
            alert('Произошла ошибка при инициализации. Проверьте консоль для подробностей.');
        });
    }
    
    async init() {
        await this.initShaders();
        this.initBuffers();
        this.render();
    }
    
    resizeCanvas() {
        const containerWidth = window.innerWidth * 0.8;
        const containerHeight = window.innerHeight * 0.6;
        const flagAspectRatio = 1.5;
        
        let width, height;
        
        if (containerWidth / containerHeight > flagAspectRatio) {
            height = containerHeight;
            width = height * flagAspectRatio;
        } else {
            width = containerWidth;
            height = width / flagAspectRatio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    async loadShader(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Ошибка загрузки шейдера из ${url}:`, error);
            throw error;
        }
    }
    
    async initShaders() {
        try {
            const vertexShaderSource = await this.loadShader('shaders/vertex.glsl');
            const fragmentShaderSource = await this.loadShader('shaders/fragment.glsl');
            
            this.program = this.gl.createProgram();
            
            const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
            
            if (!vertexShader || !fragmentShader) {
                throw new Error('Не удалось скомпилировать один из шейдеров');
            }
            
            this.gl.attachShader(this.program, vertexShader);
            this.gl.attachShader(this.program, fragmentShader);
            this.gl.linkProgram(this.program);
            
            if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
                const errorLog = this.gl.getProgramInfoLog(this.program);
                throw new Error(`Ошибка линковки шейдеров: ${errorLog}`);
            }
            
            this.gl.validateProgram(this.program);
            if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
                const errorLog = this.gl.getProgramInfoLog(this.program);
                throw new Error(`Программа не валидна: ${errorLog}`);
            }
            
            console.log('Шейдерная программа успешно создана и валидирована');
        } catch (error) {
            console.error('Ошибка инициализации шейдеров:', error);
            this.program = null; // Убедимся, что программа установлена в null при ошибке
            throw error;
        }
    }
    
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const errorLog = this.gl.getShaderInfoLog(shader);
            console.error(`Ошибка компиляции шейдера: ${errorLog}`);
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    initBuffers() {
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);
        
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    }
    
    render(time = 0) {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
            if (!this.program) return;
    
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    
    const resolutionLoc = this.gl.getUniformLocation(this.program, 'u_resolution');
    if (resolutionLoc) {
        this.gl.uniform2f(resolutionLoc, this.canvas.width, this.canvas.height);
    } else {
        console.warn('Uniform u_resolution не найден');
    }
    
    const timeLoc = this.gl.getUniformLocation(this.program, 'u_time');
    if (timeLoc) {
        this.gl.uniform1f(timeLoc, time * 0.001);
    }
        
        const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        if (positionAttributeLocation === -1) {
            console.error('Атрибут a_position не найден в шейдерной программе');
            return;
        }
        
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        const resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        if (resolutionUniformLocation) {
            this.gl.uniform2f(resolutionUniformLocation, this.canvas.width, this.canvas.height);
        } else {
            console.warn('Uniform u_resolution не найден в шейдерной программе');
        }
        
        // Рисуем
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame((t) => this.render(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new USSRFlag();
});