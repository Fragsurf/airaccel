import { Scene, Vector3, MeshBuilder, FreeCamera, HemisphericLight, PhysicsAggregate, PhysicsShapeType, HavokPlugin, Mesh } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";

export class HavokTest {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public async init(): Promise<void> {
        // Load Havok physics engine
        const havokInstance = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);

        // Enable physics in the scene
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

        // Create a ground plane
        const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, this.scene);
        new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, this.scene);

        // Set up key press event listener
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === 1 && kbInfo.event.key === 'r') {
                this.spawnRandomShapes();
            }
        });
    }

    private spawnRandomShapes(): void {
        for (let i = 0; i < 64; i++) {
            const position = new Vector3(
                Math.random() * 8 - 4,  // Random X between -4 and 4
                10 + Math.random() * 5, // Random Y between 10 and 15
                Math.random() * 8 - 4   // Random Z between -4 and 4
            );
            this.createRandomPhysicsObject(position);
        }
    }

    private createRandomPhysicsObject(position: Vector3): void {
        let mesh: Mesh;
        let shapeType: PhysicsShapeType;

        const randomShape = Math.floor(Math.random() * 3);
        switch (randomShape) {
            case 0:
                mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);
                shapeType = PhysicsShapeType.SPHERE;
                break;
            case 1:
                mesh = MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
                shapeType = PhysicsShapeType.BOX;
                break;
            case 2:
            default:
                mesh = MeshBuilder.CreateCylinder("cylinder", { diameter: 1, height: 1 }, this.scene);
                shapeType = PhysicsShapeType.CYLINDER;
                break;
        }

        mesh.position = position;
        new PhysicsAggregate(mesh, shapeType, { mass: 1, restitution: 0.75 }, this.scene);
    }
}