import React, {
	useCallback,
	PropsWithChildren,
	useRef,
	useEffect
} from "react";
import Viewport from "../render/viewport";
import { Point } from "../utils/geometry";
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

	const onWheel = useCallback(
		(evt: WheelEvent) => {
			evt.preventDefault();
			const factor = Math.pow(2, evt.deltaY * -0.0008);
			viewport.zoom(factor, new Point(evt.offsetX, evt.offsetY));
		},
		[viewport]
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
		touchesRef.current = evt.touches;
	}, []);
	const onTouchMove = useCallback(
		(evt: TouchEvent) => {
			evt.preventDefault();
			if (touchesRef.current) {
				const gestures = recognizeGestures(
					evt.changedTouches,
					touchesRef.current
				);
				console.log(evt.changedTouches.length, touchesRef.current.length);
				viewport.translate(gestures.translation);
				viewport.zoom(gestures.zoom, gestures.zoomCenter);
			}
			touchesRef.current = evt.touches;
		},
		[viewport]
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
