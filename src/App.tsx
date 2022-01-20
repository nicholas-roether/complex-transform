import { CssBaseline } from "@mui/material";
import TransformRenderer from "./render/transform_renderer";
import WebGLCanvas from "./components/WebGLCanvas";
import Viewport from "./render/viewport";
import ResponsiveViewport from "./components/ResponsiveViewport";

const App = () => {
	const viewport = new Viewport(window.innerWidth, window.innerHeight);
	viewport.setScale(2);
	console.log(viewport.screenspaceMatrix);
	return (
		<>
			<CssBaseline />
			<ResponsiveViewport viewport={viewport}>
				<WebGLCanvas width={viewport.width} height={viewport.height}>
					{(gl) => {
						const renderer = new TransformRenderer(viewport, gl);
						renderer.render();
					}}
				</WebGLCanvas>
			</ResponsiveViewport>
		</>
	);
};

export default App;
