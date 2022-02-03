import { Point } from "../utils/geometry";
import Ctx2DRenderer from "./ctx_2d_renderer";
import RendererController from "./renderer_controller";
// import Viewport from "./viewport";

class AxisRenderer extends Ctx2DRenderer {
	private static readonly NUM_SUBDIVS = 10;
	private static readonly TICK_LENGTH = 5;
	private static readonly TICK_LABEL_DIST = 20;

	constructor(
		rendererController: RendererController,
		ctx: CanvasRenderingContext2D
	) {
		super(rendererController.viewport, ctx);
		rendererController.onChange("axes", () => this.update());
	}

	private getTickSpacing(): number {
		const ideal = Math.min(
			this.viewport.coordWidth / AxisRenderer.NUM_SUBDIVS,
			this.viewport.coordHeight / AxisRenderer.NUM_SUBDIVS
		);

		const powOfTen = 10 ** Math.floor(Math.log10(ideal));
		const options = [powOfTen, 2 * powOfTen, 5 * powOfTen];
		const sortedOptions = options.sort(
			(a, b) => Math.abs(a - ideal) - Math.abs(b - ideal)
		);
		return sortedOptions[0];
	}

	protected draw(): void {
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(0, this.viewport.height / 2 + this.viewport.translation.y);
		this.ctx.lineTo(
			this.viewport.width,
			this.viewport.height / 2 + this.viewport.translation.y
		);
		this.ctx.moveTo(this.viewport.width / 2 + this.viewport.translation.x, 0);
		this.ctx.lineTo(
			this.viewport.width / 2 + this.viewport.translation.x,
			this.viewport.height
		);
		this.ctx.stroke();

		const tickSpacing = this.getTickSpacing();
		const tickTranslation = this.viewport.coordTranslation.scale(
			1 / tickSpacing
		);

		const numTickmarksX = Math.floor(this.viewport.coordWidth / tickSpacing);
		const numTickmarksY = Math.floor(this.viewport.coordWidth / tickSpacing);

		const xTickmarkStart = Math.round(-numTickmarksX - tickTranslation.x);
		const xTickmarkEnd = Math.round(numTickmarksX - tickTranslation.x);
		const yTickmarkStart = Math.round(-numTickmarksY - tickTranslation.y);
		const yTickmarkEnd = Math.round(numTickmarksY - tickTranslation.y);

		for (let i = xTickmarkStart; i <= xTickmarkEnd; i++) {
			if (i === 0) continue;
			const pos = this.viewport.coordToCanvasSpace(i * tickSpacing, 0);
			this.drawTickmark(pos.x, pos.y, "vertical");
			this.ctx.fillStyle = "#fff";
			this.ctx.textAlign = "center";
			this.ctx.fillText(
				(i * tickSpacing).toLocaleString("fullwide"),
				pos.x,
				pos.y + AxisRenderer.TICK_LABEL_DIST
			);
		}
		for (let i = yTickmarkStart; i <= yTickmarkEnd; i++) {
			if (i === 0) continue;
			const pos = this.viewport.coordToCanvasSpace(0, i * tickSpacing);
			this.drawTickmark(pos.x, pos.y, "horizontal");
			this.ctx.fillStyle = "#fff";
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
			this.ctx.fillText(
				(i * tickSpacing).toLocaleString("fullwide") + "i",
				pos.x - AxisRenderer.TICK_LABEL_DIST,
				pos.y
			);
		}
	}

	private drawTickmark(
		x: number,
		y: number,
		direction: "vertical" | "horizontal"
	) {
		const dirVec = direction === "vertical" ? Point.UNIT_Y : Point.UNIT_X;
		const start = dirVec.scale(-AxisRenderer.TICK_LENGTH).add(x, y);
		const end = dirVec.scale(AxisRenderer.TICK_LENGTH).add(x, y);

		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(end.x, end.y);
		this.ctx.stroke();
	}
}

export default AxisRenderer;
