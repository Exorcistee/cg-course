import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { ChessBoard } from './ChessBoard.js';
import { ChessGame } from './ChessGame.js';

export class ChessScene {
    constructor() {
        // Основные компоненты Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Игровые компоненты
        this.chessBoard = null;
        this.game = null;
        this.controls = null;
        
        // Инициализация
        this.initRenderer();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();
    }

    async init() {
        // Создаем и загружаем доску
        this.chessBoard = new ChessBoard();
        await this.chessBoard.load();
        this.scene.add(this.chessBoard.mesh);
        
        // Создаем игровую логику
        this.game = new ChessGame(this);
        
        // Позиционируем камеру
        this.camera.position.set(0, 15, 20);
        this.camera.lookAt(0, 0, 0);
    }

    initRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
        this.scene.add(hemisphereLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI * 0.9;
        this.controls.minPolarAngle = Math.PI * 0.2;
    }

    setupEventListeners() {
        document.getElementById('startBtn')?.addEventListener('click', () => this.game?.start());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.game?.reset());
    }

    render() {
        this.controls?.update();
        this.renderer.render(this.scene, this.camera);
    }
}