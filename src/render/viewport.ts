class Viewport {
	public readonly canvas: HTMLCanvasElement;
	public translation: [number, number] = [0, 0];
	public scale: number = 1;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
	}

	public get width(): number {
		return this.canvas.width;
	}

	public get height(): number {
		return this.canvas.height;
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

	toViewportSpace(
		pos: [nomalizedX: number, normalizedY: number]
	): [viewportX: number, viewportY: number] {
		return [pos[0], pos[1] / this.aspectRatio];
	}

	toNormalized(
		pos: [viewportX: number, viewportY: number]
	): [normalizedX: number, normalizedY: number] {
		return [pos[0], pos[1] * this.aspectRatio];
	}

	public get aspectRatio() {
		return this.width / this.height;
	}
}

export default Viewport;
