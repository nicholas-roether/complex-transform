import WebGLRenderer from "./webgl_renderer";
import lineVertTemplateStr from "./shaders/vertex.template.glsl";
import lineFrag from "./shaders/fragment.glsl";
import { Point } from "../utils/geometry";
import RendererController from "./renderer_controller";
import { ChangeCallbackID } from "../utils/change_notifier";
import GLSLTemplate from "./glsl_template";
import { transpileMathToGLSL } from "../math_language/transpile";

const lineVertTemplate = new GLSLTemplate(lineVertTemplateStr);

interface BufferSectionMapping {
	color: [r: number, g: number, b: number];
	length: number;
}

interface GridVertexMesh {
	buffer: Float32Array;
	segmentLengths: number[];
}

class TransformRenderer extends WebGLRenderer {
	private static readonly GRID_SIZE = 60;
	private static readonly SUBDIVISION = 5;
	private static readonly SEGMENTS = 200;
	private static LINE_LENGTH = this.GRID_SIZE * this.SEGMENTS + 1;
	private static _gridVertexMesh?: GridVertexMesh;
	private static _bufferSectionMappings?: BufferSectionMapping[];
	private readonly lineShaderProgram: WebGLProgram;
	private color: [r: number, g: number, b: number] = [0, 0, 0];
	private readonly controller: RendererController;
	private controllerListener?: ChangeCallbackID;

	private get gridVertexMesh(): GridVertexMesh {
		if (!TransformRenderer._gridVertexMesh)
			TransformRenderer.generateGridVertices();
		if (!TransformRenderer._gridVertexMesh)
			throw new Error("Grid vertex generation failed due to unknown reasons.");
		return TransformRenderer._gridVertexMesh;
	}

	private get vertexBuffer(): Float32Array {
		return this.gridVertexMesh.buffer;
	}

	private get bufferSectionMappings() {
		if (!TransformRenderer._bufferSectionMappings) {
			TransformRenderer.generateBufferSectionMappings(
				this.gridVertexMesh.segmentLengths
			);
		}
		if (!TransformRenderer._bufferSectionMappings) {
			throw new Error(
				"Buffer section mapping generation failed due to unknown reasons."
			);
		}
		return TransformRenderer._bufferSectionMappings;
	}

	constructor(
		rendererController: RendererController,
		gl: WebGL2RenderingContext
	) {
		super(rendererController.viewport, gl);
		this.controller = rendererController;
		this.lineShaderProgram = this.compileProgram([
			{
				type: this.gl.VERTEX_SHADER,
				source: lineVertTemplate.generate({
					TRANSFORM_FUNCTION: transpileMathToGLSL("sqrt(z)")
				})
			},
			{ type: this.gl.FRAGMENT_SHADER, source: lineFrag }
		]);
		this.pushUniform({
			name: "uTime",
			setter: (location) =>
				this.gl.uniform1f(location, this.controller.animationTime)
		});
		this.pushUniform({
			name: "uColor",
			setter: (location) => this.gl.uniform3fv(location, this.color)
		});
		this.pushAttribute({
			name: "aVertexPosition",
			type: this.gl.FLOAT,
			size: 2
		});
		this.setAttributeBuffer(
			"aVertexPosition",
			this.vertexBuffer,
			this.gl.STATIC_DRAW
		);
	}

	public run(): void {
		this.controllerListener = this.controller.onChange("transform", () =>
			this.update()
		);
		super.run();
	}

	public stop(): void {
		if (this.controllerListener)
			this.controller.unregisterCallback(this.controllerListener);
		super.stop();
	}

	protected draw(): void {
		this.gl.useProgram(this.lineShaderProgram);
		this.color = [0.2, 0.2, 0.2];
		this.setUniforms(this.lineShaderProgram);
		this.setVertexAttributes(this.lineShaderProgram);

		let position = 0;
		for (const mapping of this.bufferSectionMappings) {
			this.color = mapping.color;
			this.setUniforms(this.lineShaderProgram, "uColor");
			this.drawLines(position, mapping.length);
			position += mapping.length;
		}

		this.resetVertexAttributes(this.lineShaderProgram);
		this.gl.useProgram(null);
	}

	private drawLines(start: number, length: number) {
		for (let i = 0; i < length; i += TransformRenderer.LINE_LENGTH) {
			this.drawLine(start + i, TransformRenderer.LINE_LENGTH);
		}
	}

	private drawLine(start: number, length: number) {
		this.gl.drawArrays(this.gl.LINE_STRIP, start, length);
	}

	private static generateBufferSectionMappings(segmentLengths: number[]): void {
		this._bufferSectionMappings = [
			{
				color: [0.2, 0.2, 0.2],
				length: segmentLengths[0] / 2
			},
			{
				color: [0.3, 0.8, 1.0],
				length: segmentLengths[1] / 2
			},
			{
				color: [0.3, 0.4, 1.0],
				length: segmentLengths[2] / 2
			}
		];
	}

	private static generateGridVertices(): void {
		const verticalLine = (x: number) =>
			this.generateSegmentedLine(
				new Point(x, -halfSize),
				new Point(x, halfSize),
				this.SEGMENTS
			);
		const horizontalLine = (y: number) =>
			this.generateSegmentedLine(
				new Point(-halfSize, y),
				new Point(halfSize, y),
				this.SEGMENTS
			);

		const halfSize = this.GRID_SIZE / 2;
		const axisVertices: number[] = [];
		for (const vertex of horizontalLine(0)) axisVertices.push(vertex);
		for (const vertex of verticalLine(0)) axisVertices.push(vertex);

		const mainVertices: number[] = [];
		for (let i = -halfSize; i <= halfSize; i++) {
			if (i === 0) continue;
			for (const vertex of horizontalLine(i)) mainVertices.push(vertex);
			for (const vertex of verticalLine(i)) mainVertices.push(vertex);
		}

		const subVertices: number[] = [];
		const subStep = 1 / this.SUBDIVISION;
		for (let i = -halfSize; i <= halfSize; i += subStep) {
			// Account for floating point errors
			if (Math.abs(i % 1) < subStep / 2) continue;
			for (const vertex of horizontalLine(i)) subVertices.push(vertex);
			for (const vertex of verticalLine(i)) subVertices.push(vertex);
		}

		const bufferArray: number[] = [];
		for (const vertex of subVertices) bufferArray.push(vertex);
		for (const vertex of mainVertices) bufferArray.push(vertex);
		for (const vertex of axisVertices) bufferArray.push(vertex);

		this._gridVertexMesh = {
			buffer: new Float32Array(bufferArray),
			segmentLengths: [
				subVertices.length,
				mainVertices.length,
				axisVertices.length
			]
		};
	}

	private static generateSegmentedLine(
		start: Point,
		end: Point,
		segments: number
	): number[] {
		const vertices: number[] = [];
		const difference = end.subtract(start);
		const width = difference.x;
		const height = difference.y;
		const step = 1 / segments;
		for (let i = 0; i <= width * segments; i++) {
			for (let j = 0; j <= height * segments; j++) {
				const x = start.x + i * step;
				const y = start.y + j * step;
				vertices.push(x, y);
			}
		}
		return vertices;
	}
}

export default TransformRenderer;
