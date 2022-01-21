import ChangeNotifier from "../utils/change_notifier";

class Viewport extends ChangeNotifier {
	public readonly width: number;
	public readonly height: number;
	private static readonly BASE_SCALE = 0.25;
	private _translation: [number, number] = [0, 0];
	private _scale: number = 1;

	constructor(width: number, height: number) {
		super();
		this.width = width;
		this.height = height;
	}

	public translateX(dx: number) {
		this._translation[0] += dx;
		this.notify();
	}

	public translateY(dy: number) {
		this._translation[1] += dy;
		this.notify();
	}

	public translate(dx: number, dy: number) {
		this._translation[0] += dx;
		this._translation[1] += dy;
		this.notify();
	}

	public moveTo(x: number, y: number) {
		this._translation = [x, y];
		this.notify();
	}

	public scaleBy(factor: number) {
		this._scale *= factor;
		this.notify();
	}

	public setScale(scale: number) {
		this._scale = scale;
		this.notify();
	}

	public toViewportSpace(
		pos: [nomalizedX: number, normalizedY: number]
	): [viewportX: number, viewportY: number] {
		return [pos[0], pos[1] / this.aspectRatio];
	}

	public toNormalized(
		pos: [viewportX: number, viewportY: number]
	): [normalizedX: number, normalizedY: number] {
		return [pos[0], pos[1] * this.aspectRatio];
	}

	public get aspectRatio() {
		return this.width / this.height;
	}

	public get translation() {
		return this._translation;
	}

	public get scale() {
		return this._scale;
	}

	public get screenspaceMatrix(): [number, number, number, number] {
		let widthFactor = 1 / this.aspectRatio;
		let heightFactor = 1;
		if (this.height > this.width) {
			heightFactor = this.aspectRatio;
			widthFactor = 1;
		}
		return [
			this.scale * Viewport.BASE_SCALE * widthFactor,
			0,
			0,
			this.scale * Viewport.BASE_SCALE * heightFactor
		];
	}

	public get translationVector(): [number, number] {
		return [
			(2 * this.translation[0]) / this.width,
			(-2 * this.translation[1]) / this.height
		];
	}
}

export default Viewport;
