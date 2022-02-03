import styled from "@emotion/styled";
import React, { useRef } from "react";
import Renderer from "../render/renderer";

interface CanvasProps {
	width: number;
	height: number;
	children?: (canvas: HTMLCanvasElement) => Renderer | null | undefined;
}

const BlockCanvas = styled.canvas`
	display: block;
`;

const Canvas = ({ width, height, children: createRenderer }: CanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const renderer = useRef<Renderer | null>(null);

	React.useEffect(() => {
		if (!canvasRef.current) return console.error("WebGL canvas not found");
		renderer.current?.stop();
		renderer.current = createRenderer?.(canvasRef.current) ?? null;
		renderer.current?.run();
	}, [canvasRef, createRenderer]);

	return (
		<BlockCanvas
			ref={canvasRef}
			width={width * window.devicePixelRatio}
			height={height * window.devicePixelRatio}
			style={{
				width,
				height
			}}
		>
			Canvas rendering is not supported by your browser.
		</BlockCanvas>
	);
};

export default Canvas;

export type { CanvasProps as WebGLCanvasProps };
