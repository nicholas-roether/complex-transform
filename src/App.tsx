import React from "react";
import { CssBaseline } from "@mui/material";
import WebGLCanvas from "./render/WebGLCanvas";

const App = () => (
	<>
		<CssBaseline />
		<WebGLCanvas
			width={window.innerWidth}
			height={window.innerHeight}
			callback={(gl, width, height) => {}}
		/>
	</>
);

export default App;
