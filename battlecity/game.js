import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/GLTFLoader.js';
import { Map } from './map.js';
import { PlayerTank } from './tank.js';
import { EnemyTank } from './enemy.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.map = null;
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.enemyCount = 20;
        this.lives = 3;
        this.gameOver = false;
        this.levelCompleted = false;
        this.models = {};
    }

    async loadAssets() {
        const loader = new GLTFLoader();
        
        try {
            const gltf = await loader.loadAsync('tank.glb');
            
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    this.models[child.name] = child.clone();
                    console.log(child.name);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error loading models:', error);
            return false;
        }
    }

    async init() {
        const loaded = await this.loadAssets();
        if (!loaded) return;
        
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.setupMap();
        this.setupPlayer();
        this.setupEventListeners();
        
        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 30, 30);
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    setupMap() {
        this.map = new Map(this.scene);
        this.map.generate();
    }

    async setupPlayer() {
        const spawnPoint = this.map.generate(this.currentLevel);
        this.player = new PlayerTank(this.scene, this);
        await this.player.loadModel(); 
        this.player.spawn(spawnPoint.x, spawnPoint.z);
    }


    spawnEnemy() {
        if (this.enemies.length < 5 && this.enemyCount > 0) {
            const enemy = new EnemyTank(this.scene, this);
            enemy.loadModel().then(() => {
                enemy.spawn();
                this.enemies.push(enemy);
                this.enemyCount--;
                document.getElementById('enemies').textContent = `Enemies: ${this.enemyCount}`;
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        setInterval(() => this.spawnEnemy(), 3000);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onKeyDown(event) {
        if (this.player) {
            this.player.handleKeyDown(event);
        }
    }

    onKeyUp(event) {
        if (this.player) {
            this.player.handleKeyUp(event);
        }
    }

    update() {
        if (this.controls) this.controls.update();
        
        if (this.player) this.player.update();
        
        this.enemies.forEach(enemy => enemy.update());
        this.projectiles.forEach(projectile => projectile.update());
        
        this.projectiles = this.projectiles.filter(p => !p.destroyed);
        
        const destroyedEnemies = this.enemies.filter(e => e.destroyed);
        this.enemies = this.enemies.filter(e => !e.destroyed);
        
        if (this.enemyCount === 0 && this.enemies.length === 0 && !this.levelCompleted) {
            this.levelCompleted = true;
            alert('Level completed!');
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}