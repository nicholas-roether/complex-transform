import React from "react";
import { CssBaseline } from "@mui/material";
import TransformRenderer from "./render/transform_renderer";
import WebGLCanvas from "./render/WebGLCanvas";
import Viewport from "./render/viewport";

const App = () => {
	const viewport = new Viewport(window.innerWidth, window.innerHeight);
	return (
		<>
			<CssBaseline />
			<WebGLCanvas width={viewport.width} height={viewport.height}>
				{(gl) => {
					const renderer = new TransformRenderer(viewport, gl);
					renderer.render();
				}}
			</WebGLCanvas>
		</>
	);
};

export default App;
