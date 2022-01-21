import { Point } from "./geometry";

interface Gestures {
	translation: Point;
	zoom: number;
	zoomCenter: Point;
}

function getTouch(touches: Touch[], id: number): Touch | null {
	return touches.find((t) => t.identifier === id) ?? null;
}

function hasTouch(touches: Touch[], id: number): boolean {
	return getTouch(touches, id) != null;
}

function averagePosition(touches: Touch[]): Point {
	const pos = touches.reduce<Point>(
		(acc, t) => acc.add(t.pageX, t.pageY),
		Point.ORIGIN
	);
	pos.scale(1 / touches.length);
	return pos;
}

function averageDistance(touches: Touch[], x: number, y: number): number {
	const acc = touches.reduce<number>(
		(acc, t) => acc + Math.sqrt((t.pageX - x) ** 2 + (t.pageY - y) ** 2),
		0
	);
	return acc / touches.length;
}

function recognizeGestures(
	touchList: TouchList,
	prevTouchList: TouchList
): Gestures {
	let touches = Array.from(touchList);
	let prevTouches = Array.from(prevTouchList);
	touches = touches.filter((t) => hasTouch(prevTouches, t.identifier));
	prevTouches = prevTouches.filter((t) => hasTouch(touches, t.identifier));

	if (touches.length === 0)
		return { translation: Point.ORIGIN, zoom: 1, zoomCenter: Point.ORIGIN };

	if (touches.length !== prevTouches.length)
		console.warn("Something weird's going on in the gesture recognition!");

	const avgPos = averagePosition(touches);
	const prevAvgPos = averagePosition(prevTouches);
	const avgDistance = averageDistance(touches, ...avgPos.tuple);
	const prevAvgDistance = averageDistance(prevTouches, ...prevAvgPos.tuple);

	return {
		translation: avgPos.subtract(prevAvgPos),
		zoom: prevAvgDistance !== 0 ? avgDistance / prevAvgDistance : 1,
		zoomCenter: avgPos
	};
}

export { recognizeGestures };
