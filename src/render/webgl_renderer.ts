import Viewport from "./viewport";
import vsSource from "./vertex_shader.glsl";

type ShaderList = {
	type: number;
	source: string;
}[];

class WebGLRenderer {
	private readonly gl: WebGLRenderingContext;
	public readonly width: number;
	public readonly height: number;
	public readonly viewport: Viewport;
	public running = false;

	constructor(gl: WebGLRenderingContext, width: number, height: number) {
		this.gl = gl;
		this.width = width;
		this.height = height;
		this.viewport = new Viewport(width, height);
	}

	public start(fragmentShader: string) {
		const program = this.createProgram([
			{
				type: this.gl.VERTEX_SHADER,
				source: vsSource
			},
			{
				type: this.gl.FRAGMENT_SHADER,
				source: fragmentShader
			}
		]);
		if (!program) throw new Error("Failed to compile shader program.");
		const buffer = this.initVertexBuffer();
		if (!buffer) throw new Error("Failed to initialize vertex buffer.");

		// TODO loop etc
		this.draw(program, buffer);
	}

	public stop() {
		this.running = false;
	}

	private draw(program: WebGLProgram, vertexBuffer: WebGLBuffer) {
		this.gl.viewport(0, 0, this.width, this.height);
		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		this.gl.useProgram(program);

		const uViewportTransform = this.gl.getUniformLocation(
			program,
			"uViewportTransform"
		);
		const uViewportTranslation = this.gl.getUniformLocation(
			program,
			"uViewportTranslation"
		);
		const uAspectRatio = this.gl.getUniformLocation(program, "uAspectRatio");

		const transform = this.viewport.getAffineTransform();
		this.gl.uniformMatrix2fv(uViewportTransform, false, transform.matrix);
		this.gl.uniform2fv(uViewportTranslation, transform.translation);
		this.gl.uniform1f(uAspectRatio, this.width / this.height);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);

		const aVertexPosition = this.gl.getAttribLocation(
			program,
			"aVertexPosition"
		);
		this.gl.enableVertexAttribArray(aVertexPosition);
		this.gl.vertexAttribPointer(aVertexPosition, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	}

	private createProgram(shaders: ShaderList): WebGLProgram | null {
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

		return program;
	}

	private initVertexBuffer(): WebGLBuffer | null {
		const vertices = new Float32Array([
			// eslint-disable-next-line prettier/prettier
			-1,  1,   1,  1,   -1, -1,
			-1, -1,   1,  1,    1, -1
		]);

		const vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
		return vertexBuffer;
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
