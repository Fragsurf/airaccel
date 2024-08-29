import { Scene, KeyboardEventTypes, Vector3 } from '@babylonjs/core';

export enum InputAction {
    None    = 0,
    Forward = 1 << 0,
    Back    = 1 << 1,
    Left    = 1 << 2,
    Right   = 1 << 3,
    Jump    = 1 << 4,
    Duck    = 1 << 5,
    Use     = 1 << 6
}

export class UserCommand {
    currentState: number = 0;
    previousState: number = 0;
    mouseDeltaX: number = 0;
    mouseDeltaY: number = 0;
    eyeAngles: Vector3 = new Vector3();

    isDown(action: InputAction): boolean {
        return (this.currentState & action) !== 0;
    }

    justPressed(action: InputAction): boolean {
        return this.isDown(action) && (this.previousState & action) === 0;
    }

    justReleased(action: InputAction): boolean {
        return !this.isDown(action) && (this.previousState & action) !== 0;
    }

    clear() {
        this.previousState = this.currentState;
        this.currentState = 0;
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
    }
}

export class ClientInput {
    private scene: Scene;
    private keyMapping: Map<string, InputAction>;
    private currentCommand: UserCommand = new UserCommand();
    private pressedKeys: Set<string> = new Set();
    private inputState: number = 0;
    private sensitivity: number = .001 * .5;
    private accumulatedMouseDeltaX: number = 0;
    private accumulatedMouseDeltaY: number = 0;

    private canvas: HTMLCanvasElement;

    private _eyeAngles: Vector3 = new Vector3();

    public get eyeAngles(): Vector3 {
        return this._eyeAngles.clone();
    }

    constructor(scene: Scene) {
        this.scene = scene;
        this.keyMapping = this.getDefaultKeyMapping();
        this.canvas = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement;
        this.setupListeners();
    }

    private getDefaultKeyMapping(): Map<string, InputAction> {
        return new Map([
            ['w', InputAction.Forward],
            ['s', InputAction.Back],
            ['a', InputAction.Left],
            ['d', InputAction.Right],
            [' ', InputAction.Jump],
            ['c', InputAction.Duck],
            ['e', InputAction.Use]
        ]);
    }

    private setupListeners() {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            if (this.keyMapping.has(key)) {
                const action = this.keyMapping.get(key)!;
                if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                    this.pressedKeys.add(key);
                    this.inputState |= action;
                } else if (kbInfo.type === KeyboardEventTypes.KEYUP) {
                    this.pressedKeys.delete(key);
                    this.inputState &= ~action;
                }
            }
        });

        this.setupPointerLock();
    }

    public setKeyMapping(newMapping: Map<string, InputAction>) {
        this.keyMapping = newMapping;
    }

    public setSensitivity(sensitivity: number) {
        this.sensitivity = sensitivity;
    }

    public update(deltaTime: number) {
        this.currentCommand.previousState = this.currentCommand.currentState;
        this.currentCommand.currentState = this.inputState;

        // Apply accumulated mouse movement
        const mouseDeltaX = this.accumulatedMouseDeltaX * this.sensitivity;
        const mouseDeltaY = this.accumulatedMouseDeltaY * this.sensitivity;

        // Update eye angles immediately
        this._eyeAngles.y += mouseDeltaX;
        this._eyeAngles.x += mouseDeltaY;

        // Clamp vertical rotation
        this._eyeAngles.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this._eyeAngles.x));

        // Wrap horizontal rotation
        this._eyeAngles.y = ((this._eyeAngles.y + Math.PI) % (2 * Math.PI)) - Math.PI;

        // Update the UserCommand's eyeAngles and mouse deltas
        this.currentCommand.eyeAngles.copyFrom(this._eyeAngles);
        this.currentCommand.mouseDeltaX = mouseDeltaX;
        this.currentCommand.mouseDeltaY = mouseDeltaY;

        // Reset accumulated mouse movement
        this.accumulatedMouseDeltaX = 0;
        this.accumulatedMouseDeltaY = 0;
    }

    public tick(deltaTime: number): UserCommand {
        const tickCommand = new UserCommand();
        tickCommand.currentState = this.currentCommand.currentState;
        tickCommand.previousState = this.currentCommand.previousState;
        tickCommand.mouseDeltaX = this.currentCommand.mouseDeltaX;
        tickCommand.mouseDeltaY = this.currentCommand.mouseDeltaY;
        tickCommand.eyeAngles.copyFrom(this._eyeAngles);

        return tickCommand;
    }

    private setupPointerLock(): void
    {
        const canvas = this.canvas;
        
        // register the callback when a pointerlock event occurs
        document.addEventListener('pointerlockchange', (e) => this.changeCallback( e ), false);
        document.addEventListener('mozpointerlockchange', (e) => this.changeCallback( e ), false);
        document.addEventListener('webkitpointerlockchange', (e) => this.changeCallback( e ), false);

        this.canvas.onclick = function(){
            canvas.requestPointerLock = 
            canvas.requestPointerLock ||
            canvas.mozRequestPointerLock ||
            canvas.webkitRequestPointerLock;
            // @ts-expect-error
            canvas.requestPointerLock({unadjustedMovement: true});
        };
    }

    private changeCallback(e: any): void 
    {
        if ( document.pointerLockElement === this.canvas )
        {
            // we've got a pointerlock for our element, add a mouselistener
            document.addEventListener("mousemove", (e) => this.mouseMove( e ), false);
            document.addEventListener("mousedown", (e) => this.mouseMove( e ), false);
            document.addEventListener("mouseup", (e) => this.mouseMove( e ), false);
        } else {
            // pointer lock is no longer active, remove the callback
            document.removeEventListener("mousemove", (e) => this.mouseMove( e ), false);
            document.removeEventListener("mousedown", (e) => this.mouseMove( e ), false);
            document.removeEventListener("mouseup", (e) => this.mouseMove( e ), false);
        }
    }

    private mouseMove(e: MouseEvent) {
        var movementX = e.movementX ||
                e.mozMovementX ||
                e.webkitMovementX ||
                0;

        var movementY = e.movementY ||
                e.mozMovementY ||
                e.webkitMovementY ||
                0;
        
        this.accumulatedMouseDeltaX += movementX;
        this.accumulatedMouseDeltaY += movementY;
    };

}