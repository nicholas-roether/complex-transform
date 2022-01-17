import Renderer from "./renderer";
import lineVert from "./shaders/line.vert.glsl";
import lineFrag from "./shaders/line.frag.glsl";

class TransformRenderer extends Renderer {
	private readonly lineShaderProgram: WebGLProgram;
	private mainGridLines: Float32Array[];
	private subGridLines: Float32Array[];
	private subline: boolean = false;

	// TEMPORARY
	private time: number = 0;
	private last: number | null = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas);
		this.lineShaderProgram = this.compileProgram([
			{ type: this.gl.VERTEX_SHADER, source: lineVert },
			{ type: this.gl.FRAGMENT_SHADER, source: lineFrag }
		]);
		this.pushUniform({
			name: "uTime",
			setter: (location) => this.gl.uniform1f(location, this.time)
		});
		this.pushUniform({
			name: "uSubline",
			setter: (location) => this.gl.uniform1ui(location, this.subline ? 1 : 0)
		});
		this.pushAttribute({
			name: "aVertexPosition",
			type: this.gl.FLOAT,
			size: 2
		});
		this.mainGridLines = this.generateSubGrid(50, 50, 3000);
		this.subGridLines = this.generateMainGrid(50, 50, 3000);
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

	private generateSubGrid(
		width: number,
		height: number,
		numSegments: number
	): Float32Array[] {
		const subDiv = 5;
		const lines: Float32Array[] = [];
		for (let i = 0; i <= subDiv * height; i++) {
			if (i % subDiv === 0) continue;
			const start: [number, number] = [-width / 2, i / subDiv - height / 2];
			const end: [number, number] = [width / 2, i / subDiv - height / 2];
			const vertices = this.generateSegmentedLine(start, end, numSegments);
			lines.push(vertices);
		}

		for (let i = 0; i <= subDiv * width; i++) {
			if (i % subDiv === 0) continue;
			const start: [number, number] = [i / subDiv - width / 2, -height / 2];
			const end: [number, number] = [i / subDiv - width / 2, height / 2];
			const vertices = this.generateSegmentedLine(start, end, numSegments);
			lines.push(vertices);
		}
		return lines;
	}

	private generateMainGrid(
		width: number,
		height: number,
		numSegments: number
	): Float32Array[] {
		const lines: Float32Array[] = [];
		for (let i = 0; i <= height; i++) {
			const start: [number, number] = [-width / 2, i - height / 2];
			const end: [number, number] = [width / 2, i - height / 2];
			const vertices = this.generateSegmentedLine(start, end, numSegments);
			lines.push(vertices);
		}

		for (let i = 0; i <= width; i++) {
			const start: [number, number] = [i - width / 2, -height / 2];
			const end: [number, number] = [i - width / 2, height / 2];
			const vertices = this.generateSegmentedLine(start, end, numSegments);
			lines.push(vertices);
		}
		return lines;
	}

	protected drawGrid() {
		this.gl.useProgram(this.lineShaderProgram);
		this.subline = true;
		this.setUniforms(this.lineShaderProgram);

		for (const line of this.mainGridLines) {
			this.setAttributeBuffer("aVertexPosition", line, this.gl.STREAM_DRAW);
			this.setVertexAttributes(this.lineShaderProgram);
			this.gl.drawArrays(this.gl.LINE_STRIP, 0, line.length / 2);
		}

		this.subline = false;
		this.setUniforms(this.lineShaderProgram, "uSubline");
		for (const line of this.subGridLines) {
			this.setAttributeBuffer("aVertexPosition", line, this.gl.STREAM_DRAW);
			this.setVertexAttributes(this.lineShaderProgram);
			this.gl.drawArrays(this.gl.LINE_STRIP, 0, line.length / 2);
		}

		this.resetVertexAttributes(this.lineShaderProgram);
		this.gl.useProgram(null);
	}

	private generateSegmentedLine(
		start: [x: number, y: number],
		end: [x: number, y: number],
		numSegments: number
	): Float32Array {
		const vertices: number[] = [];
		for (let i = 0; i <= numSegments; i++) {
			const x = start[0] + (i / numSegments) * (end[0] - start[0]);
			const y = start[1] + (i / numSegments) * (end[1] - start[1]);
			vertices.push(...this.viewport.toNormalized([x, y]));
		}
		return new Float32Array(vertices);
	}
}

export default TransformRenderer;
