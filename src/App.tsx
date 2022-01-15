import React from "react";
import { CssBaseline } from "@mui/material";
import WebGLCanvas from "./render/WebGLCanvas";
import Renderer from "./render/renderer";

const vsSource = `
	attribute vec4 aVertexPosition;

	uniform mat2 uViewportTransform;
	uniform vec2 uViewportTranslation;

	void main() {
		vec2 translated = uViewportTransform * vec2(aVertexPosition) + uViewportTranslation;
		gl_Position = vec4(translated.x, translated.y, 0.0, 1.0);
	}
`;

const fsSource = `
	#ifdef GL_ES
	precision mediump float;
	#endif

	uniform vec2 uViewportSize;

	void main() {
		gl_FragColor = vec4(0.3, gl_FragCoord.x / uViewportSize.x, gl_FragCoord.y / uViewportSize.y, 1.0);
	}
`;

const App = () => (
	<>
		<CssBaseline />
		<WebGLCanvas
			width={640}
			height={480}
			callback={(gl, width, height) => {
				const renderer = new Renderer(gl, width, height);
				renderer.viewport.scaleBy(100);
				renderer.start([
					{
						type: gl.VERTEX_SHADER,
						source: vsSource
					},
					{
						type: gl.FRAGMENT_SHADER,
						source: fsSource
					}
				]);
			}}
		/>
	</>
);

export default App;
