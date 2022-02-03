import ChangeNotifier from "../utils/change_notifier";
import { clamp } from "../utils/math";
import Viewport from "./viewport";

class RendererController extends ChangeNotifier {
	public readonly viewport: Viewport;

	private _axesShown = true;
	private _animationTime = 0;

	constructor(viewport: Viewport) {
		super();
		this.viewport = viewport;
	}

	public get axesShown(): boolean {
		return this._axesShown;
	}

	public get animationTime() {
		return this._animationTime;
	}

	public showAxes() {
		this._axesShown = true;
		this.notify("axes");
	}

	public hideAxes() {
		this._axesShown = false;
		this.notify("axes");
	}

	public setAxesShown(axesShown: boolean) {
		this._axesShown = axesShown;
		this.notify("axes");
	}

	public setAnimationTime(time: number) {
		this._animationTime = clamp(time, 0, 1);
		this.notify("transform");
	}

	public animateTo(time: number, duration = 5000) {
		const start = this.animationTime;
		const end = clamp(time, 0, 1);
		let current = start;
		const stepAnimation = (dt: number) => {
			current = clamp(current + dt / duration, 0, 1);
			this.setAnimationTime(start + current * (end - start));
		};
		let lastTime: DOMHighResTimeStamp | null = null;
		const nextFrame = (time: DOMHighResTimeStamp) => {
			if (lastTime != null) {
				const dt = time - lastTime;
				stepAnimation(dt);
			}
			if (this.animationTime < 1)
				window.requestAnimationFrame((time) => nextFrame(time));
			lastTime = time;
		};
		window.requestAnimationFrame((time) => nextFrame(time));
	}
}

export default RendererController;
