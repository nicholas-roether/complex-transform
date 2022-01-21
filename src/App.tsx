import { CssBaseline } from "@mui/material";
import TransformRenderer from "./render/transform_renderer";
import WebGLCanvas from "./components/WebGLCanvas";
import Viewport from "./render/viewport";
import ResponsiveViewport from "./components/ResponsiveViewport";
import Stack from "./components/Stack";
import Ctx2DCanvas from "./components/Ctx2DCanvas";
import AxisRenderer from "./render/axis_renderer";

const App = () => {
	const viewport = new Viewport(window.innerWidth, window.innerHeight);
	viewport.setScale(2);
	return (
		<>
			<CssBaseline />
			<ResponsiveViewport viewport={viewport}>
				<Stack width={viewport.width} height={viewport.height}>
					<WebGLCanvas width={viewport.width} height={viewport.height}>
						{(gl) => {
							const renderer = new TransformRenderer(viewport, gl);
							renderer.run();
						}}
					</WebGLCanvas>
					<Ctx2DCanvas width={viewport.width} height={viewport.height}>
						{(ctx) => {
							const renderer = new AxisRenderer(viewport, ctx);
							renderer.run();
						}}
					</Ctx2DCanvas>
				</Stack>
			</ResponsiveViewport>
		</>
	);
};

export default App;
