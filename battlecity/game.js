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
        this.enemySpawnPoints = [];
        this.enemySpawnInterval = null;
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
        const spawnData = this.map.generate();
        this.playerSpawn = spawnData.playerSpawn;
        this.enemySpawnPoints = spawnData.enemySpawns;      
        this.setupPlayer();
        this.startEnemySpawning();
        this.setupEventListeners();
        
        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 20, -10);
        this.camera.lookAt(0, 0, 0);
        this.camera.controls = false;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    setupControls() {
    }

    setupMap() {
        this.map = new Map(this.scene);
        const spawnData = this.map.generate();
        this.playerSpawn = spawnData.playerSpawn;
        this.enemySpawnPoints = spawnData.enemySpawns;
    }

    async setupPlayer() {
        this.player = new PlayerTank(this.scene, this);
        await this.player.loadModel(); 
        this.player.spawn(this.playerSpawn.x, this.playerSpawn.z);
    }


    async spawnEnemy() {
        console.log(this.enemySpawnPoints.length);
        if (this.enemySpawnPoints.length === 0 || this.enemyCount <= 0) return;
        
        const spawnIndex = Math.floor(Math.random() * this.enemySpawnPoints.length);
        const spawnPoint = this.enemySpawnPoints[spawnIndex];
        
        const isPositionFree = this.enemies.every(enemy => 
            enemy.position.distanceTo(spawnPoint) > this.map.blockSize * 1.5
        );
        
        if (!isPositionFree) return;
        
        const enemy = new EnemyTank(this.scene, this);
        try {
            await enemy.loadModel();
            enemy.spawn(spawnPoint.x, spawnPoint.z);
            this.enemies.push(enemy);
            this.enemyCount--;
            document.getElementById('enemies').textContent = `Enemies: ${this.enemyCount}`;
        } catch (error) {
            console.error("Failed to spawn enemy:", error);
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            enemy.model = new THREE.Mesh(geometry, material);
            enemy.spawn(spawnPoint.x, spawnPoint.z);
            this.enemies.push(enemy);
            this.enemyCount--;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        setInterval(() => this.spawnEnemy(), 3000 + Math.random() * 2000);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    startEnemySpawning() {
    // Спавн врагов каждые 3 секунды
    this.enemySpawnInterval = setInterval(() => {
        if (this.enemyCount > 0 && this.enemies.length < 5) {
            console.log(this.enemyCount, this.enemies.length);
            this.spawnEnemy();
        }
    }, 3000);
}

    onKeyDown(event) {
        if (this.player) {
            if (event.code === 'Space') {
                this.player.keys.Space = true;
                this.player.shoot();
            } else {
                this.player.handleKeyDown(event);
            }
        }
    }

    onKeyUp(event) {
        if (this.player) {
            this.player.handleKeyUp(event);
        }
    }

    update() {
        const deltaTime = 16; // Примерное значение deltaTime
        
        // Обновление игрока
        if (this.player && !this.player.destroyed) {
            this.player.update(deltaTime);
        }
        
        // Обновление врагов
        this.enemies.forEach(enemy => {
            if (!enemy.destroyed) {
                enemy.update(deltaTime);
            }
        });
        
        // Обновление снарядов
        this.projectiles.forEach(projectile => projectile.update());
        
        // Удаление уничтоженных объектов
        this.projectiles = this.projectiles.filter(p => !p.destroyed);
        this.enemies = this.enemies.filter(e => !e.destroyed);
        
        // Проверка завершения уровня
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