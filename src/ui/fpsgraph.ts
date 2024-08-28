export class FPSGraph {
    private container: HTMLDivElement;
    private fpsElement: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private fpsHistory: number[] = [];
    private maxFpsHistory: number = 100;
    private targetFPS: number = 60;

    constructor() {
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '10px';
        this.container.style.left = '10px';
        this.container.style.color = 'white';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.container.style.padding = '5px';
        this.container.style.borderRadius = '5px';
        this.container.style.fontFamily = 'Arial, sans-serif';

        this.fpsElement = document.createElement('div');
        this.container.appendChild(this.fpsElement);

        this.canvas = document.createElement('canvas');
        this.canvas.width = 200;
        this.canvas.height = 60;
        this.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d')!;

        document.body.appendChild(this.container);
    }

    public update(fps: number): void {
        this.fpsElement.textContent = `FPS: ${fps.toFixed(2)}`;
        
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxFpsHistory) {
            this.fpsHistory.shift();
        }

        this.drawFPSGraph();
    }

    private drawFPSGraph(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw FPS line
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);

        const barWidth = this.canvas.width / this.maxFpsHistory;

        for (let i = 0; i < this.fpsHistory.length; i++) {
            const fps = this.fpsHistory[i];
            const x = i * barWidth;
            const y = this.canvas.height - (fps / this.targetFPS) * this.canvas.height;

            this.ctx.lineTo(x, y);

            // Color-code the bars
            if (fps >= this.targetFPS) {
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';  // Green for good FPS
            } else if (fps >= this.targetFPS * 0.8) {
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';  // Yellow for slight drops
            } else {
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';  // Red for significant drops
            }

            this.ctx.fillRect(x, y, barWidth, this.canvas.height - y);
        }

        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();

        // Draw target FPS line
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.canvas.width, 0);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.stroke();
    }

    public setTargetFPS(fps: number): void {
        this.targetFPS = fps;
    }
}