import { CssBaseline } from "@mui/material";
import TransformRenderer from "./render/transform_renderer";
import WebGLCanvas from "./components/WebGLCanvas";
import Viewport from "./render/viewport";
import ResponsiveViewport from "./components/ResponsiveViewport";
import Stack from "./components/Stack";
import Ctx2DCanvas from "./components/Ctx2DCanvas";
import AxisRenderer from "./render/axis_renderer";
import RendererController from "./render/renderer_controller";

const App = () => {
	const viewport = new Viewport(
		window.innerWidth,
		window.innerHeight,
		window.devicePixelRatio
	);
	viewport.setScale(2);
	const rendererController = new RendererController(viewport);
	return (
		<>
			<CssBaseline />
			<ResponsiveViewport viewport={viewport}>
				<Stack width={viewport.frameWidth} height={viewport.frameHeight}>
					<WebGLCanvas
						width={viewport.frameWidth}
						height={viewport.frameHeight}
					>
						{(gl) => {
							const renderer = new TransformRenderer(rendererController, gl);
							renderer.run();
						}}
					</WebGLCanvas>
					<Ctx2DCanvas
						width={viewport.frameWidth}
						height={viewport.frameHeight}
					>
						{(ctx) => {
							const renderer = new AxisRenderer(rendererController, ctx);
							renderer.run();
						}}
					</Ctx2DCanvas>
				</Stack>
			</ResponsiveViewport>
		</>
	);
};

export default App;
