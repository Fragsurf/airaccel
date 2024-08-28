import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, HavokPlugin, PhysicsHelper, SceneOptimizerOptions, HardwareScalingOptimization, SceneOptimizer, NullEngineOptions, Color3 } from "@babylonjs/core";
import { FramerateDisplay } from "./frameratedisplay";
import { HavokTest } from "./havoktest";
import { GltfTest } from "./gltftest";
import HavokPhysics from "@babylonjs/havok";
import { GameLoop } from "./gameloop";

import { FirstPersonController } from "./firstpersoncontroller";
import { GamePhysics } from "./gamephysics";
import { InputController } from "./inputcontroller";
import { GameHUD } from "./gamehud";
import { GrayboxMap } from "./map/grayboxmap";

class App {
    private framerateDisplay!: FramerateDisplay;
    private scene!: Scene;
    private engine!: Engine;
    private gameLoop!: GameLoop;
    private firstPersonController!: FirstPersonController;
    private physics!: GamePhysics;
    private input: InputController;
    private gameHud: GameHUD;

    constructor() {
        var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        this.framerateDisplay = new FramerateDisplay();
        this.gameHud = new GameHUD();
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);
        this.input = new InputController( this.scene, this.engine );

        this.initializePhysicsAndScene().then(() => {

            this.physics = new GamePhysics( this.scene );
            this.firstPersonController = new FirstPersonController(this.scene, this.physics, new Vector3( 0, 10, 0 ));

            new GrayboxMap(this.scene, this.physics);

            // Create and set up the game loop
            this.gameLoop = new GameLoop(this.scene, this.engine);
            this.gameLoop.addTickCallback((deltaTime) => this.firstPersonController.tick(deltaTime));
            this.gameLoop.addUpdateCallback((deltaTime) => this.firstPersonController.update(deltaTime));
            this.gameLoop.addUpdateCallback((deltaTime) => this.framerateDisplay.update(this.engine.getFps()));
            this.gameLoop.addUpdateCallback((deltaTime) => {
                this.gameHud.updateHUD(this.firstPersonController.velocity, 0, 0);
            });
            
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    private async initializePhysicsAndScene(): Promise<void> {
        const havokInstance = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
    }

}
new App();