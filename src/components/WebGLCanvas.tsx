import Renderer from "../render/renderer";
import Canvas from "./Canvas";

interface WebGLCanvasProps {
	width: number;
	height: number;
	children?: (gl: WebGL2RenderingContext) => Renderer | null | undefined;
}

const WebGLCanvas = ({
	width,
	height,
	children: callback
}: WebGLCanvasProps) => (
	<Canvas width={width} height={height}>
		{(canvas) => {
			const gl = canvas.getContext("webgl2");
			if (!gl) {
				throw new Error(
					"WebGL rendering context creation failed. Make sure your browser supports WebGL 2.0."
				);
			}
			return callback?.(gl);
		}}
	</Canvas>
);

export default WebGLCanvas;

export type { WebGLCanvasProps };
