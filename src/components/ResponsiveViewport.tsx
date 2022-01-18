import {
	WheelEvent,
	MouseEvent,
	useCallback,
	PropsWithChildren,
	useRef
} from "react";
import Viewport from "../render/viewport";

interface ResponsiveViewportProps {
	viewport: Viewport;
}

const ResponsiveViewport = ({
	viewport,
	children
}: PropsWithChildren<ResponsiveViewportProps>) => {
	const dragging = useRef(false);
	const onWheel = useCallback(
		(evt: WheelEvent) => {
			evt.preventDefault();
			const factor = Math.pow(2, evt.deltaY * -0.0008);
			viewport.scaleBy(factor);
			// viewport.translate(
			// 	// TODO this is also terrible
			// 	((1 - factor) * (evt.pageX - viewport.width / 2)) / viewport.height,
			// 	(((1 - factor) * (viewport.height - evt.pageY)) / 2 / viewport.height) *
			// 		viewport.aspectRatio
			// );
		},
		[viewport]
	);
	const onMouseDown = useCallback((evt: MouseEvent) => {
		evt.preventDefault();
		dragging.current = true;
	}, []);
	const onMouseUp = useCallback((evt: MouseEvent) => {
		evt.preventDefault();
		dragging.current = false;
	}, []);
	const onMouseMove = useCallback(
		(evt: MouseEvent) => {
			evt.preventDefault();
			if (dragging.current) {
				viewport.translate(
					evt.movementX / viewport.height,
					// TODO this is dumb, make this make sense
					(-evt.movementY / viewport.height) * viewport.aspectRatio
				);
				console.log(viewport.scale);
			}
		},
		[viewport]
	);
	return (
		<div
			onWheel={onWheel}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseMove={onMouseMove}
		>
			{children}
		</div>
	);
};

export default ResponsiveViewport;

export type { ResponsiveViewportProps };
