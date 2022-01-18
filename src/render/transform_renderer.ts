import Renderer from "./webgl_renderer";
import lineVert from "./shaders/line.vert.glsl";
import lineFrag from "./shaders/line.frag.glsl";
import Viewport from "./viewport";

interface BufferSectionMapping {
	color: [r: number, g: number, b: number];
	length: number;
}

interface GridVertexMesh {
	buffer: Float32Array;
	segmentLengths: number[];
}

class TransformRenderer extends Renderer {
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
	// private mainGridLines: Float32Array[];
	// private subGridLines: Float32Array[];
	private color: [r: number, g: number, b: number] = [0, 0, 0];

	// TEMPORARY
	private time: number = 0;
	private last: number | null = null;

	constructor(viewport: Viewport, gl: WebGL2RenderingContext) {
		super(viewport, gl);
		this.lineShaderProgram = this.compileProgram([
			{ type: this.gl.VERTEX_SHADER, source: lineVert },
			{ type: this.gl.FRAGMENT_SHADER, source: lineFrag }
		]);
		this.pushUniform({
			name: "uTime",
			setter: (location) => this.gl.uniform1f(location, this.time)
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
	}

	protected draw(): void {
		this.drawGrid();

		// TEMPORARY
		if (this.time === 1) return;
		const nextFrame = () => {
			requestAnimationFrame((now) => {
				let delta = 0;
				if (this.last != null) delta = now - this.last;
				this.time += delta / 5000;
				if (this.time > 1) this.time = 1;
				this.render();
				this.last = now;
			});
		};
		if (this.time === 0) setTimeout(nextFrame, 500);
		else nextFrame();
	}

	protected drawGrid() {
		this.gl.useProgram(this.lineShaderProgram);
		this.color = [0.2, 0.2, 0.2];
		this.setUniforms(this.lineShaderProgram);
		this.setAttributeBuffer(
			"aVertexPosition",
			TransformRenderer.vertexBuffer,
			this.gl.STATIC_DRAW
		);
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
			this.generateSegmentedLine([x, -halfSize], [x, halfSize], this.SEGMENTS);
		const horizontalLine = (y: number) =>
			this.generateSegmentedLine([-halfSize, y], [halfSize, y], this.SEGMENTS);

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
			if (i % 1 === 0) continue;
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
		start: [x: number, y: number],
		end: [x: number, y: number],
		segments: number
	): number[] {
		const vertices: number[] = [];
		const width = end[0] - start[0];
		const height = end[1] - start[1];
		const step = 1 / segments;
		for (let i = 0; i <= width * segments; i++) {
			for (let j = 0; j <= height * segments; j++) {
				const x = start[0] + i * step;
				const y = start[1] + j * step;
				vertices.push(x, y);
			}
		}
		return vertices;
	}
}

export default TransformRenderer;
