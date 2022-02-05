import { ChangeCallbackID } from "../utils/change_notifier";
import Viewport from "./viewport";

abstract class Renderer {
	public readonly viewport: Viewport;

	private updateScheduled = true;
	private _running = false;
	private lastFrame: DOMHighResTimeStamp | null = null;
	private frameCallbacks: ((dt: number) => void)[] = [];
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

	public beforeNextFrame(callback: (dt: number) => void) {
		this.frameCallbacks.push(callback);
	}

	protected abstract draw(): void;

	// TODO replace this system
	protected frame(dt: number): void {}

	protected abstract clearScreen(): void;

	private runFrameCallbacks(dt: number) {
		while (this.frameCallbacks.length > 0) this.frameCallbacks.pop()?.(dt);
		this.frame(dt);
	}

	private drawLoop(ts?: DOMHighResTimeStamp) {
		if (ts) {
			if (this.lastFrame != null) {
				const dt = ts - this.lastFrame;
				this.runFrameCallbacks(dt);
			}
			this.lastFrame = ts;
		}
		if (this.updateScheduled) {
			this.clearScreen();
			this.draw();
			this.updateScheduled = false;
		}
		if (this._running) requestAnimationFrame((ts) => this.drawLoop(ts));
	}
}

export default Renderer;
