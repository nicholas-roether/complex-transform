import { ChangeCallbackID } from "../utils/change_notifier";
import { Point } from "../utils/geometry";
import Ctx2DRenderer from "./ctx_2d_renderer";
import RendererController from "./renderer_controller";

function numToString(number: number): string {
	const notation = Math.abs(number) <= 0.0001 ? "scientific" : "standard";
	return number.toLocaleString("fullwide", {
		maximumSignificantDigits: 2,
		notation
	});
}

class AxisRenderer extends Ctx2DRenderer {
	private readonly rendererController;
	private readonly numSubdivs;
	private readonly tickLength;
	private readonly tickLabelDist;

	private controllerListener?: ChangeCallbackID;

	constructor(
		rendererController: RendererController,
		ctx: CanvasRenderingContext2D
	) {
		super(rendererController.viewport, ctx);
		this.rendererController = rendererController;
		this.numSubdivs = 5 / this.viewport.pixelDensity;
		this.tickLength = 5 * this.viewport.pixelDensity;
		this.tickLabelDist = 20 * this.viewport.pixelDensity;
	}

	public run(): void {
		this.controllerListener = this.rendererController.onChange("axes", () =>
			this.update()
		);
		super.run();
	}

	public stop(): void {
		if (this.controllerListener)
			this.rendererController.unregisterCallback(this.controllerListener);
		super.stop();
	}

	private getTickSpacing(): number {
		const ideal = Math.min(
			this.viewport.coordWidth / this.numSubdivs,
			this.viewport.coordHeight / this.numSubdivs
		);

		const powOfTen = 10 ** Math.floor(Math.log10(ideal));
		const options = [powOfTen, 2 * powOfTen, 5 * powOfTen];
		const sortedOptions = options.sort(
			(a, b) => Math.abs(a - ideal) - Math.abs(b - ideal)
		);
		return sortedOptions[0];
	}

	protected draw(): void {
		if (!this.rendererController.axesShown) return;
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

		const fontSize = 13 * this.viewport.pixelDensity;
		// TODO adjust font
		this.ctx.font = `${fontSize}px sans-serif`;

		for (let i = xTickmarkStart; i <= xTickmarkEnd; i++) {
			if (i === 0) continue;
			const pos = this.viewport.coordToCanvasSpace(i * tickSpacing, 0);
			this.drawTickmark(pos.x, pos.y, "vertical");
			this.ctx.fillStyle = "#fff";
			this.ctx.textAlign = "center";
			this.ctx.fillText(
				numToString(i * tickSpacing),
				pos.x,
				pos.y + this.tickLabelDist
			);
		}
		for (let i = yTickmarkStart; i <= yTickmarkEnd; i++) {
			if (i === 0) continue;
			const pos = this.viewport.coordToCanvasSpace(0, i * tickSpacing);
			this.drawTickmark(pos.x, pos.y, "horizontal");
			this.ctx.fillStyle = "#fff";
			this.ctx.textAlign = "right";
			this.ctx.textBaseline = "middle";
			this.ctx.fillText(
				numToString(i * tickSpacing) + "i",
				pos.x - this.tickLabelDist,
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
		const start = dirVec.scale(-this.tickLength).add(x, y);
		const end = dirVec.scale(this.tickLength).add(x, y);

		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(end.x, end.y);
		this.ctx.stroke();
	}
}

export default AxisRenderer;
