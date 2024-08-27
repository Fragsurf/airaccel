import { Vector3 } from "@babylonjs/core";

export class GameHUD {
    private container!: HTMLDivElement;
    private timerElement!: HTMLDivElement;
    private velocityElement!: HTMLDivElement;
    private statsElement!: HTMLDivElement;
    private crosshairElement!: HTMLDivElement;
    private startTime: number;
    private isRunning: boolean;

    constructor() {
        this.startTime = 0;
        this.isRunning = false;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    private init(): void {
        this.createHUDElements();
        this.applyStyles();
    }

    private createHUDElements(): void {
        this.container = document.createElement('div');
        this.container.id = 'game-hud';

        this.timerElement = document.createElement('div');
        this.timerElement.id = 'timer';
        this.timerElement.textContent = '00:00.000';

        this.velocityElement = document.createElement('div');
        this.velocityElement.id = 'velocity';
        this.velocityElement.textContent = '0 u/s';

        this.statsElement = document.createElement('div');
        this.statsElement.id = 'stats';
        this.statsElement.textContent = 'Jumps: 0 | Strafes: 0';

        this.crosshairElement = document.createElement('div');
        this.crosshairElement.id = 'crosshair';

        this.container.appendChild(this.timerElement);
        this.container.appendChild(this.velocityElement);
        this.container.appendChild(this.statsElement);
        this.container.appendChild(this.crosshairElement);

        document.body.appendChild(this.container);
    }

    private applyStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            #game-hud {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                font-family: Arial, sans-serif;
                color: white;
                text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
                z-index: 1000;
            }
            #timer {
                position: absolute;
                top: 10%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 36px;
                animation: glow 2s ease-in-out infinite;
            }
            #velocity {
                position: absolute;
                bottom: 15%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 24px;
            }
            #stats {
                position: absolute;
                bottom: 10%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 20px;
            }
            #crosshair {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 10px;
                height: 10px;
                border: 2px solid rgba(255, 255, 255, 0.7);
                border-radius: 50%;
                transform: translate(-50%, -50%);
            }
            @keyframes glow {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    public startTimer(): void {
        this.startTime = Date.now();
        this.isRunning = true;
    }

    public stopTimer(): void {
        this.isRunning = false;
    }

    public resetTimer(): void {
        this.startTime = 0;
        this.isRunning = false;
        this.timerElement.textContent = '00:00.000';
    }

    public updateHUD(velocity: Vector3, jumps: number, strafes: number): void {
        if (this.isRunning) {
            const elapsedTime = Date.now() - this.startTime;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            const milliseconds = elapsedTime % 1000;
            this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        }

        const horizontalVelocity = new Vector3(velocity.x, 0, velocity.z);
        const speed = Math.floor(horizontalVelocity.length() / 0.0254);
        this.velocityElement.textContent = `${speed} u/s`;

        if (speed > 1000) {
            this.velocityElement.style.color = 'red';
        } else if (speed > 500) {
            this.velocityElement.style.color = 'orange';
        } else {
            this.velocityElement.style.color = 'white';
        }

        this.statsElement.textContent = `Jumps: ${jumps} | Strafes: ${strafes}`;
    }
}