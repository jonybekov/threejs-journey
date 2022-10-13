import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import gsap from "gsap";

/**
 * Utils
 */

function createTriangles(parameters: any) {
  const count = 100;
  const verticesCount = count * 3 * 3;
  const positionsArray = new Float32Array(verticesCount);

  for (let i = 0; i < verticesCount; i++) {
    positionsArray[i] = (Math.random() - 0.5) * 10;
  }

  const attribute = new THREE.BufferAttribute(positionsArray, 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", attribute);

  const material = new THREE.MeshBasicMaterial({
    color: parameters.color,
    wireframe: true,
  });
  const box = new THREE.Mesh(geometry, material);
  return box;
}

function createBox() {}

/**
 * App
 */

const cursor = {
  x: 0,
  y: 0,
};

const clock = new THREE.Clock();
const container = document.getElementById("app") as HTMLCanvasElement;
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 10;

// Controls
const controls = new OrbitControls(camera, container);
controls.enableDamping = true;

const parameters = {
  color: 0xff0000,
  spin() {
    gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 });
  },
};

// Mesh
const mesh = createTriangles(parameters);
scene.add(mesh);

// Debug
const gui = new dat.GUI();

const positionFolder = gui.addFolder("position");
positionFolder.add(mesh.position, "y", -3, 3, 0.1);
positionFolder.add(mesh.position, "x", -3, 3, 0.1);
positionFolder.add(mesh.position, "z", -3, 3, 0.1);

gui.add(mesh, "visible");
gui.add(mesh.material, "wireframe");
gui.addColor(parameters, "color").onChange(() => {
  mesh.material.color.set(parameters.color);
});
gui.add(parameters, "spin");

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: container,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

function onMouseMove(event: MouseEvent) {
  cursor.x = event.clientX / window.innerWidth - 0.5;
  cursor.y = -(event.clientY / window.innerHeight - 0.5);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
}

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("resize", onResize);
