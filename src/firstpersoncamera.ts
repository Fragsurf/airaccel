// import { Scene, Camera, Vector3, Matrix, Quaternion, Ray } from "@babylonjs/core";
// import { UserCommand } from "./clientinput";

// export class FirstPersonCamera extends Camera {
//     private _rotation: Vector3;
//     private scene: Scene;
//     private canvas: HTMLCanvasElement;
//     private sensitivity: number = 0.002;
//     private tmpMatrix: Matrix = new Matrix();

//     constructor(name: string, position: Vector3, scene: Scene) {
//         super(name, position, scene);
//         this.scene = scene;
//         this._rotation = Vector3.Zero();
//         this.canvas = this.getEngine().getRenderingCanvas() as HTMLCanvasElement;
        
//         this.minZ = 0.05;
//         this.maxZ = 1000;
//         this.fov = 1.3;

//         this.canvas.addEventListener("click", () => {
//             this.canvas.requestPointerLock();
//         });

//         this._updateViewMatrix();
//     }

//     public updateFromUserCommand(cmd: UserCommand): void {
//         this._rotation.y -= cmd.mouseX * this.sensitivity;
//         this._rotation.x -= cmd.mouseY * this.sensitivity;

//         this._rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this._rotation.x));

//         this._updateViewMatrix();
//     }

//     private _updateViewMatrix(): void {
//         // Create rotation matrix
//         Matrix.RotationYawPitchRollToRef(this._rotation.y, this._rotation.x, 0, this.tmpMatrix);

//         // Compute view matrix: rotation * translation
//         this._computedViewMatrix.copyFrom(this.tmpMatrix);
//         this._computedViewMatrix.invert();
//         const negatedPosition = this.position.scale(-1);
//         this._computedViewMatrix.setTranslation(negatedPosition);

//         this._markSyncedWithParent();
//     }

//     public setPosition(position: Vector3): void {
//         super.position.copyFrom(position);
//         this._updateViewMatrix();
//     }

//     public getForwardRay(length = 1000, transform?: Matrix, origin?: Vector3): Ray {
//         const forward = this.getDirection(Vector3.Forward());
//         const actualOrigin = origin || this.position.clone();
        
//         if (transform) {
//             Vector3.TransformCoordinatesToRef(actualOrigin, transform, actualOrigin);
//             Vector3.TransformNormalToRef(forward, transform, forward);
//         }

//         return new Ray(actualOrigin, forward, length);
//     }

//     public getDirection(localAxis: Vector3): Vector3 {
//         const result = Vector3.Zero();
//         this.getDirectionToRef(localAxis, result);
//         return result;
//     }

//     public getDirectionToRef(localAxis: Vector3, result: Vector3): void {
//         Matrix.RotationYawPitchRollToRef(this._rotation.y, this._rotation.x, 0, this.tmpMatrix);
//         Vector3.TransformNormalToRef(localAxis, this.tmpMatrix, result);
//         result.normalize();
//     }
// }