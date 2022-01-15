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

	public draw() {
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
		const uViewportTranslation = this.gl.getUniformLocation(
			this.program,
			"uViewportTranslation"
		);
		const uAspectRatio = this.gl.getUniformLocation(
			this.program,
			"uAspectRatio"
		);

		const transform = this.viewport.getAffineTransform();
		this.gl.uniformMatrix2fv(uViewportTransform, false, transform.matrix);
		this.gl.uniform2fv(uViewportTranslation, transform.translation);
		this.gl.uniform1f(uAspectRatio, this.width / this.height);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

		const aVertexPosition = this.gl.getAttribLocation(
			this.program,
			"aVertexPosition"
		);
		this.gl.enableVertexAttribArray(aVertexPosition);
		this.gl.vertexAttribPointer(aVertexPosition, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
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
		this.program = program;
	}

	private unloadProgram() {
		this.gl.useProgram(null);
		this.program = null;
	}

	private initVertexBuffer() {
		const vertices = new Float32Array([
			// eslint-disable-next-line prettier/prettier
			-1,  1,   1,  1,   -1, -1,
			-1, -1,   1,  1,    1, -1
		]);

		const vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
		this.vertexBuffer = vertexBuffer;
	}

	private resetVertexBuffer() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		this.vertexBuffer = null;
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
