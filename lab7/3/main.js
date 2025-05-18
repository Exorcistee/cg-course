class MorphingApp {
    constructor() {
        this.canvas = document.getElementById('glCanvas');
        this.gl = this.canvas.getContext('webgl');
        this.morphProgress = 0;
        this.morphDirection = 1;
        
        this.init();
    }

    init() {

        if (!this.gl) {
            alert('WebGL not supported');
            return;
        }

        this.shaderProgram = initShaderProgram(
            this.gl, 
            vertexShaderSource, 
            fragmentShaderSource
        );

        this.uniforms = {
            uModelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
            uProjectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
            uMorphProgress: this.gl.getUniformLocation(this.shaderProgram, 'uMorphProgress')
        };

        const geometry = new MorphGeometry();
        
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(geometry.positions), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), this.gl.STATIC_DRAW);
        this.indexCount = geometry.indices.length;

        this.cameraController = new CameraController(this.canvas);

        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();

        this.animate();
    }

    onResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.cameraController.onResize(this.canvas.width, this.canvas.height);
    }

    render() {
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.morphProgress += 0.002 * this.morphDirection;
        if (this.morphProgress >= 1.0 || this.morphProgress <= 0.0) {
            this.morphDirection *= -1;
        }

        this.gl.useProgram(this.shaderProgram);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        const positionLocation = this.gl.getAttribLocation(this.shaderProgram, 'aPosition');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.gl.uniformMatrix4fv(
            this.uniforms.uProjectionMatrix,
            false,
            this.cameraController.projectionMatrix
        );

        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, this.cameraController.viewMatrix, modelViewMatrix);
        this.gl.uniformMatrix4fv(
            this.uniforms.uModelViewMatrix,
            false,
            modelViewMatrix
        );

        this.gl.uniform1f(this.uniforms.uMorphProgress, this.morphProgress);

        this.gl.drawElements(
            this.gl.TRIANGLES,
            this.indexCount,
            this.gl.UNSIGNED_SHORT,
            0
        );
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.cameraController.update();
        this.render();
    }
}

window.onload = () => new MorphingApp();