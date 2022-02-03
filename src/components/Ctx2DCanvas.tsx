import Renderer from "../render/renderer";
import Canvas from "./Canvas";

interface Ctx2DCanvasProps {
	width: number;
	height: number;
	children?: (ctx: CanvasRenderingContext2D) => Renderer | null | undefined;
}

const Ctx2DCanvas = ({
	width,
	height,
	children: createRenderer
}: Ctx2DCanvasProps) => (
	<Canvas width={width} height={height}>
		{(canvas) => {
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				throw new Error(
					"2D rendering context creation failed. Make sure you are using a modern browser."
				);
			}
			return createRenderer?.(ctx);
		}}
	</Canvas>
);

export default Ctx2DCanvas;

export type { Ctx2DCanvasProps };
