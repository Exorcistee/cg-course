export class Material {
    constructor(diffuse, specular, ambient, shininess) {
        this.diffuse = diffuse || [1, 1, 1];
        this.specular = specular || [1, 1, 1];
        this.ambient = ambient || [0.1, 0.1, 0.1];
        this.shininess = shininess || 32;
    }
}