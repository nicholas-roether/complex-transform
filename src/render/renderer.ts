import Viewport from "./viewport";

abstract class Renderer {
	public readonly viewport: Viewport;

	private updateScheduled = true;
	private lastFrame: DOMHighResTimeStamp | null = null;

	constructor(viewport: Viewport) {
		this.viewport = viewport;
		this.viewport.onChange(() => this.update());
	}

	public run(): void {
		this.drawLoop();
	}

	public update(): void {
		this.updateScheduled = true;
	}

	protected abstract draw(): void;

	// TODO replace this system
	protected frame(dt: number): void {}

	protected abstract clearScreen(): void;

	private drawLoop(ts?: DOMHighResTimeStamp) {
		if (ts) {
			if (this.lastFrame != null) {
				const dt = ts - this.lastFrame;
				this.frame(dt);
			}
			this.lastFrame = ts;
		}
		if (this.updateScheduled) {
			this.clearScreen();
			this.draw();
			this.updateScheduled = false;
		}
		requestAnimationFrame((ts) => this.drawLoop(ts));
	}
}

export default Renderer;
