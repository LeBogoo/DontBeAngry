import "./style.css";
import {
  AmbientLight,
  GridHelper,
  Mesh,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  Raycaster,
  Scene,
  SpotLight,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "@three-ts/orbit-controls";
import { Board } from "./Board";
import { Team } from "./Team";
import { Figure } from "./Figure";

const renderer = new WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000000);
camera.position.z = 35;
camera.position.y = 25;

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new Scene();

const raycaster = new Raycaster();

const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// add point lights in a circle around the center
const numlights = 25;
const numRadius = 25;
for (let i = 0; i < numlights; i++) {
  const pointLight = new PointLight(0xffffff, 0.02, 1000);
  pointLight.position.x = Math.cos((i / numlights) * 2 * Math.PI) * numRadius;
  pointLight.position.z = Math.sin((i / numlights) * 2 * Math.PI) * numRadius;
  pointLight.position.y = 20;
  scene.add(pointLight);
}

// load a glb model
const loader = new GLTFLoader();

let board = new Board(loader, scene);
setTimeout(() => {
  board.addPlayer("Player 1", Team.BLUE);
  board.addPlayer("Player 2", Team.YELLOW);
  board.addPlayer("Player 3", Team.RED);
  board.addPlayer("Player 4", Team.GREEN);
}, 100);

function addHelpers() {
  const gridHelper = new GridHelper(100, 10);
  gridHelper.position.setY(-1);
  scene.add(gridHelper);

  scene.traverse((object) => {
    if (object instanceof PointLight) {
      const helper = new PointLightHelper(object, 1);
      scene.add(helper);
    }
  });
}

let mousePos = {
  x: 0,
  y: 0,
};
document.addEventListener("mousemove", (event) => {
  mousePos = {
    x: (event.clientX / window.innerWidth) * 2 - 1,
    y: -(event.clientY / window.innerHeight) * 2 + 1,
  };
});

let highlightLamp = new SpotLight(0xffffff, 1, 1000, 0.4);
highlightLamp.position.y = 3;
highlightLamp.target.updateMatrixWorld();
scene.add(highlightLamp);

let selectMode = false;
let selectedFigure: Figure | null = null;
let selectedPad: THREE.Object3D | null = null;
document.addEventListener("click", (event) => {
  raycaster.setFromCamera(mousePos, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (!intersects) return;

  let intersect = intersects[0];
  if (!intersect || !intersect.object) return;
  if (intersect.object.name == "Figure") {
    for (let player of board.players) {
      for (let figure of player.figures) {
        if (figure.mesh == intersect.object) {
          figure.isActive = !figure.isActive;
          if (figure.isActive) {
            selectedFigure = figure;
            selectedPad = figure.mesh;
          }
          selectMode = figure.isActive;
        } else {
          figure.isActive = false;
        }

        figure.update();
      }
    }
  }

  if (
    intersect.object.name.startsWith("G") ||
    intersect.object.name.startsWith("S") ||
    intersect.object.name.startsWith("E")
  ) {
    if (selectMode && selectedFigure && selectedPad) {
      board.moveFigure(selectedFigure, selectedPad.name);
      selectedFigure = null;
      selectMode = false;
    }
  }
});

// addHelpers();

function animate() {
  controls.update();

  board.update();

  boardSelectRaycast: if (selectMode) {
    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let intersect = intersects[0];

    if (!intersect) break boardSelectRaycast;

    board.model.traverse((object) => {
      if (
        object.name.startsWith("G") ||
        object.name.startsWith("S") ||
        object.name.startsWith("E")
      ) {
        if (object.name == intersect.object.name) {
          selectedPad = object;
        }
      }
    });
  }

  if (selectMode && selectedPad) {
    highlightLamp.position.lerp(
      new Vector3(selectedPad.position.x, 3, selectedPad.position.z),
      0.1
    );

    // make spot light look at the selected pad
    highlightLamp.target.position.lerp(selectedPad.position, 0.1);
    highlightLamp.target.updateMatrixWorld();
  } else {
    highlightLamp.intensity = 0.2;
    highlightLamp.position.lerp(new Vector3(0, 80, 0), 0.1);
    highlightLamp.target.position.lerp(new Vector3(0, 0, 0), 0.1);
    highlightLamp.target.updateMatrixWorld();
  }

  renderer.render(scene, camera);
}
