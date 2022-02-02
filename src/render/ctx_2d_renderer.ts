import Renderer from "./renderer";
import Viewport from "./viewport";

abstract class Ctx2DRenderer extends Renderer {
	protected readonly ctx: CanvasRenderingContext2D;

	constructor(viewport: Viewport, ctx: CanvasRenderingContext2D) {
		super(viewport);
		this.ctx = ctx;
	}

	protected clearScreen(): void {
		this.ctx.fillStyle = "#000";
		this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
	}
}

export default Ctx2DRenderer;
