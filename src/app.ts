import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HavokPlugin } from "@babylonjs/core";
import { FPSGraph } from "./ui/fpsgraph";
import HavokPhysics from "@babylonjs/havok";
import { GameLoop } from "./gameloop";
import { PlayerController } from "./player/playercontroller";
import { GamePhysics } from "./gamephysics";
import { GameHUD } from "./ui/gamehud";
import { GrayboxMap } from "./map/gbmap";

class App {
    private framerateDisplay!: FPSGraph;
    private scene!: Scene;
    private engine!: Engine;
    private gameLoop!: GameLoop;
    private playerController!: PlayerController;
    private physics!: GamePhysics;
    private gameHud: GameHUD;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        this.framerateDisplay = new FPSGraph();
        this.gameHud = new GameHUD();
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        this.initializePhysicsAndScene().then(() => {

            this.physics = new GamePhysics( this.scene );
            this.playerController = new PlayerController(this.scene, this.physics, new Vector3( 0, 10, 0 ));

            new GrayboxMap(this.scene, this.physics);

            // Create and set up the game loop
            this.gameLoop = new GameLoop(this.scene, this.engine);
            this.gameLoop.addTickCallback((deltaTime) => this.playerController.tick(deltaTime));
            this.gameLoop.addUpdateCallback((deltaTime) => this.playerController.update(deltaTime));
            this.gameLoop.addUpdateCallback((deltaTime) => this.framerateDisplay.update(this.engine.getFps()));
            this.gameLoop.addUpdateCallback((deltaTime) => {
                this.gameHud.updateHUD(this.playerController.velocity, 0, 0);
            });
            
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    private async initializePhysicsAndScene(): Promise<void> {
        const havokInstance = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
    }

}
new App();