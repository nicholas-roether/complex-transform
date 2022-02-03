import { useEffect, useState } from "react";
import AxisRenderer from "../render/axis_renderer";
import RendererController from "../render/renderer_controller";
import TransformRenderer from "../render/transform_renderer";
import AnimationControls from "./AnimationControls";
import Ctx2DCanvas from "./Ctx2DCanvas";
import ResponsiveViewport from "./ResponsiveViewport";
import Stack, { StackElement } from "./Stack";
import WebGLCanvas from "./WebGLCanvas";

interface TransformationViewProps {
	rendererController: RendererController;
}

const TransformationView = ({
	rendererController
}: TransformationViewProps) => {
	const viewport = rendererController.viewport;
	const [width, setWidth] = useState(viewport.frameWidth);
	const [height, setHeight] = useState(viewport.frameHeight);
	useEffect(() => {
		window.addEventListener("resize", () => {
			setWidth(window.innerWidth);
			setHeight(window.innerHeight);
			viewport.resize(window.innerWidth, window.innerHeight);
		});
	});
	return (
		<Stack width={width} height={height}>
			<StackElement>
				<ResponsiveViewport viewport={viewport}>
					<Stack width={width} height={height}>
						<StackElement>
							<WebGLCanvas width={width} height={height}>
								{(gl) => new TransformRenderer(rendererController, gl)}
							</WebGLCanvas>
						</StackElement>
						<StackElement>
							<Ctx2DCanvas width={width} height={height}>
								{(ctx) => new AxisRenderer(rendererController, ctx)}
							</Ctx2DCanvas>
						</StackElement>
					</Stack>
				</ResponsiveViewport>
			</StackElement>
			<AnimationControls rendererController={rendererController} />
		</Stack>
	);
};

export default TransformationView;
