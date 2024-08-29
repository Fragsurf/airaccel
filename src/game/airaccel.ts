import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HavokPlugin } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { GameLoop } from "./gameloop";
import { PlayerController } from "./player/playercontroller";
import { GamePhysics } from "./gamephysics";
import { GrayboxMap } from "./map/gbmap";

export class AirAccel {
    private scene!: Scene;
    private engine!: Engine;
    private gameLoop!: GameLoop;
    private playerController!: PlayerController;
    private physics!: GamePhysics;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
    }

    public async initialize(): Promise<void> {
        await this.initializePhysicsAndScene();
        this.physics = new GamePhysics(this.scene);
        this.playerController = new PlayerController(this.scene, this.physics, new Vector3(0, 10, 0));

        new GrayboxMap(this.scene, this.physics);

        this.gameLoop = new GameLoop(this.scene, this.engine);
        this.gameLoop.addTickCallback((deltaTime) => this.playerController.tick(deltaTime));
        this.gameLoop.addUpdateCallback((deltaTime) => this.playerController.update(deltaTime));

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    public resize(): void {
        this.engine.resize();
    }

    public getEngine(): Engine {
        return this.engine;
    }

    public getScene(): Scene {
        return this.scene;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getPlayerController(): PlayerController {
        return this.playerController;
    }

    private async initializePhysicsAndScene(): Promise<void> {
        const havokInstance = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
    }
}