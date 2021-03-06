import { CssBaseline } from "@mui/material";
import Viewport from "./render/viewport";
import RendererController from "./render/renderer_controller";
import TransformationView from "./components/TransformationView";

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
			<TransformationView rendererController={rendererController} />
		</>
	);
};

export default App;
