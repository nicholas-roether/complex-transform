import Viewport from "./viewport";
import vsSource from "./vertex_shader.glsl";

type ShaderList = {
	type: number;
	source: string;
}[];

class WebGLRenderer {
	public readonly width: number;
	public readonly height: number;
	public readonly viewport: Viewport;

	private readonly gl: WebGLRenderingContext;
	private program: WebGLProgram | null = null;
	private vertexBuffer: WebGLBuffer | null = null;
	private vertexBufferSize: number = 0;

	constructor(gl: WebGLRenderingContext, width: number, height: number) {
		this.gl = gl;
		this.width = width;
		this.height = height;
		this.viewport = new Viewport(width, height);
	}

	public load(fragmentShader: string) {
		this.loadProgram([
			{
				type: this.gl.VERTEX_SHADER,
				source: vsSource
			},
			{
				type: this.gl.FRAGMENT_SHADER,
				source: fragmentShader
			}
		]);
		if (!this.program) throw new Error("Failed to compile shader program.");
		this.initVertexBuffer();
		if (!this.vertexBuffer)
			throw new Error("Failed to initialize vertex buffer.");
	}

	public unload() {
		this.unloadProgram();
		this.resetVertexBuffer();
	}

	public draw(time = 0) {
		if (!this.program || !this.vertexBuffer)
			throw new Error(
				"No program loaded; use load() to load a shader program before calling draw()."
			);

		this.gl.viewport(0, 0, this.width, this.height);
		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		const uViewportTransform = this.gl.getUniformLocation(
			this.program,
			"uViewportTransform"
		);
		const uViewportTransformInverse = this.gl.getUniformLocation(
			this.program,
			"uViewportTransformInverse"
		);
		const uViewportTranslation = this.gl.getUniformLocation(
			this.program,
			"uViewportTranslation"
		);
		const uViewportSize = this.gl.getUniformLocation(
			this.program,
			"uViewportSize"
		);
		const uAspectRatio = this.gl.getUniformLocation(
			this.program,
			"uAspectRatio"
		);
		const uTime = this.gl.getUniformLocation(this.program, "uTime");

		const transform = this.viewport.getAffineTransform();
		const inverseTransform = this.viewport.getInverseAffineTransform().matrix;
		this.gl.uniformMatrix2fv(uViewportTransform, false, transform.matrix);
		this.gl.uniformMatrix2fv(
			uViewportTransformInverse,
			false,
			inverseTransform
		);
		this.gl.uniform2fv(uViewportTranslation, transform.translation);
		this.gl.uniform2fv(uViewportSize, [this.width, this.height]);
		this.gl.uniform1f(uAspectRatio, this.width / this.height);
		this.gl.uniform1f(uTime, time);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

		const aVertexPosition = this.gl.getAttribLocation(
			this.program,
			"aVertexPosition"
		);
		this.gl.enableVertexAttribArray(aVertexPosition);
		this.gl.vertexAttribPointer(aVertexPosition, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBufferSize);

		const lastTime = Date.now();
		requestAnimationFrame(() => {
			const delta = Date.now() - lastTime;
			this.draw(time + delta);
		});
	}

	private loadProgram(shaders: ShaderList) {
		const program = this.gl.createProgram();
		if (!program) {
			console.error("Failed to create WebGL shader program.");
			return null;
		}

		for (const { type, source } of shaders) {
			const shader = this.loadShader(type, source);
			if (!shader) continue;
			this.gl.attachShader(program, shader);
		}

		this.gl.linkProgram(program);
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			console.error(
				`Failed to initialize shader program: ${this.gl.getProgramInfoLog(
					program
				)}`
			);
			return null;
		}

		this.gl.useProgram(program);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

		this.program = program;
	}

	private unloadProgram() {
		this.gl.useProgram(null);
		this.gl.disable(this.gl.BLEND);
		this.program = null;
	}

	private generateVertexSquare(x: number, y: number, size: number): number[] {
		return [
			// eslint-disable-next-line prettier/prettier
			x, y,  x + size, y,         x + size, y + size,
			// eslint-disable-next-line prettier/prettier
			x, y,  x + size, y + size,  x,        y + size
		];
	}

	private generateVertexTiling(depth: number): Float32Array {
		const vertices: number[] = [];

		const size = 2 / depth;
		const indexToCoord = (i: number) => size * i - 1;
		for (let i = 0; i < depth; i++) {
			for (let j = 0; j < depth; j++) {
				const x = indexToCoord(i);
				const y = indexToCoord(j);
				vertices.push(...this.generateVertexSquare(x, y, size));
			}
		}

		return new Float32Array(vertices);
	}

	private initVertexBuffer() {
		// const vertices = new Float32Array([
		// 	// eslint-disable-next-line prettier/prettier
		// 	-1,  1,   1,  1,   -1, -1,
		// 	-1, -1,   1,  1,    1, -1
		// ]);

		const vertices = this.generateVertexTiling(500);

		console.log(vertices);

		const vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
		this.vertexBuffer = vertexBuffer;
		this.vertexBufferSize = vertices.length / 2;
	}

	private resetVertexBuffer() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		this.vertexBuffer = null;
		this.vertexBufferSize = 0;
	}

	private loadShader(type: number, source: string): WebGLShader | null {
		const shader = this.gl.createShader(type);
		if (!shader) {
			console.error("Failed to create WebGL shader.");
			return null;
		}

		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.error(
				`An error occurred during shader compilation: ${this.gl.getShaderInfoLog(
					shader
				)}`
			);
			this.gl.deleteShader(shader);
			return null;
		}

		return shader;
	}
}

export default WebGLRenderer;
