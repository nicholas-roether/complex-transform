import Ctx2DRenderer from "./ctx_2d_renderer";

class AxisRenderer extends Ctx2DRenderer {
	protected draw(): void {
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(0, this.height / 2 + this.viewport.translation[1]);
		this.ctx.lineTo(this.width, this.height / 2 + this.viewport.translation[1]);
		this.ctx.stroke();
	}

	private get width() {
		return this.viewport.width;
	}

	private get height() {
		return this.viewport.height;
	}
}

export default AxisRenderer;
