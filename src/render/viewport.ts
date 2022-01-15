import AffineTransform2D from "./affine_transform";

class Viewport {
	public rotation: number = 0;
	public translation: [number, number] = [0, 0];
	public scale: number = 1;

	rotate(amount: number) {
		this.rotation = (this.rotation + amount) % (2 * Math.PI);
	}

	translateX(dx: number) {
		this.translation[0] += dx;
	}

	translateY(dy: number) {
		this.translation[1] += dy;
	}

	translate(dx: number, dy: number) {
		this.translateX(dx);
		this.translateY(dy);
	}

	scaleBy(factor: number) {
		this.scale *= factor;
	}

	getAffineTransform(): AffineTransform2D {
		const a = this.scale * Math.cos(this.rotation);
		const b = this.scale * Math.sin(this.rotation);
		return {
			// eslint-disable-next-line prettier/prettier
			matrix: [
				a, -b,
				b,  a
			],
			translation: this.translation
		};
	}
}

export default Viewport;
