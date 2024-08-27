import { Scene, Engine } from "@babylonjs/core";

export class InputController {
    private scene: Scene;
    private engine: Engine;
    private canvas: HTMLCanvasElement;
    private pointerLocked: boolean = false;
    private onPointerLockChange: ((isLocked: boolean) => void) | null = null;
    private lockRequested: boolean = false;
    private lastUnlockTime: number = 0;
    private readonly LOCK_COOLDOWN: number = 1500; // 1 second cooldown

    constructor(scene: Scene, engine: Engine) {
        this.scene = scene;
        this.engine = engine;
        this.canvas = this.engine.getRenderingCanvas() as HTMLCanvasElement;
        this.setupPointerLock();
    }

    private setupPointerLock(): void {
        this.canvas.addEventListener("click", this.onCanvasClick);

        document.addEventListener("pointerlockchange", this.handlePointerLockChange);
        document.addEventListener("pointerlockerror", this.handlePointerLockError);

        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === 1 && kbInfo.event.code === "Escape") {
                this.unlockPointer();
            }
        });
    }

    private onCanvasClick = (): void => {
        this.lockPointer();
    }

    private handlePointerLockChange = (): void => {
        const controlEnabled = document.pointerLockElement === this.canvas;
        this.pointerLocked = controlEnabled;
        this.lockRequested = false;

        if (!controlEnabled) {
            this.lastUnlockTime = Date.now();
        }

        if (this.onPointerLockChange) {
            this.onPointerLockChange(this.pointerLocked);
        }

        if (controlEnabled) {
            this.scene.attachControl();
        } else {
            this.scene.detachControl();
        }
    }

    private handlePointerLockError = (event: Event): void => {
        console.warn("Pointer lock error:", event);
        this.lockRequested = false;
        this.pointerLocked = false;
    }

    public setPointerLockCallback(callback: (isLocked: boolean) => void): void {
        this.onPointerLockChange = callback;
    }

    public isPointerLocked(): boolean {
        return this.pointerLocked;
    }

    public lockPointer(): void {
        const currentTime = Date.now();
        if (!this.pointerLocked && !this.lockRequested && 
            (currentTime - this.lastUnlockTime >= this.LOCK_COOLDOWN)) {
            this.lockRequested = true;
            try {
                this.canvas.requestPointerLock();
            } catch (error) {
                console.warn("Failed to request pointer lock:", error);
                this.lockRequested = false;
            }
        } else if (currentTime - this.lastUnlockTime < this.LOCK_COOLDOWN) {
            console.log("Lock attempt too soon after unlock. Waiting...");
        }
    }

    public unlockPointer(): void {
        if (this.pointerLocked) {
            document.exitPointerLock();
            this.lastUnlockTime = Date.now();
        }
    }

    public dispose(): void {
        this.canvas.removeEventListener("click", this.onCanvasClick);
        document.removeEventListener("pointerlockchange", this.handlePointerLockChange);
        document.removeEventListener("pointerlockerror", this.handlePointerLockError);
        this.onPointerLockChange = null;
    }
}