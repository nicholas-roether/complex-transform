import React, {
	useCallback,
	PropsWithChildren,
	useRef,
	useEffect
} from "react";
import Viewport from "../render/viewport";
import { recognizeGestures } from "../utils/gestures";

interface ResponsiveViewportProps {
	viewport: Viewport;
}

const ResponsiveViewport = ({
	viewport,
	children
}: PropsWithChildren<ResponsiveViewportProps>) => {
	const dragging = useRef(false);
	const divRef = useRef<HTMLDivElement>(null);
	const touchesRef = useRef<TouchList>();

	const getOffsetPos = useCallback(
		(screenX: number, screenY: number): [number, number] => {
			if (!divRef.current)
				throw new Error("responsive viewport div ref was null.");
			return [
				screenX -
					divRef.current.offsetLeft -
					viewport.translation[0] -
					viewport.width / 2,
				screenY -
					divRef.current.offsetTop -
					viewport.translation[1] -
					viewport.height / 2
			];
		},
		[viewport.height, viewport.translation, viewport.width]
	);

	const zoomAroundPoint = useCallback(
		(factor: number, pageX: number, pageY: number) => {
			viewport.scaleBy(factor);
			const offsetPos = getOffsetPos(pageX, pageY);
			viewport.translate(
				(1 - factor) * offsetPos[0],
				(1 - factor) * offsetPos[1]
			);
		},
		[getOffsetPos, viewport]
	);

	const onWheel = useCallback(
		(evt: WheelEvent) => {
			evt.preventDefault();
			const factor = Math.pow(2, evt.deltaY * -0.0008);
			zoomAroundPoint(factor, evt.pageX, evt.pageY);
		},
		[zoomAroundPoint]
	);
	const onMouseDown = useCallback((evt: React.MouseEvent) => {
		evt.preventDefault();
		if (divRef.current) divRef.current.style.cursor = "grabbing";
		dragging.current = true;
	}, []);
	const onMouseUp = useCallback((evt: MouseEvent) => {
		evt.preventDefault();
		if (divRef.current) divRef.current.style.cursor = "default";
		dragging.current = false;
	}, []);
	const onMouseMove = useCallback(
		(evt: React.MouseEvent) => {
			evt.preventDefault();
			if (dragging.current) {
				viewport.translate(evt.movementX, evt.movementY);
			}
		},
		[viewport]
	);
	const onTouchStart = useCallback((evt: TouchEvent) => {
		evt.preventDefault();
	}, []);
	const onTouchMove = useCallback(
		(evt: TouchEvent) => {
			evt.preventDefault();
			if (touchesRef.current) {
				const gestures = recognizeGestures(
					evt.changedTouches,
					touchesRef.current
				);
				viewport.translate(...gestures.translation);
				zoomAroundPoint(gestures.zoom, ...gestures.zoomCenter);
			}
			touchesRef.current = evt.touches;
		},
		[viewport, zoomAroundPoint]
	);

	useEffect(() => {
		divRef.current?.addEventListener("wheel", onWheel);
		divRef.current?.addEventListener("touchstart", onTouchStart);
		divRef.current?.addEventListener("touchmove", onTouchMove);
		window.addEventListener("mouseup", onMouseUp);
	}, [onMouseUp, onTouchMove, onTouchStart, onWheel]);
	return (
		<div onMouseDown={onMouseDown} onMouseMove={onMouseMove} ref={divRef}>
			{children}
		</div>
	);
};

export default ResponsiveViewport;

export type { ResponsiveViewportProps };
