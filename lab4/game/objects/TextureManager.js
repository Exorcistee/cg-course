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
                    if (loaded === total) onComplete(textures);
                },
                undefined,
                (error) => {
                    console.error('Error loading texture:', path, error);
                    loaded++;
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
        
        return new THREE.CanvasTexture(canvas);
    }

}