class App {
    constructor() {
        this.canvas = document.getElementById('fractalCanvas');
        this.viewer = new FractalViewer(this.canvas);
        
        window.addEventListener('resize', () => {
            this.viewer.onResize();
        });
        this.viewer.onResize();
    }
}

new App();