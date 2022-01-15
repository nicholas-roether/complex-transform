import React from "react";
import { CssBaseline } from "@mui/material";
import WebGLCanvas from "./render/WebGLCanvas";
import WebGLRenderer from "./render/webgl_renderer";
import fsSource from "./fragment_shader.glsl";

const App = () => (
	<>
		<CssBaseline />
		<WebGLCanvas
			width={640}
			height={480}
			callback={(gl, width, height) => {
				const renderer = new WebGLRenderer(gl, width, height);
				renderer.viewport.scaleBy(10);
				renderer.load(fsSource);
				renderer.draw();
			}}
		/>
	</>
);

export default App;
