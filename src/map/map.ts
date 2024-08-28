import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, PhysicsAggregate, PhysicsShapeType, DirectionalLight, ShadowGenerator, Texture, PhysicsShapeMesh, PhysicsBody, PhysicsMotionType, HemisphericLight, CubeTexture } from "@babylonjs/core";
import { GamePhysics } from "../gamephysics";

export class Map {
    private scene: Scene;
    private physics: GamePhysics;
    private shadowGenerator!: ShadowGenerator;

    constructor(scene: Scene, physics: GamePhysics) {
        this.scene = scene;
        this.physics = physics;
        this.createSunLight();
        this.createSkybox();
        this.createEnvironment();
    }

    private createSunLight(): void {
        const light = new DirectionalLight("sunLight", new Vector3(-1, -2, -1), this.scene);
        light.position = new Vector3(100, 100, 0);
        light.intensity = 0.7;
        light.shadowEnabled = true;

        const light2 = new HemisphericLight("hemisphereLight", new Vector3(1, 2, 1), this.scene);
        light2.shadowEnabled = true;

        this.shadowGenerator = new ShadowGenerator(2048, light);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurKernel = 32;
        this.shadowGenerator.bias = 0.00001;  
    }

    private createSkybox(): void {
        var skybox = MeshBuilder.CreateBox("skyBox", {size:1000.0}, this.scene);
        var skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new CubeTexture("assets/textures/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;	
        skybox.infiniteDistance = true;
    }

    private createEnvironment(): void {
        // Create ground
        const ground = MeshBuilder.CreatePlane("ground", { width: 100, height: 100 }, this.scene);
        ground.rotation.x = Math.PI / 2;
        ground.position = new Vector3(0, 0, 0);
        const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = new Texture("assets/textures/dev_gray.png", this.scene);
        groundMaterial.diffuseTexture.scale( 0.1 );
        groundMaterial.specularColor = new Color3(0, 0, 0); // Remove specularity
        ground.material = groundMaterial;
        ground.position = new Vector3();
        ground.receiveShadows = true;
        ground.checkCollisions = true;
        this.physics.addStaticMesh( ground );

        // Create some obstacles
        this.createBox(new Vector3(5, 1, 5));
        this.createBox(new Vector3(3, 1.6256/2, 0), 1.6256);
        this.createSphere(new Vector3(-5, 1, -5));
        this.createCylinder(new Vector3(0, 1, -8));

        // Create a ramp
        this.createRamp(new Vector3(10, 0, 25));
    }

    private createBox(position: Vector3, size: number = 2): void {
        const box = MeshBuilder.CreateBox("box", { size: size }, this.scene);
        box.position = position;
        const boxMaterial = this.createNonSpecularMaterial("boxMaterial", "assets/textures/dev_orange.png");
        box.material = boxMaterial;
        box.receiveShadows = true;
        box.checkCollisions = true;
        this.shadowGenerator.addShadowCaster(box);
        this.physics.addStaticMesh( box );
    }

    private createSphere(position: Vector3): void {
        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, this.scene);
        sphere.position = position;
        sphere.receiveShadows = true;
        sphere.checkCollisions = true;
        const sphereMaterial = this.createNonSpecularMaterial("sphereMaterial", "assets/textures/dev_orange.png");
        sphere.material = sphereMaterial;
        this.shadowGenerator.addShadowCaster(sphere);
        this.physics.addStaticMesh( sphere );
    }

    private createCylinder(position: Vector3): void {
        const cylinder = MeshBuilder.CreateCylinder("cylinder", { height: 2, diameter: 2 }, this.scene);
        cylinder.position = position;
        cylinder.receiveShadows = true;
        cylinder.checkCollisions = true;
        const cylinderMaterial = this.createNonSpecularMaterial("cylinderMaterial", "assets/textures/dev_orange.png");
        cylinder.material = cylinderMaterial;
        new PhysicsAggregate(cylinder, PhysicsShapeType.CYLINDER, { mass: 0 }, this.scene);
        this.shadowGenerator.addShadowCaster(cylinder);
        this.physics.addStaticMesh( cylinder );
    }

    private createRamp(position: Vector3): void {
        const ramp = MeshBuilder.CreateBox("ramp", { width: 16, depth: 8, height: 16 }, this.scene);
        ramp.position = position;
        ramp.rotation.x = Math.PI / 6; // 15-degree incline
        ramp.receiveShadows = true;
        ramp.checkCollisions = true;
        const rampMaterial = this.createNonSpecularMaterial("rampMaterial", "assets/textures/dev_orange.png");
        ramp.material = rampMaterial;
        new PhysicsAggregate(ramp, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
        this.shadowGenerator.addShadowCaster(ramp);
        this.physics.addStaticMesh( ramp );
    }

    private createNonSpecularMaterial(name: string, texturePath: string): StandardMaterial {
        const material = new StandardMaterial(name, this.scene);
        material.diffuseTexture = new Texture(texturePath, this.scene);
        material.specularColor = new Color3(0, 0, 0); // Remove specularity
        return material;
    }
}