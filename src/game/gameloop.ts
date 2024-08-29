import { Scene, Engine } from "@babylonjs/core";

export class GameLoop
{
    private scene: Scene;
    private engine: Engine;
    private tickRate: number;
    private tickInterval: number;
    private lastTickTime: number;
    private accumulatedTime: number;

    private tickCallbacks: Array<( deltaTime: number ) => void> = [];
    private updateCallbacks: Array<( deltaTime: number ) => void> = [];

    private static _fixedDeltaTime: number;
    private static _deltaTime: number;
    private static _alpha: number;

    private targetFPS: number;
    private frameInterval: number;
    private lastFrameTime: number;

    public static get FixedDeltaTime(): number { return GameLoop._fixedDeltaTime; }
    public static get DeltaTime(): number { return GameLoop._deltaTime; }
    public static get Alpha(): number { return GameLoop._alpha; }

    constructor( scene: Scene, engine: Engine, ticksPerSecond: number = 100, targetFPS: number = 300 )
    {
        this.scene = scene;
        this.engine = engine;
        this.tickRate = ticksPerSecond;
        this.tickInterval = 1000 / this.tickRate;
        this.lastTickTime = performance.now();
        this.accumulatedTime = 0;

        this.targetFPS = targetFPS;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = performance.now();

        GameLoop._fixedDeltaTime = 1 / this.tickRate;
        GameLoop._deltaTime = 0;
        GameLoop._alpha = 0;

        this.engine.runRenderLoop( () => this.gameLoop() );
    }

    private gameLoop(): void
    {
        const currentTime = performance.now();
        const frameDeltaTime = currentTime - this.lastFrameTime;

        if ( frameDeltaTime < this.frameInterval )
        {
            // If we're ahead of schedule, wait
            const sleepTime = this.frameInterval - frameDeltaTime;
            this.sleep( sleepTime );
            return;
        }

        this.lastFrameTime = currentTime;

        GameLoop._deltaTime = frameDeltaTime / 1000; // Convert to seconds
        this.accumulatedTime += frameDeltaTime;

        // Fixed timestep updates (Tick)
        while ( this.accumulatedTime >= this.tickInterval )
        {
            this.tick( GameLoop._fixedDeltaTime );
            this.accumulatedTime -= this.tickInterval;
        }

        // Calculate alpha for interpolation
        GameLoop._alpha = this.accumulatedTime / this.tickInterval;

        // Variable timestep update (Update)
        this.update( GameLoop._deltaTime );

        // Render the scene
        this.scene.render();
    }

    private sleep( ms: number ): void
    {
        const start = performance.now();
        while ( performance.now() - start < ms )
        {
            // Busy-wait
        }
    }

    private tick( deltaTime: number ): void
    {
        for ( const callback of this.tickCallbacks )
        {
            callback( deltaTime );
        }
    }

    private update( deltaTime: number ): void
    {
        for ( const callback of this.updateCallbacks )
        {
            callback( deltaTime );
        }
    }

    public addTickCallback( callback: ( deltaTime: number ) => void ): void
    {
        this.tickCallbacks.push( callback );
    }

    public addUpdateCallback( callback: ( deltaTime: number ) => void ): void
    {
        this.updateCallbacks.push( callback );
    }

    public setTargetFPS( fps: number ): void
    {
        this.targetFPS = fps;
        this.frameInterval = 1000 / this.targetFPS;
    }
}