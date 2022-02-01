import ChangeNotifier from "../utils/change_notifier";
import { Matrix, Point } from "../utils/geometry";

class Viewport extends ChangeNotifier {
	public readonly width: number;
	public readonly height: number;
	public static readonly BASE_SCALE = 0.25;
	private _translation = Point.ORIGIN;
	private _scale: number = 1;

	constructor(width: number, height: number) {
		super();
		this.width = width;
		this.height = height;
	}

	public translateX(dx: number) {
		this._translation = this.translation.addX(dx);
		this.notify();
	}

	public translateY(dy: number) {
		this._translation = this.translation.addY(dy);
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
	public toCoordSpace(cvsPos: Point): Point;
	public toCoordSpace(cvsX: number, cvsY: number): Point;
	public toCoordSpace(a1: Point | number, a2?: number): Point {
		const cvsPos = Point.from(a1, a2);
		const centeredCvsPos = cvsPos.subtract(this.width / 2, this.height / 2);
		const [widthFactor, heightFactor] = this.getSideFactors();
		const centeredCoordPos = new Point(
			(centeredCvsPos.x * Viewport.BASE_SCALE * this.scale) / widthFactor,
			(centeredCvsPos.y * Viewport.BASE_SCALE * this.scale) / heightFactor
		);
		return centeredCoordPos.add(this.translation);
	}

	public toCanvasSpace(coorPos: Point): Point;
	public toCanvasSpace(coordX: number, coordY: number): Point;
	public toCanvasSpace(a1: Point | number, a2?: number): Point {
		const coordPos = Point.from(a1, a2);
		const centeredCoordPos = coordPos.subtract(this.translation);
		const [widthFactor, heightFactor] = this.getSideFactors();
		const centeredCvsPos = new Point(
			(centeredCoordPos.x / this.coordWidth) * this.width,
			(centeredCoordPos.y / this.coordHeight) * this.height
		);
		return centeredCvsPos.add(this.width / 2, this.height / 2);
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

	public get coordWidth() {
		const widthFactor = this.getSideFactors()[0];
		return (this.width * Viewport.BASE_SCALE * this.scale) / widthFactor;
	}

	public get coordHeight() {
		const heightFactor = this.getSideFactors()[1];
		return (this.height * Viewport.BASE_SCALE * this.scale) / heightFactor;
	}

	public get screenspaceMatrix(): Matrix {
		const [widthFactor, heightFactor] = this.getSideFactors();
		return new Matrix(
			this.scale * Viewport.BASE_SCALE * widthFactor,
			0,
			0,
			this.scale * Viewport.BASE_SCALE * heightFactor
		);
	}

	public get translationVector(): Point {
		return new Point(
			(2 * this.translation.x) / this.width,
			(-2 * this.translation.y) / this.height
		);
	}

	private getSideFactors(): [number, number] {
		let widthFactor = 1 / this.aspectRatio;
		let heightFactor = 1;
		if (this.height > this.width) {
			heightFactor = this.aspectRatio;
			widthFactor = 1;
		}
		return [widthFactor, heightFactor];
	}

	private get smallSideLength() {
		return this.width > this.height ? this.width : this.height;
	}
}

export default Viewport;
