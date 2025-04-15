import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import { Cottage } from '../objects/Cottage.js';
import { Garage } from '../objects/Garage.js';
import { Fence } from '../objects/Fence.js';
import { Porch } from '../objects/Porch.js';
import { Tree } from '../objects/Tree.js';

export class CottageScene {
    constructor() {
        this.initScene();
        this.loadSkybox();
        this.createObjects();
        this.setupControls();
        this.animate();
    }

    async loadSkybox() {
        const textureLoader = new THREE.TextureLoader();
        const skyTexture = await new Promise((resolve) => {
            textureLoader.load(
                'https://threejs.org/examples/textures/skybox/clouds.jpg', 
                resolve
            );
        });
        
        skyTexture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = skyTexture;
        this.scene.environment = skyTexture; 
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10, 10, 15);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.setupLighting();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        const sunlight = new THREE.DirectionalLight(0xffffff, 1);
        sunlight.position.set(10, 20, 10);
        sunlight.castShadow = true;
        sunlight.shadow.mapSize.width = 2048;
        sunlight.shadow.mapSize.height = 2048;
        this.scene.add(sunlight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    createObjects() {

        this.cottage = new Cottage();
        this.cottage.mesh.position.set(-3, 0, 0);
        this.scene.add(this.cottage.mesh);

        this.garage = new Garage();
        this.garage.mesh.position.set(5, 0, -2);
        this.scene.add(this.garage.mesh);

        this.fence = new Fence(15, 20);
        this.scene.add(this.fence.mesh);
        this.porch = new Porch();
        this.porch.mesh.position.set(-3, 0, 2.5);
        this.scene.add(this.porch.mesh);
        this.addTrees();
    }

    addTrees() {
        const tree1 = new Tree();
        tree1.mesh.position.set(-8, 0, -8);
        this.scene.add(tree1.mesh);

        const tree2 = new Tree();
        tree2.mesh.position.set(8, 0, 8);
        this.scene.add(tree2.mesh);

        const tree3 = new Tree();
        tree3.mesh.position.set(10, 0, -5);
        this.scene.add(tree3.mesh);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}