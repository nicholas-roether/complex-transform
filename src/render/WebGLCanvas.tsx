import React from "react";

interface WebGLCanvasProps {
	width: number;
	height: number;
	callback: (gl: WebGLRenderingContext, width: number, height: number) => void;
}

const WebGLCanvas = ({ width, height, callback }: WebGLCanvasProps) => {
	const canvasRef = React.createRef<HTMLCanvasElement>();

	React.useEffect(() => {
		if (!canvasRef.current) return console.error("WebGL canvas not found");
		const gl = canvasRef.current.getContext("webgl");
		if (!gl) {
			alert(
				"WebGL initialization failed. Make sure that your device and your browser support WebGL."
			);
			return;
		}
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		callback(gl, canvasRef.current.width, canvasRef.current.height);
	}, [callback, canvasRef]);

	return (
		<canvas ref={canvasRef} width={width} height={height}>
			Canvas rendering is not supported by your browser.
		</canvas>
	);
};

export default WebGLCanvas;

export type { WebGLCanvasProps };
