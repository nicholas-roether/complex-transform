import { ChangeCallbackID } from "../utils/change_notifier";
import Viewport from "./viewport";

abstract class Renderer {
	public readonly viewport: Viewport;

	private updateScheduled = true;
	private _running = false;
	private lastFrame: DOMHighResTimeStamp | null = null;
	private viewportListener?: ChangeCallbackID;

	constructor(viewport: Viewport) {
		this.viewport = viewport;
	}

	public get running(): boolean {
		return this._running;
	}

	public run(): void {
		this._running = true;
		this.viewportListener = this.viewport.onChange(() => this.update());
		this.drawLoop();
	}

	public stop(): void {
		this._running = false;
		if (this.viewportListener)
			this.viewport.unregisterCallback(this.viewportListener);
	}

	public update(): void {
		this.updateScheduled = true;
	}

	protected abstract draw(): void;

	protected abstract clearScreen(): void;

	private drawLoop() {
		if (this.updateScheduled) {
			this.clearScreen();
			this.draw();
			this.updateScheduled = false;
		}
		if (this._running) requestAnimationFrame(() => this.drawLoop());
	}
}

export default Renderer;
