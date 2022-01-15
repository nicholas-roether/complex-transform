import AffineTransform2D from "./affine_transform";

class Viewport {
	public translation: [number, number] = [0, 0];
	public scale: number = 1;

	public readonly width: number;
	public readonly height: number;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
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
		return {
			matrix: [this.scale, 0, 0, this.scale / this.aspectRatio],
			translation: this.translation
		};
	}

	getInverseAffineTransform(): AffineTransform2D {
		return {
			matrix: [1 / this.scale, 0, 0, this.aspectRatio / this.scale],
			translation: [-this.translation[0], -this.translation[1]]
		};
	}

	public get aspectRatio() {
		return this.width / this.height;
	}
}

export default Viewport;
