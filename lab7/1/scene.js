import { createCanabolaProgram } from './canabola.js';

// Глобальные переменные
let gl, canvas;
let camera, controls;
let program;
let vertexBuffer;
let segments = 2000;

export function initWebGLScene() {
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    gl = canvas.getContext('webgl');

    
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableZoom = true;
    controls.enablePan = true;

    setupWebGL();
    
    program = createCanabolaProgram(gl);
    
    setupVertexBuffer();
    
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
    
    animate();
}

function setupWebGL() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
}

function setupVertexBuffer() {

    const positions = new Float32Array((segments + 1) * 3);
    
    for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * Math.PI * 2;
        positions[i * 3] = x;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
    }
    
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function onWindowResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    
    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    
    const projectionMatrix = new THREE.Matrix4()
        .multiply(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse);
    
    const projectionMatrixUniform = gl.getUniformLocation(program, 'projectionMatrix');
    gl.uniformMatrix4fv(projectionMatrixUniform, false, projectionMatrix.elements);
    
    gl.drawArrays(gl.LINE_STRIP, 0, segments + 1);
}