import Ctx2DRenderer from "./ctx_2d_renderer";
import Viewport from "./viewport";

class AxisRenderer extends Ctx2DRenderer {
	private static readonly NUM_SUBDIVS = 10;

	protected draw(): void {
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(0, this.height / 2 + this.viewport.translation.y);
		this.ctx.lineTo(this.width, this.height / 2 + this.viewport.translation.y);
		this.ctx.stroke();

		const tickDifference = this.getTickDifference();
		console.log(tickDifference);
		for (
			let i = -AxisRenderer.NUM_SUBDIVS;
			i <= AxisRenderer.NUM_SUBDIVS;
			i++
		) {
			const x =
				(i *
					tickDifference *
					this.viewport.scale *
					Viewport.BASE_SCALE *
					this.viewport.height) /
				2;
			console.log(x);
			this.ctx.beginPath();
			this.ctx.moveTo(
				this.width / 2 + x + this.viewport.translation.x,
				this.height / 2 - 5 + this.viewport.translation.y
			);
			this.ctx.lineTo(
				this.width / 2 + x + this.viewport.translation.x,
				this.height / 2 + 5 + this.viewport.translation.y
			);
			this.ctx.moveTo(
				this.width / 2 - x + this.viewport.translation.x,
				this.height / 2 - 5 + this.viewport.translation.y
			);
			this.ctx.lineTo(
				this.width / 2 - x + this.viewport.translation.x,
				this.height / 2 + 5 + this.viewport.translation.y
			);
			this.ctx.stroke();
			this.ctx.fillText(i.toString(), x, this.height / 2 - 8);
		}
	}

	private getTickDifference(): number {
		const size =
			this.viewport.scale * Math.min(this.viewport.width, this.viewport.height);
		return Math.floor(size) / AxisRenderer.NUM_SUBDIVS;
	}

	private get width() {
		return this.viewport.width;
	}

	private get height() {
		return this.viewport.height;
	}
}

export default AxisRenderer;
