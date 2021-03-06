import ChangeNotifier from "../utils/change_notifier";
import { Matrix, Point } from "../utils/geometry";

class Viewport extends ChangeNotifier {
	private static readonly BASE_SCALE = 0.25;

	public readonly pixelDensity: number;
	private _width: number;
	private _height: number;
	private _translation = Point.ORIGIN;
	private _scale: number = 1;

	constructor(frameWidth: number, frameHeight: number, pixelDensity = 1) {
		super();
		this._width = frameWidth * pixelDensity;
		this._height = frameHeight * pixelDensity;
		this.pixelDensity = pixelDensity;
	}

	public get width(): number {
		return this._width;
	}

	public get height(): number {
		return this._height;
	}

	public get frameWidth(): number {
		return this.width / this.pixelDensity;
	}

	public get frameHeight(): number {
		return this.height / this.pixelDensity;
	}

	public get translation(): Point {
		return this._translation;
	}

	public get scale(): number {
		return this._scale;
	}

	public get coordWidth(): number {
		return this.width / this.coordToFrameFactor;
	}

	public get coordHeight(): number {
		return this.height / this.coordToFrameFactor;
	}

	public get coordTranslation(): Point {
		const scaled = this.translation.scale(1 / this.coordToFrameFactor);
		return new Point(scaled.x, -scaled.y);
	}

	private get smallestSide() {
		return this.width > this.height ? this.height : this.width;
	}

	private get coordToFrameFactor(): number {
		return this.smallestSide * Viewport.BASE_SCALE * this.scale;
	}

	public canvasToCoordSpace(pos: Point): Point;
	public canvasToCoordSpace(x: number, y: number): Point;
	public canvasToCoordSpace(a1: Point | number, a2?: number) {
		const pos = Point.from(a1, a2);
		return new Point(pos.x, -pos.y)
			.subtract(this.width / 2, -this.height / 2)
			.scale(1 / this.coordToFrameFactor)
			.subtract(this.coordTranslation.x, this.coordTranslation.y);
	}

	public coordToCanvasSpace(pos: Point): Point;
	public coordToCanvasSpace(x: number, y: number): Point;
	public coordToCanvasSpace(a1: Point | number, a2?: number) {
		const pos = Point.from(a1, a2);
		return new Point(pos.x, -pos.y)
			.add(this.coordTranslation.x, -this.coordTranslation.y)
			.scale(this.coordToFrameFactor)
			.add(this.width / 2, this.height / 2);
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

	public frameToCanvasSpace(pos: Point): Point;
	public frameToCanvasSpace(x: number, y: number): Point;
	public frameToCanvasSpace(a1: Point | number, a2?: number) {
		const pos = Point.from(a1, a2);
		return pos.scale(this.pixelDensity);
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
}

export default Viewport;
