import * as THREE from "three";

import { DragControls } from "three/examples/jsm/controls/DragControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let container;
let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let controls: DragControls, orbitControls: OrbitControls, group: THREE.Group;
let enableSelection = false;

type Object = THREE.Mesh<THREE.BoxGeometry, THREE.MeshLambertMaterial>;
const objects: Object[] = [];

const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster();

init();

animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.z = 1000;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  scene.add(new THREE.AmbientLight(0x505050));

  const light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 500, 2000);
  light.angle = Math.PI / 9;

  light.castShadow = true;
  light.shadow.camera.near = 1000;
  light.shadow.camera.far = 4000;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  scene.add(light);

  group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.BoxGeometry(40, 40, 40);

  for (let i = 0; i < 10; i++) {
    const object = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );

    object.position.x = Math.random() * 1000 - 500;
    // object.position.y = Math.random() * 600 - 300;
    object.position.z = Math.random() * 800 - 400;

    // object.rotation.x = Math.random() * 2 * Math.PI;
    // object.rotation.y = Math.random() * 2 * Math.PI;
    // object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() * 2 + 1;
    object.scale.y = Math.random() * 2 + 1;
    object.scale.z = Math.random() * 2 + 1;

    object.castShadow = true;
    object.receiveShadow = true;

    scene.add(object);

    objects.push(object);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild(renderer.domElement);

  controls = new DragControls([...objects], camera, renderer.domElement);
  controls.addEventListener("drag", render);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.listenToKeyEvents(window); // optional

  orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  orbitControls.dampingFactor = 0.05;

  orbitControls.screenSpacePanning = false;

  orbitControls.minDistance = 100;
  orbitControls.maxDistance = 500;

  orbitControls.maxPolarAngle = Math.PI / 2;

  orbitControls.mouseButtons = {
    // LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.ROTATE,
    RIGHT: THREE.MOUSE.PAN,
  };

  window.addEventListener("resize", onWindowResize);

  document.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function onKeyDown(event: KeyboardEvent) {
  enableSelection = event.keyCode === 16 ? true : false;
}

function onKeyUp() {
  enableSelection = false;
}

function onClick(event: MouseEvent) {
  event.preventDefault();

  if (enableSelection === true) {
    const draggableObjects = controls.getObjects();
    draggableObjects.length = 0;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects(objects, true);

    if (intersections.length > 0) {
      const object = intersections[0].object;

      if (group.children.includes(object) === true) {
        object.material.emissive.set(0x000000);
        scene.attach(object);
      } else {
        object.material.emissive.set(0xaaaaaa);
        group.attach(object);
      }

      controls.transformGroup = true;
      draggableObjects.push(group);
    }

    if (group.children.length === 0) {
      controls.transformGroup = false;
      draggableObjects.push(...objects);
    }
  }

  render();
}

function animate() {
  requestAnimationFrame(animate);

  orbitControls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render();
}

function render() {
  renderer.render(scene, camera);
}