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

	const onWheel = useCallback(
		(evt: WheelEvent) => {
			evt.preventDefault();
			const factor = Math.pow(2, evt.deltaY * -0.0008);
			viewport.zoom(
				factor,
				viewport.frameToCanvasSpace(evt.offsetX, evt.offsetY)
			);
		},
		[viewport]
	);
	const onMouseDown = useCallback((evt: React.MouseEvent) => {
		if (evt.button === 0) {
			evt.preventDefault();
			if (divRef.current) divRef.current.style.cursor = "grabbing";
			dragging.current = true;
		}
	}, []);
	const onMouseUp = useCallback((evt: MouseEvent) => {
		if (evt.button === 0) {
			evt.preventDefault();
			if (divRef.current) divRef.current.style.cursor = "default";
			dragging.current = false;
		}
	}, []);
	const onMouseMove = useCallback(
		(evt: MouseEvent) => {
			evt.preventDefault();
			if (dragging.current) {
				viewport.translate(
					viewport.frameToCanvasSpace(evt.movementX, evt.movementY)
				);
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
				viewport.translate(viewport.frameToCanvasSpace(gestures.translation));
				viewport.zoom(
					gestures.zoom,
					viewport.frameToCanvasSpace(gestures.zoomCenter)
				);
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
		document.body.addEventListener("mousemove", onMouseMove);
	}, [onMouseMove, onMouseUp, onTouchMove, onTouchStart, onWheel]);
	return (
		<div onMouseDown={onMouseDown} ref={divRef}>
			{children}
		</div>
	);
};

export default ResponsiveViewport;

export type { ResponsiveViewportProps };
