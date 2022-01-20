import styled from "@emotion/styled";
import React, { useRef } from "react";

interface CanvasProps {
	width?: number;
	height?: number;
	children?: (canvas: HTMLCanvasElement) => void;
}

const Canvas = ({ width, height, children: callback }: CanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	React.useEffect(() => {
		if (!canvasRef.current) return console.error("WebGL canvas not found");
		callback?.(canvasRef.current);
	}, [callback, canvasRef]);

	const BlockCanvas = styled.canvas`
		display: block;
	`;

	return (
		<BlockCanvas ref={canvasRef} width={width} height={height}>
			Canvas rendering is not supported by your browser.
		</BlockCanvas>
	);
};

export default Canvas;

export type { CanvasProps as WebGLCanvasProps };
