class CameraController {
    constructor(canvas) {
        this.camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.1, 1000);
        this.camera.position.z = 5;
        this.controls = new THREE.OrbitControls(this.camera, canvas);
    }

    update() {
        this.controls.update();
    }

    get viewMatrix() {
        const view = new Float32Array(16);
        this.camera.matrixWorldInverse.toArray(view);
        return view;
    }

    get projectionMatrix() {
        const proj = new Float32Array(16);
        this.camera.projectionMatrix.toArray(proj);
        return proj;
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}