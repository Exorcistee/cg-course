export class TextureManager {
    static async loadTextures(imagePaths) {
        const loader = new THREE.TextureLoader();
        const textures = [];
        
        for (const path of imagePaths) {
            const texture = await new Promise(resolve => {
                loader.load(path, resolve);
            });
            textures.push(texture);
        }
        
        return textures;
    }

    static createBackTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#4a6ea9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 20;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', canvas.width / 2, canvas.height / 2);
        
        return new THREE.CanvasTexture(canvas);
    }
}