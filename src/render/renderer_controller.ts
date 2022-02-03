import ChangeNotifier from "../utils/change_notifier";
import Viewport from "./viewport";

class RendererController extends ChangeNotifier {
	public readonly viewport: Viewport;

	private _axesShown = true;

	constructor(viewport: Viewport) {
		super();
		this.viewport = viewport;
	}

	public get axesShown(): boolean {
		return this._axesShown;
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
}

export default RendererController;
