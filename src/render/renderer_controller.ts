import ChangeNotifier from "../utils/change_notifier";
import { clamp } from "../utils/math";
import Viewport from "./viewport";

class RendererController extends ChangeNotifier {
	public readonly viewport: Viewport;

	private _axesShown = true;
	private _animationTime = 0;
	private _playing = false;

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

	public get playing() {
		return this._playing;
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
		this.notify("settings");
	}

	public setAnimationTime(time: number) {
		this._animationTime = clamp(time, 0, 1);
		this.notify("transform");
		this.notify("player");
	}

	public play(speed = 0.2) {
		this._playing = true;
		const stepAnimation = (dt: number) => {
			this.setAnimationTime(this.animationTime + (dt * speed) / 1000);
		};
		let lastTime: DOMHighResTimeStamp | null = null;
		const nextFrame = (time: DOMHighResTimeStamp) => {
			if (lastTime != null) {
				const dt = time - lastTime;
				stepAnimation(dt);
			}
			if (this.animationTime < 1) {
				if (this.playing)
					window.requestAnimationFrame((time) => nextFrame(time));
			} else {
				this._playing = false;
			}
			lastTime = time;
			this.notify("player");
		};
		window.requestAnimationFrame((time) => nextFrame(time));
	}

	public pause() {
		this._playing = false;
		this.notify("player");
	}
}

export default RendererController;
