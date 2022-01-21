class Point {
	public static readonly ORIGIN = new Point(0, 0);

	public readonly x: number;
	public readonly y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public add(other: Point): Point;
	public add(x: number, y: number): Point;
	public add(a1: number | Point, a2?: number) {
		const p = Point.from(a1, a2);
		return new Point(this.x + p.x, this.y + p.y);
	}

	public subtract(other: Point): Point;
	public subtract(x: number, y: number): Point;
	public subtract(a1: number | Point, a2?: number) {
		return this.add(Point.from(a1, a2).scale(-1));
	}

	public scale(factor: number): Point {
		return new Point(factor * this.x, factor * this.y);
	}

	public setX(newX: number) {
		return new Point(newX, this.y);
	}

	public setY(newY: number) {
		return new Point(this.x, newY);
	}

	public addX(dx: number) {
		return this.add(dx, 0);
	}

	public addY(dy: number) {
		return this.add(0, dy);
	}

	public get tuple(): [number, number] {
		return [this.x, this.y];
	}

	public static from(point: Point): Point;
	public static from(x: number, y: number): Point;
	public static from(a1: Point | number, a2?: number): Point;
	public static from(a1: Point | number, a2?: number): Point {
		if (a1 instanceof Point) return a1;
		return new Point(a1, a2 ?? 0);
	}
}

class Matrix {
	public readonly basisX: Point;
	public readonly basisY: Point;

	constructor(x1: number, y1: number, x2: number, y2: number);
	constructor(basisX: Point, basisY: Point);
	constructor(
		a1: Point | number,
		a2: Point | number,
		a3?: number,
		a4?: number
	) {
		if (a1 instanceof Point && a2 instanceof Point) {
			this.basisX = a1;
			this.basisY = a2;
		} else if (typeof a1 == "number" && typeof a2 == "number") {
			this.basisX = new Point(a1, a2);
			this.basisY = new Point(a3 ?? 0, a4 ?? 0);
		} else throw new Error("Invalid Arguments");
	}

	public get x1() {
		return this.basisX.x;
	}

	public get y1() {
		return this.basisX.y;
	}

	public get x2() {
		return this.basisY.x;
	}

	public get y2() {
		return this.basisY.y;
	}

	public get tuple(): [number, number, number, number] {
		return [...this.basisX.tuple, ...this.basisY.tuple];
	}
}

export { Point, Matrix };
