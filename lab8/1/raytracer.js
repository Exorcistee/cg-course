import { Vector3 } from './vector3.js';
import { Scene } from './scene.js';
import { Sphere } from './sphere.js';
import { Plane } from './plane.js';
import { Material } from './material.js';
import { AreaLight } from './arealight.js';
import { Ray } from './ray.js';
import { Torus } from './torus.js';
import { Matrix4 } from './matrix4.js';
import { Cube } from './cube.js';

class RayTracer {
    constructor() {
        this.canvas = document.getElementById('rayCanvas');
        this.canvas.width = 1200;
        this.canvas.height = 800;
        this.ctx = this.canvas.getContext('2d');
        
        this.initScene();
        this.render();
    }

    initScene() {
        this.scene = new Scene();
        
        // Материалы
        const floorMaterial = new Material(
            [0.8, 0.8, 0.8], // diffuse
            [0.3, 0.3, 0.3], // specular
            [0.1, 0.1, 0.1], // ambient
            16               // shininess
        );
        
        // Плоскость (пол)
        this.scene.add(new Plane(
            new Vector3(0, 1, 0), // normal (направлена вверх)
            new Vector3(0, -1, 0), // position
            floorMaterial
        ));
        
        // Создаем детскую пирамидку из торов
        const colors = [
            [1.0, 0.2, 0.2], // красный
            [0.2, 1.0, 0.2], // зеленый
            [0.2, 0.2, 1.0], // синий
            [1.0, 1.0, 0.2], // желтый
            [1.0, 0.2, 1.0]  // фиолетовый
        ];
        
        const torusMaterial = new Material(
            [0.8, 0.8, 0.8], // diffuse
            [1.0, 1.0, 1.0], // specular
            [0.1, 0.1, 0.1], // ambient
            32               // shininess
        );
        
        const sphereMaterial = new Material(
            [0.8, 0.2, 0.2], // diffuse
            [1.0, 1.0, 1.0], // specular
            [0.1, 0.1, 0.1], // ambient
            32               // shininess
        );

        const ringCount = 5;
        const baseY = -0.8; // Начальная высота нижнего кольца
        const heightStep = 0.3; // Шаг по высоте между кольцами
        const sizeStep = 0.15; // Шаг уменьшения размера

        this.scene.add(new Sphere(
            new Vector3(-2, -0.4, -7), // position
            0.5,                     // radius
            sphereMaterial
        ));
        
        this.scene.add(new Sphere(
            new Vector3(3, -0.4, -7), 
            0.5, 
            sphereMaterial
        ));

        // Создаем кольца пирамидки
        for (let i = 0; i < ringCount; i++) {
            // Вычисляем параметры для текущего кольца
            const yPos = baseY + i * heightStep;
            const majorRad = 0.8 - i * sizeStep;
            const minorRad = 0.15;
            // Создаем тор (кольцо)
            const torus = new Torus(
                new Vector3(0, yPos, -5), // position (разные высоты)
                majorRad,                // majorRadius (уменьшается с высотой)
                minorRad,                // minorRadius
                torusMaterial,
                colors[i % colors.length] // циклически берем цвета
            );
            
            
            this.scene.add(torus);
        }
        
        this.scene.add(new Sphere(
            new Vector3(0, baseY + 5 * heightStep, -5), 
            0.2, 
            sphereMaterial
        ));


        const cubeMaterial = new Material(
            [0.2, 0.6, 0.9], // diffuse (голубой)
            [0.8, 0.8, 0.8], // specular
            [0.1, 0.1, 0.1], // ambient
             32               // shininess
        );

        const cube = new Cube(
            new Vector3(5, 0, -5), // позиция справа от пирамидки
            2,                   // размер (1.5 вместо 2 для разнообразия)
            cubeMaterial
        );


    this.scene.add(cube);

        // Источник света
        this.scene.addLight(new AreaLight(
            new Vector3(3, 5, -4), // position
            2.0,                   // size
            16                     // samples
        ));
    }

    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;
        
        // Фиксированная позиция "камеры" (точка обзора)
        const eyePos = new Vector3(0, 1, 3);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Преобразование координат пикселя в направление луча
                const ndcX = (2 * x / width) - 1;
                const ndcY = 1 - (2 * y / height);
                
                // Фиксированное направление "взгляда"
                const lookAt = new Vector3(0, 0, -5);
                const forward = lookAt.subtract(eyePos).normalize();
                
                // Базисные векторы для плоскости изображения
                const right = new Vector3(1, 0, 0);
                const up = new Vector3(0, 1, 0);
                
                // Направление луча
                const rayDir = forward
                    .add(right.multiply(ndcX))
                    .add(up.multiply(ndcY))
                    .normalize();
                
                const ray = new Ray(eyePos, rayDir);
                const color = this.traceRay(ray);
                
                const idx = (y * width + x) * 4;
                data[idx] = color[0] * 255;
                data[idx + 1] = color[1] * 255;
                data[idx + 2] = color[2] * 255;
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    traceRay(ray, depth = 0) {
        if (depth > 3) return [0, 0, 0];

        const intersection = this.scene.intersect(ray);
        if (!intersection) return [0.3, 0.4, 0.5]; // Цвет фона (небо)

        const { point, normal, object } = intersection;
        
        // Используем цвет объекта, если он есть
        const baseColor = object.color || object.material.diffuse;
        const material = {
            diffuse: [...baseColor],
            specular: [...object.material.specular],
            ambient: [...object.material.ambient],
            shininess: object.material.shininess
        };

        const light = this.scene.lights[0];
        const lightSamples = light.getSamplePoints();
        let visibleSamples = 0;
        let totalDiffuse = [0, 0, 0];
        let totalSpecular = [0, 0, 0];

        for (const sample of lightSamples) {
            const toLight = sample.subtract(point);
            const lightDistance = toLight.length();
            const lightDir = toLight.normalize();

            // Луч для проверки тени
            const shadowRay = new Ray(
                point.add(normal.multiply(0.001)), 
                lightDir
            );

            const shadowIntersection = this.scene.intersect(shadowRay);
            if (shadowIntersection && shadowIntersection.t < lightDistance) {
                continue; // Точка света закрыта
            }

            visibleSamples++;

            // Диффузная составляющая
            const diffuseIntensity = Math.max(0, normal.dot(lightDir));
            totalDiffuse[0] += material.diffuse[0] * light.diffuse[0] * diffuseIntensity;
            totalDiffuse[1] += material.diffuse[1] * light.diffuse[1] * diffuseIntensity;
            totalDiffuse[2] += material.diffuse[2] * light.diffuse[2] * diffuseIntensity;

            // Зеркальная составляющая
            const viewDir = ray.direction.multiply(-1).normalize();
            const reflectDir = lightDir.multiply(-1).reflect(normal);
            const specAngle = Math.max(0, viewDir.dot(reflectDir));
            const specIntensity = Math.pow(specAngle, material.shininess);
            
            totalSpecular[0] += material.specular[0] * light.specular[0] * specIntensity;
            totalSpecular[1] += material.specular[1] * light.specular[1] * specIntensity;
            totalSpecular[2] += material.specular[2] * light.specular[2] * specIntensity;
        }

        // Коэффициент видимости (0..1)
        const visibility = visibleSamples / lightSamples.length;
        
        // Усредненные компоненты
        const diffuse = [
            totalDiffuse[0] / Math.max(1, visibleSamples),
            totalDiffuse[1] / Math.max(1, visibleSamples),
            totalDiffuse[2] / Math.max(1, visibleSamples)
        ];

        const specular = [
            totalSpecular[0] / Math.max(1, visibleSamples),
            totalSpecular[1] / Math.max(1, visibleSamples),
            totalSpecular[2] / Math.max(1, visibleSamples)
        ];

        // Фоновая составляющая
        const ambient = [
            material.ambient[0] * light.ambient[0],
            material.ambient[1] * light.ambient[1],
            material.ambient[2] * light.ambient[2]
        ];

        // Итоговый цвет с учетом видимости
        return [
            Math.min(1, diffuse[0] * visibility + specular[0] * visibility + ambient[0]),
            Math.min(1, diffuse[1] * visibility + specular[1] * visibility + ambient[1]),
            Math.min(1, diffuse[2] * visibility + specular[2] * visibility + ambient[2])
        ];
    }
}

// Запуск приложения
new RayTracer();