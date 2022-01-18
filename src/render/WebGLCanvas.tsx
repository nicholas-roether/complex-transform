import Canvas from "./Canvas";

class RenderContextCreationError extends Error {
	public readonly context: string;

	constructor(context: string, message: string) {
		super(message);
		this.context = context;
	}
}

interface WebGLCanvasProps {
	width?: number;
	height?: number;
	children?: (gl: WebGL2RenderingContext) => void;
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
				throw new RenderContextCreationError(
					"webgl2",
					"WebGL rendering context creation failed. Make sure your browser supports WebGL 2.0."
				);
			}
			callback?.(gl);
		}}
	</Canvas>
);

export default WebGLCanvas;

export { RenderContextCreationError };
