class Torus {
    constructor(gl, program, R, r, color) {
        this.gl = gl;
        this.program = program;
        this.R = R;
        this.r = r;
        this.color = color;
        this.emissiveIntensity = 0;
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        
        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;
        const tubeRadius = this.r;
        const radialSegments = 32;
        const tubularSegments = 32;
        
        const positions = [];
        const normals = [];
        const textureCoords = [];
        const indices = [];

        for (let i = 0; i <= radialSegments; i++) {
            for (let j = 0; j <= tubularSegments; j++) {
                const u = j / tubularSegments * Math.PI * 2;
                const v = i / radialSegments * Math.PI * 2;
                
                const x = (this.R + tubeRadius * Math.cos(v)) * Math.cos(u);
                const y = (this.R + tubeRadius * Math.cos(v)) * Math.sin(u);
                const z = tubeRadius * Math.sin(v);
                
                positions.push(x, y, z);
                
                const nx = Math.cos(u) * Math.cos(v);
                const ny = Math.sin(u) * Math.cos(v);
                const nz = Math.sin(v);
                normals.push(nx, ny, nz);
                
                textureCoords.push(j / tubularSegments, i / radialSegments);
            }
        }
        
        for (let i = 0; i < radialSegments; i++) {
            for (let j = 0; j < tubularSegments; j++) {
                const a = i * (tubularSegments + 1) + j;
                const b = (i + 1) * (tubularSegments + 1) + j;
                const c = (i + 1) * (tubularSegments + 1) + j + 1;
                const d = i * (tubularSegments + 1) + j + 1;
                
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        
        this.vertexCount = indices.length;
        
        // Position buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Normal buffer
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        
        // Texture coordinate buffer
        this.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        
        // Index buffer
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }

    draw(projectionMatrix, modelViewMatrix, normalMatrix) {
        const gl = this.gl;
        
        // Set the shader program
        gl.useProgram(this.program);
        
        // Set the position buffer
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.vertexAttribPointer(
                gl.getAttribLocation(this.program, 'aVertexPosition'),
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(gl.getAttribLocation(this.program, 'aVertexPosition'));
        }
        
        // Set the normal buffer
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(
                gl.getAttribLocation(this.program, 'aVertexNormal'),
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(gl.getAttribLocation(this.program, 'aVertexNormal'));
        }
        
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
            gl.vertexAttribPointer(
                gl.getAttribLocation(this.program, 'aTextureCoord'),
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(gl.getAttribLocation(this.program, 'aTextureCoord'));
        }
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.program, 'uProjectionMatrix'),
            false,
            projectionMatrix
        );
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.program, 'uModelViewMatrix'),
            false,
            modelViewMatrix
        );
        gl.uniformMatrix3fv(
            gl.getUniformLocation(this.program, 'uNormalMatrix'),
            false,
            normalMatrix
        );
        gl.uniform3fv(
            gl.getUniformLocation(this.program, 'uColor'),
            this.color
        );
        gl.uniform1f(
            gl.getUniformLocation(this.program, 'uEmissiveIntensity'),
            this.emissiveIntensity
        );
        
        // Draw the torus
        gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}