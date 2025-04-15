import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export function createOrUpdateCamera(camera, xMin, xMax, yMin, yMax, width, height) {
  const aspect = width / height;
  const fixedWidth = xMax - xMin;
  const fixedHeight = yMax - yMin;
  let left, right, top, bottom;

  if (aspect >= fixedWidth / fixedHeight) {
    top = yMax;
    bottom = yMin;
    const newWidth = fixedHeight * aspect;
    const midX = (xMin + xMax) / 2;
    left = midX - newWidth / 2;
    right = midX + newWidth / 2;
  } else {
    left = xMin;
    right = xMax;
    const newHeight = fixedWidth / aspect;
    const midY = (yMin + yMax) / 2;
    bottom = midY - newHeight / 2;
    top = midY + newHeight / 2;
  }

  if (!camera) {
    camera = new THREE.OrthographicCamera(left, right, top, bottom, -10, 10);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  } else {
    camera.left = left;
    camera.right = right;
    camera.top = top;
    camera.bottom = bottom;
    camera.updateProjectionMatrix();
  }
  return camera;
}

export function createLine(vertices, color = 0x000000) {
  const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
  const material = new THREE.LineBasicMaterial({ color: color });
  return new THREE.Line(geometry, material);
}

export function createAxes(scene, xMin, xMax, yMin, yMax, color = 0x00ffff) {
  const xAxis = createLine([
    new THREE.Vector3(xMin, 0, 0),
    new THREE.Vector3(xMax, 0, 0)
  ], color);
  scene.add(xAxis);

  const yAxis = createLine([
    new THREE.Vector3(0, yMin, 0),
    new THREE.Vector3(0, yMax, 0)
  ], color);
  scene.add(yAxis);

  const arrowSizeX = (xMax - xMin) * 0.05;
  const arrowSizeY = (yMax - yMin) * 0.05;
  const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(xMax, 0, 0), arrowSizeX, color, arrowSizeX, arrowSizeX * 0.5);
  scene.add(arrowX);
  const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, yMax, 0), arrowSizeY, color, arrowSizeY, arrowSizeY * 0.5);
  scene.add(arrowY);

  const tickStep = 1.0;
  const tickLengthX = (yMax - yMin) * 0.01;
  for (let x = Math.ceil(xMin); x <= xMax; x += tickStep) {
    const tick = createLine([
      new THREE.Vector3(x, -tickLengthX, 0),
      new THREE.Vector3(x, tickLengthX, 0)
    ], color);
    scene.add(tick);
  }

  const tickStepY = 1.0;
  const tickLengthY = (xMax - xMin) * 0.01;
  const startY = Math.ceil(yMin / tickStepY) * tickStepY;
  for (let y = startY; y <= yMax; y += tickStepY) {
    const tick = createLine([
      new THREE.Vector3(-tickLengthY, y, 0),
      new THREE.Vector3(tickLengthY, y, 0)
    ], color);
    scene.add(tick);
  }
}

export function createGraph(scene, funcXMin, funcXMax) {
  const vertices = [];
  const step = 0.01;
  for (let x = funcXMin; x <= funcXMax; x += step) {
    const y = 2 * x * x - 3 * x - 8;
    vertices.push(new THREE.Vector3(x, y, 0));
  }
  const graphLine = createLine(vertices, 0xff0000);
  scene.add(graphLine);
}