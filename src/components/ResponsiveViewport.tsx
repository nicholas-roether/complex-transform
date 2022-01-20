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
	const divRef = useRef<HTMLDivElement>(null);

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

	const onWheel = useCallback(
		(evt: WheelEvent) => {
			const factor = Math.pow(2, evt.deltaY * -0.0008);
			viewport.scaleBy(factor);
			const offsetPos = getOffsetPos(evt.pageX, evt.pageY);
			viewport.translate(
				(1 - factor) * offsetPos[0],
				(1 - factor) * offsetPos[1]
			);
		},
		[getOffsetPos, viewport]
	);
	const onMouseDown = useCallback((evt: MouseEvent) => {
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
		(evt: MouseEvent) => {
			evt.preventDefault();
			if (dragging.current) {
				viewport.translate(evt.movementX, evt.movementY);
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
			ref={divRef}
		>
			{children}
		</div>
	);
};

export default ResponsiveViewport;

export type { ResponsiveViewportProps };
