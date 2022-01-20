interface Gestures {
	translation: [number, number];
	zoom: number;
	zoomCenter: [number, number];
}

function getTouch(touches: Touch[], id: number): Touch | null {
	return touches.find((t) => t.identifier === id) ?? null;
}

function hasTouch(touches: Touch[], id: number): boolean {
	return getTouch(touches, id) != null;
}

function averagePosition(touches: Touch[]): [number, number] {
	const pos = touches.reduce<[number, number]>(
		(acc, t) => [acc[0] + t.pageX, acc[1] + t.pageY],
		[0, 0]
	);
	pos[0] /= touches.length;
	pos[1] /= touches.length;
	return pos;
}

function averageDistance(touches: Touch[], x: number, y: number) {
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
		return { translation: [0, 0], zoom: 1, zoomCenter: [0, 0] };

	if (touches.length !== prevTouches.length)
		console.warn("Something weird's going on in the gesture recognition!");

	const avgPos = averagePosition(touches);
	const prevAvgPos = averagePosition(prevTouches);
	const avgDistance = averageDistance(touches, ...avgPos);
	const prevAvgDistance = averageDistance(prevTouches, ...prevAvgPos);

	return {
		translation: [avgPos[0] - prevAvgPos[0], avgPos[1] - prevAvgPos[1]],
		zoom: prevAvgDistance !== 0 ? avgDistance / prevAvgDistance : 1,
		zoomCenter: avgPos
	};
}

export { recognizeGestures };
