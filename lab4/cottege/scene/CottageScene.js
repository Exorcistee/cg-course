import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { Cottage } from '../objects/Cottage.js';
import { Garage } from '../objects/Garage.js';
import { Fence } from '../objects/Fence.js';
import { Porch } from '../objects/Porch.js';
import { Tree } from '../objects/Tree.js';
import { Ground } from '../objects/Ground.js';
import { StreetLight } from '../objects/StreetLight.js';

export class CottageScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.initScene();
        this.initControls();
        this.createObjects();
        this.animate();
        this.createNightSky();
        this.createLights();
        this.createMoon();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a); 
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(15, 15, 20);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;
        document.body.appendChild(this.renderer.domElement);
        
        this.setupNightLighting();
    }

    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI * 0.9; 
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50;
    }

    setupNightLighting() {
        const moonlight = new THREE.DirectionalLight(0xc2d1ff, 0.5);
        moonlight.position.set(-15, 25, -15); 
        moonlight.castShadow = true;
        
        moonlight.shadow.mapSize.width = 4096;
        moonlight.shadow.mapSize.height = 4096;
        
        moonlight.shadow.camera.near = 0.5;
        moonlight.shadow.camera.far = 100;
        moonlight.shadow.camera.left = -30;
        moonlight.shadow.camera.right = 30;
        moonlight.shadow.camera.top = 30;
        moonlight.shadow.camera.bottom = -30;
        
        this.scene.add(moonlight);
    
        const ambientLight = new THREE.AmbientLight(0x404080, 0.1);
        this.scene.add(ambientLight);
        
        this.moonlight = moonlight;
    }

    createNightSky() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.8
        });

        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    createObjects() {

        this.ground = new Ground(40, 40);
        this.scene.add(this.ground.mesh);

        this.cottage = new Cottage();
        this.cottage.mesh.position.set(0, 0, 0);
        this.scene.add(this.cottage.mesh);

        this.garage = new Garage();
        this.garage.mesh.position.set(
            this.cottage.width/2 + this.garage.width/2,
            0,                                           
            -this.cottage.depth/2 + this.garage.depth/2 
        );
        this.scene.add(this.garage.mesh);

        this.fence = new Fence(35, 35);
        this.scene.add(this.fence.mesh);

        this.porch = new Porch();
        this.porch.mesh.position.set(0, 0, 5);
        this.scene.add(this.porch.mesh);

        this.addTrees();
    }

    createLights() {

        const lightPositions = [
            [-15, 0, 5],
            [15, 0, 5],
        ];

        this.streetLights = [];
        
        lightPositions.forEach(pos => {
            const light = new StreetLight();
            light.mesh.position.set(pos[0], 0, pos[2]);
            light.getLight().position.set(pos[0], light.height - 0.8, pos[2]);
            light.getLight().shadow.mapSize.width = 512;
            light.getLight().shadow.mapSize.height = 512;
            light.getLight().distance = 15;
            light.getLight().intensity = 1.5; 
            light.getLight().color.setHex(0xffeedd); 
            
            this.scene.add(light.mesh);
            this.scene.add(light.getLight());
            this.streetLights.push(light);
        });
    }

    createMoon() {

        const moonGeometry = new THREE.SphereGeometry(3, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: 0xf0f0ff
        });
        
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(-30, 30, -50);
        this.scene.add(moon);

        const moonLight = new THREE.PointLight(0xc2d1ff, 0.5, 100);
        moonLight.position.set(-30, 30, -50);
        this.scene.add(moonLight);
    }

    addTrees() {
        const treePositions = [
            [-15, 0, -15],
            [-15, 0, 15],
            [15, 0, -15],
            [15, 0, 15]
        ];
        
        treePositions.forEach(pos => {
            const tree = new Tree();
            tree.mesh.position.set(...pos);
            this.scene.add(tree.mesh);
        });
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        if (this.stars) {
            const positions = this.stars.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                if (Math.random() < 0.001) {
                    positions[i + 1] = (Math.random() - 0.5) * 20000;
                }
            }
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}