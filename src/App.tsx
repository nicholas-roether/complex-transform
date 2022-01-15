import React from "react";
import { CssBaseline } from "@mui/material";
import WebGLCanvas from "./render/WebGLCanvas";
import Renderer from "./render/renderer";
import fsSource from "./fragment_shader.glsl";

const App = () => (
	<>
		<CssBaseline />
		<WebGLCanvas
			width={640}
			height={480}
			callback={(gl, width, height) => {
				const renderer = new Renderer(gl, width, height);
				renderer.viewport.scaleBy(100);
				renderer.start(fsSource);
			}}
		/>
	</>
);

export default App;
