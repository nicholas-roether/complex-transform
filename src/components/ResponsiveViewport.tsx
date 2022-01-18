import { WheelEvent, useCallback, PropsWithChildren } from "react";
import Viewport from "../render/viewport";

interface ResponsiveViewportProps {
	viewport: Viewport;
}

const ResponsiveViewport = ({
	viewport,
	children
}: PropsWithChildren<ResponsiveViewportProps>) => {
	const onWheel = useCallback(
		(evt: WheelEvent) => {
			evt.preventDefault();
			viewport.scaleBy(Math.pow(2, evt.deltaY * -0.0008));
		},
		[viewport]
	);
	return <div onWheel={onWheel}>{children}</div>;
};

export default ResponsiveViewport;

export type { ResponsiveViewportProps };
