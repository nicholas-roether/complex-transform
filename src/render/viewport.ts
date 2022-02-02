import ChangeNotifier from "../utils/change_notifier";
import { Matrix, Point } from "../utils/geometry";

class Viewport extends ChangeNotifier {
	private static readonly BASE_SCALE = 0.25;
	private _width: number;
	private _height: number;
	private _translation = Point.ORIGIN;
	private _scale: number = 1;

	constructor(width: number, height: number) {
		super();
		this._width = width;
		this._height = height;
	}

	public get width(): number {
		return this._width;
	}

	public get height(): number {
		return this._height;
	}

	public get translation(): Point {
		return this._translation;
	}

	public get scale(): number {
		return this._scale;
	}

	public get coordWidth(): number {
		return this.width / this.coordToScreenFactor;
	}

	public get coordHeight(): number {
		return this.height / this.coordToScreenFactor;
	}

	public get coordTranslation(): Point {
		const scaled = this.translation.scale(1 / this.coordToScreenFactor);
		return new Point(scaled.x, -scaled.y);
	}

	private get smallestSide() {
		return this.width > this.height ? this.height : this.width;
	}

	private get coordToScreenFactor(): number {
		return this.smallestSide * Viewport.BASE_SCALE * this.scale;
	}

	public canvasToCoordSpace(pos: Point): Point;
	public canvasToCoordSpace(x: number, y: number): Point;
	public canvasToCoordSpace(a1: Point | number, a2?: number) {
		const pos = Point.from(a1, a2);
		return new Point(pos.x, -pos.y)
			.subtract(this.width / 2, -this.height / 2)
			.scale(1 / this.coordToScreenFactor)
			.subtract(this.coordTranslation.x, this.coordTranslation.y);
	}

	public coordToCanvasSpace(pos: Point): Point;
	public coordToCanvasSpace(x: number, y: number): Point;
	public coordToCanvasSpace(a1: Point | number, a2?: number) {
		const pos = Point.from(a1, a2);
		return new Point(pos.x, -pos.y)
			.add(this.coordTranslation.x, -this.coordTranslation.y)
			.scale(this.coordToScreenFactor)
			.add(this.width / 2, this.height / 2);

		// TODO invert y axis canvas <--> coord!
	}

	public coordToNormalizedSpace(pos: Point): Point;
	public coordToNormalizedSpace(x: number, y: number): Point;
	public coordToNormalizedSpace(a1: Point | number, a2?: number) {
		const pos = Point.from(a1, a2);
		return new Point(
			(2 * pos.x) / this.coordWidth,
			(2 * pos.y) / this.coordHeight
		);
	}

	public normalizedToCoordSpace(pos: Point): Point;
	public normalizedToCoordSpace(x: number, y: number): Point;
	public normalizedToCoordSpace(a1: Point | number, a2?: number) {
		const pos = Point.from(a1, a2);
		return new Point(
			(this.coordWidth * pos.x) / 2,
			(this.coordHeight * pos.y) / 2
		);
	}

	public resize(width: number, height: number) {
		this._width = width;
		this._height = height;
		this.notify();
	}

	public setWidth(width: number) {
		this._width = width;
		this.notify();
	}

	public setHeight(height: number) {
		this._height = height;
		this.notify();
	}

	public translateX(dx: number) {
		this._translation = this._translation.addX(dx);
		this.notify();
	}

	public translateY(dy: number) {
		this._translation = this._translation.addY(dy);
		this.notify();
	}

	public translate(vec: Point): void;
	public translate(dx: number, dy: number): void;
	public translate(a1: Point | number, a2?: number) {
		this._translation = this._translation.add(Point.from(a1, a2));
		this.notify();
	}

	public moveTo(pos: Point): void;
	public moveTo(x: number, y: number): void;
	public moveTo(a1: Point | number, a2?: number) {
		this._translation = Point.from(a1, a2);
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

	public zoom(factor: number, canvasPos: Point): void;
	public zoom(factor: number, canvasX: number, canvasY: number): void;
	public zoom(factor: number, a2: Point | number, a3?: number) {
		const canvasPos = Point.from(a2, a3);
		const canvasAroundCenter = canvasPos
			.subtract(this.translation)
			.subtract(this.width / 2, this.height / 2);
		const translation = canvasAroundCenter.scale(1 - factor);
		this._scale *= factor;
		this._translation = this.translation.add(translation);
		this.notify();
	}

	public get normalizedTranslationVector(): Point {
		return this.coordToNormalizedSpace(this.coordTranslation);
	}

	public get normalizedToCoordSpaceMatrix(): Matrix {
		const i = this.coordToNormalizedSpace(1, 0);
		const j = this.coordToNormalizedSpace(0, -1);
		return new Matrix(i, j);
	}

	// public get aspectRatio() {
	// 	return this.width / this.height;
	// }

	// public get coordWidth() {
	// 	const widthFactor = this.getSideFactors()[0];
	// 	return (this.width * Viewport.BASE_SCALE * this.scale) / widthFactor;
	// }

	// public get coordHeight() {
	// 	const heightFactor = this.getSideFactors()[1];
	// 	return (this.height * Viewport.BASE_SCALE * this.scale) / heightFactor;
	// }

	// public get screenspaceMatrix(): Matrix {
	// 	const [widthFactor, heightFactor] = this.getSideFactors();
	// 	return new Matrix(
	// 		this.scale * Viewport.BASE_SCALE * widthFactor,
	// 		0,
	// 		0,
	// 		this.scale * Viewport.BASE_SCALE * heightFactor
	// 	);
	// }

	// public get translationVector(): Point {
	// 	return new Point(
	// 		(2 * this.translation.x) / this.width,
	// 		(-2 * this.translation.y) / this.height
	// 	);
	// }

	// private getSideFactors(): [number, number] {
	// 	let widthFactor = 1 / this.aspectRatio;
	// 	let heightFactor = 1;
	// 	if (this.height > this.width) {
	// 		heightFactor = this.aspectRatio;
	// 		widthFactor = 1;
	// 	}
	// 	return [widthFactor, heightFactor];
	// }

	// private get smallSideLength() {
	// 	return this.width > this.height ? this.width : this.height;
	// }
}

export default Viewport;
