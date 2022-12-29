import { Group, Mesh, MeshStandardMaterial, Object3D, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Figure } from "./Figure";
import { Player } from "./Player";
import { Team } from "./Team";

const homePositions = {
  [Team.BLUE]: ["H11", "H12", "H13", "H14"],
  [Team.YELLOW]: ["H21", "H22", "H23", "H24"],
  [Team.RED]: ["H31", "H32", "H33", "H34"],
  [Team.GREEN]: ["H41", "H42", "H43", "H44"],
};

const startPositions = {
  [Team.BLUE]: "S1",
  [Team.YELLOW]: "S2",
  [Team.RED]: "S3",
  [Team.GREEN]: "S4",
};

const endPositions = {
  [Team.BLUE]: ["E11", "E12", "E13", "E14"],
  [Team.YELLOW]: ["E21", "E22", "E23", "E24"],
  [Team.RED]: ["E31", "E32", "E33", "E34"],
  [Team.GREEN]: ["E41", "E42", "E43", "E44"],
};

export class Board {
  players: Player[] = [];
  isSelecting = false;
  model!: Group;

  constructor(private loader: GLTFLoader, private scene: Scene) {
    this.load();
  }

  addPlayer(name: string, team: Team) {
    let player = new Player(name, team, this.loader, this.scene);
    this.players.push(player);
    let figures = player.initializeFigures();
    figures.forEach((figure, index) => {
      figure.setPosition(this.model.getObjectByName(homePositions[team][index])!.position);
    });
  }

  moveFigure(figure: Figure, position: string) {
    let target = this.model.getObjectByName(position);
    if (!target) return;
    figure.setPosition(target.position);
  }

  update() {
    this.players.forEach((player) => {
      player.update();
    });
  }

  load() {
    // load a glb model
    this.loader.load(
      "assets/Board.glb",
      (gltf) => {
        this.model = gltf.scene;
        this.scene.add(this.model);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  }
}
