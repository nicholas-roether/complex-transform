import WebGLRenderer from "./webgl_renderer";
import lineVert from "./shaders/line.vert.glsl";
import lineFrag from "./shaders/line.frag.glsl";
import { Point } from "../utils/geometry";
import RendererController from "./renderer_controller";

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
	private static readonly SEGMENTS = 80;
	private static gridVertexMesh: GridVertexMesh = this.generateGridVertices();
	private static vertexBuffer = this.gridVertexMesh.buffer;
	private static LINE_LENGTH = this.GRID_SIZE * this.SEGMENTS + 1;
	private static bufferSectionMappings: BufferSectionMapping[] = [
		{
			color: [0.2, 0.2, 0.2],
			length: this.gridVertexMesh.segmentLengths[0] / 2
		},
		{
			color: [0.3, 0.8, 1.0],
			length: this.gridVertexMesh.segmentLengths[1] / 2
		},
		{
			color: [0.3, 0.4, 1.0],
			length: this.gridVertexMesh.segmentLengths[2] / 2
		}
	];

	private readonly lineShaderProgram: WebGLProgram;
	private color: [r: number, g: number, b: number] = [0, 0, 0];
	// private finished = false;
	// private time: number = 0;
	private readonly controller: RendererController;

	constructor(
		rendererController: RendererController,
		gl: WebGL2RenderingContext
	) {
		super(rendererController.viewport, gl);
		this.controller = rendererController;
		rendererController.onChange("transform", () => this.update());
		this.lineShaderProgram = this.compileProgram([
			{ type: this.gl.VERTEX_SHADER, source: lineVert },
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
			TransformRenderer.vertexBuffer,
			this.gl.STATIC_DRAW
		);
	}

	protected draw(): void {
		this.gl.useProgram(this.lineShaderProgram);
		this.color = [0.2, 0.2, 0.2];
		this.setUniforms(this.lineShaderProgram);
		this.setVertexAttributes(this.lineShaderProgram);

		let position = 0;
		for (const mapping of TransformRenderer.bufferSectionMappings) {
			this.color = mapping.color;
			this.setUniforms(this.lineShaderProgram, "uColor");
			this.drawLines(position, mapping.length);
			position += mapping.length;
		}

		this.resetVertexAttributes(this.lineShaderProgram);
		this.gl.useProgram(null);
	}

	protected frame(dt: number) {
		// if (this.finished) return;
		// this.time += dt / 5000;
		// if (this.time > 1) {
		// 	this.time = 1;
		// 	this.finished = true;
		// }
		// this.update();
	}

	private drawLines(start: number, length: number) {
		for (let i = 0; i < length; i += TransformRenderer.LINE_LENGTH) {
			this.drawLine(start + i, TransformRenderer.LINE_LENGTH);
		}
	}

	private drawLine(start: number, length: number) {
		this.gl.drawArrays(this.gl.LINE_STRIP, start, length);
	}

	private static generateGridVertices(): GridVertexMesh {
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
		const axisVertices: number[] = [...horizontalLine(0), ...verticalLine(0)];

		const mainVertices: number[] = [];
		for (let i = -halfSize; i <= halfSize; i++) {
			if (i === 0) continue;
			mainVertices.push(...horizontalLine(i));
			mainVertices.push(...verticalLine(i));
		}

		const subVertices: number[] = [];
		const subStep = 1 / this.SUBDIVISION;
		for (let i = -halfSize; i <= halfSize; i += subStep) {
			// Account for floating point errors
			if (Math.abs(i % 1) < subStep / 2) continue;
			subVertices.push(...horizontalLine(i));
			subVertices.push(...verticalLine(i));
		}

		return {
			buffer: new Float32Array([
				...subVertices,
				...mainVertices,
				...axisVertices
			]),
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
