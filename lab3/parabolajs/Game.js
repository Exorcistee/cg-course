import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
import { createOrUpdateCamera, createAxes, createGraph } from './GameFunc.js';

export default class Game {

    constructor({ xMin, xMax, yMin, yMax, funcXMin, funcXMax }) {
      this.xMin = xMin;
      this.xMax = xMax;
      this.yMin = yMin;
      this.yMax = yMax;
      this.funcXMin = funcXMin;
      this.funcXMax = funcXMax;
  
      // Создаем сцену и рендерер
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);
      this.renderer.setClearColor(0xffffff);
      document.body.appendChild(this.renderer.domElement);
  
      // Создаем камеру с использованием функции из GameUtils.js
      this.camera = createOrUpdateCamera(
        null,
        this.xMin,
        this.xMax,
        this.yMin,
        this.yMax,
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
      );
  
      // Обработка изменения размеров окна
      window.addEventListener('resize', () => {
        this.renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);
        this.camera = createOrUpdateCamera(
          this.camera,
          this.xMin,
          this.xMax,
          this.yMin,
          this.yMax,
          document.documentElement.clientWidth,
          document.documentElement.clientHeight
        );
      });
  
      // Создаем оси и график, вызывая функции из GameUtils.js
      createAxes(this.scene, this.xMin, this.xMax, this.yMin, this.yMax, 0x00ffff);
      createGraph(this.scene, this.funcXMin, this.funcXMax);
  
      this.animate();
    }
  
    animate() {
      requestAnimationFrame(() => this.animate());
      this.renderer.render(this.scene, this.camera);
    }
  }