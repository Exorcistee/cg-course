export class TextureManager {
    static loadImages(imagePaths, onProgress, onComplete) {
        const textures = {};
        let loaded = 0;
        const total = imagePaths.length;

        imagePaths.forEach(path => {
            const loader = new THREE.TextureLoader();
            loader.load(
                path,
                (texture) => {
                    textures[path] = texture;
                    loaded++;
                    onProgress(Math.round((loaded / total) * 100));
                    if (loaded === total) onComplete(textures);
                },
                undefined,
                (error) => {
                    console.error('Error loading texture:', path, error);
                    loaded++;
                    onProgress(Math.round((loaded / total) * 100));
                    if (loaded === total) onComplete(textures);
                }
            );
        });
    }

    static createTexturesFromImages(images) {
        const textures = {};
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        for (const path in images) {
            const img = images[path];
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            textures[path] = new THREE.CanvasTexture(canvas);
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

    static createHighlightTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(
            128, 128, 0,
            128, 128, 128
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        return new THREE.CanvasTexture(canvas);
    }

}