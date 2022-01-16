import styled from "@emotion/styled";
import React from "react";
import TransformRenderer from "./transform_renderer";

interface WebGLCanvasProps {
	width: number;
	height: number;
	callback: (gl: WebGLRenderingContext, width: number, height: number) => void;
}

const WebGLCanvas = ({ width, height, callback }: WebGLCanvasProps) => {
	const canvasRef = React.createRef<HTMLCanvasElement>();

	React.useEffect(() => {
		if (!canvasRef.current) return console.error("WebGL canvas not found");
		// const gl = canvasRef.current.getContext("webgl2");
		// if (!gl) {
		// 	alert(
		// 		"WebGL initialization failed. Make sure that your device and your browser support WebGL 2.0."
		// 	);
		// 	return;
		// }
		// gl.clearColor(0, 0, 0, 1);
		// gl.clear(gl.COLOR_BUFFER_BIT);
		// callback(gl, canvasRef.current.width, canvasRef.current.height);
		const transformRenderer = new TransformRenderer(canvasRef.current);
		transformRenderer.viewport.scaleBy(0.6);
		transformRenderer.render();
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

export default WebGLCanvas;

export type { WebGLCanvasProps };
