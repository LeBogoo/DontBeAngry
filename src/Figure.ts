import { Mesh, MeshStandardMaterial, Scene, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Team } from "./Team";

const teamColors = {
  Blue: "blue",
  Yellow: "orange",
  Red: "red",
  Green: "green",
};

export class Figure {
  public mesh!: Mesh;
  public isActive: boolean = false;
  private targetPosition: Vector3 = new Vector3(0, 0, 0);
  static model: Mesh;

  constructor(private loader: GLTFLoader, private scene: Scene, public team: Team = Team.BLUE) {
    this.load();
  }

  load() {
    // load a glb model
    if (!Figure.model) {
      this.loader.load("assets/Figure.glb", (gltf) => {
        const model = gltf.scene;
        Figure.model = model.children[0] as Mesh;
        this.create();
      });
    } else {
      this.create();
    }
  }

  create() {
    this.mesh = Figure.model.clone();
    (this.mesh.material as MeshStandardMaterial).color.set(teamColors[this.team]);
    this.scene.add(this.mesh);

    this.mesh?.position.copy(this.targetPosition);
    this.update();
  }

  update() {
    this.mesh?.position.lerp(this.targetPosition, 0.1);
  }

  setPosition(position: Vector3) {
    this.targetPosition = position;
  }
}
