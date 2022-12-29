import { Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Figure } from "./Figure";
import { Team } from "./Team";

export class Player {
  public figures: Figure[] = [];
  constructor(
    public name: string,
    public team: Team,
    private loader: GLTFLoader,
    private scene: Scene
  ) {}

  initializeFigures() {
    for (let i = 0; i < 4; i++) {
      this.figures.push(new Figure(this.loader, this.scene, this.team));
    }
    return this.figures;
  }

  update() {
    this.figures.forEach((figure) => {
      figure.update();
    });
  }
}
