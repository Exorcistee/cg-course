import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import { Cottage } from '../objects/Cottage.js';
import { Garage } from '../objects/garage.js';
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
        this.createLights();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(15, 15, 20);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        document.body.appendChild(this.renderer.domElement);
        
        this.setupLighting();
    }

    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI * 0.9; // Ограничиваем угол обзора
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50;
    }

    setupLighting() {
        const sunlight = new THREE.DirectionalLight(0xffffff, 1);
        sunlight.position.set(15, 25, 15);
        sunlight.castShadow = true;
        sunlight.shadow.mapSize.width = 2048;
        sunlight.shadow.mapSize.height = 2048;
        this.scene.add(sunlight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
    }

    createObjects() {
        // Земля 40x40 метров
        this.ground = new Ground(40, 40);
        this.scene.add(this.ground.mesh);

        // Большой коттедж
        this.cottage = new Cottage();
        this.cottage.mesh.position.set(0, 0, 0);
        this.scene.add(this.cottage.mesh);

        // Гараж, прилегающий к дому
        this.garage = new Garage();
        this.scene.add(this.garage.mesh);

        // Забор по периметру
        this.fence = new Fence(35, 35);
        this.scene.add(this.fence.mesh);

        // Крыльцо
        this.porch = new Porch();
        this.porch.mesh.position.set(0, 0, 5);
        this.scene.add(this.porch.mesh);

        // Деревья
        this.addTrees();
    }

    createLights() {

        const lightPositions = [
            [-8, 0, -10],
            [8, 0, -10],
            [-12, 0, 5],
            [12, 0, 5],
            [0, 0, 15]
        ];

        this.streetLights = [];
        
        lightPositions.forEach(pos => {
            const light = new StreetLight();
            light.mesh.position.set(pos[0], 0, pos[2]);
            light.getLight().position.set(pos[0], light.height - 0.8, pos[2]);
            light.getLight().shadow.mapSize.width = 512;
            light.getLight().shadow.mapSize.height = 512;
            light.getLight().distance = 15;    
            this.scene.add(light.mesh);
            this.scene.add(light.getLight());
            
            this.streetLights.push(light);
        });
    }

    addTrees() {
        const treePositions = [
            [-15, 0, -15],
            [15, 0, 15],
            [18, 0, -10],
            [-18, 0, 10]
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
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}