import { Scene, SceneLoader, AbstractMesh, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export class GltfTest {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public async loadModel(
        fileName: string, 
        scaleFactor: number = 1, 
        position: Vector3 = Vector3.Zero()
    ): Promise<AbstractMesh[]> {
        try {
            const result = await SceneLoader.ImportMeshAsync("", "./assets/surf_castle_preview/", fileName, this.scene);
            
            const rootMesh = result.meshes[0];
            rootMesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
            rootMesh.position = position;

            console.log(`Loaded GLTF model: ${fileName}`);
            return result.meshes;
        } catch (error) {
            console.error(`Error loading GLTF model: ${fileName}`, error);
            throw error;
        }
    }

    public async init(): Promise<void> {
        try {
            // Example usage: Load a model named "example.gltf" from the assets folder
            await this.loadModel("scene.gltf", .0254, new Vector3(0, 0, 0));
            console.log("GLTF model loaded successfully");
        } catch (error) {
            console.error("Failed to initialize GltfTest", error);
        }
    }
}