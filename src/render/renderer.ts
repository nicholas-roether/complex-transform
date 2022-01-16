import Viewport from "./viewport";

type ShaderSourceList = {
	type: number;
	source: string;
}[];

class RenderContextCreationError extends Error {
	public readonly context: string;

	constructor(context: string, message: string) {
		super(message);
		this.context = context;
	}
}

function getShaderTypeName(type: number) {
	for (const name in WebGL2RenderingContext) {
		if (
			(WebGL2RenderingContext as unknown as Record<string, unknown>)[name] ===
			type
		)
			return name;
	}
	return "unknown";
}

class ShaderCompilationError extends Error {
	public readonly shaderType: number;

	constructor(type: number, errorLog: string) {
		super(
			`Failed to compile shader of type ${getShaderTypeName(type)}; ${errorLog}`
		);
		this.shaderType = type;
	}
}

interface Uniform {
	name: string;
	setter: (location: WebGLUniformLocation | null) => void;
}

abstract class Renderer {
	public readonly canvas: HTMLCanvasElement;
	public readonly viewport: Viewport;
	protected readonly gl: WebGL2RenderingContext;
	// protected readonly ctx: CanvasRenderingContext2D;

	private readonly uniforms: Uniform[] = [];

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.viewport = new Viewport(canvas);
		// const ctx = canvas.getContext("2d");
		// if (!ctx) {
		// 	throw new RenderContextCreationError(
		// 		"2d",
		// 		"2D rendering context creation failed. Make sure your browser supports the Canvas 2D rendering API as well as WebGL 2.0."
		// 	);
		// }
		// this.ctx = ctx;
		const gl = canvas.getContext("webgl2");
		if (!gl) {
			throw new RenderContextCreationError(
				"webgl2",
				"WebGL rendering context creation failed. Make sure your browser supports WebGL 2.0."
			);
		}
		this.gl = gl;
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.setDefaultUniforms();
	}

	public render(): void {
		this.clearScreen();
		this.gl.viewport(0, 0, this.viewport.width, this.viewport.height);
		this.draw();
	}

	protected abstract draw(): void;

	protected setVertices(program: WebGLProgram) {
		const aVertexPosition = this.gl.getAttribLocation(
			program,
			"aVertexPosition"
		);
		this.gl.enableVertexAttribArray(aVertexPosition);
		this.gl.vertexAttribPointer(aVertexPosition, 2, this.gl.FLOAT, false, 0, 0);
	}

	protected clearScreen() {
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	protected createBuffer(): WebGLBuffer {
		const buffer = this.gl.createBuffer();
		if (!buffer) throw new Error("Failed to create vertex buffer.");
		return buffer;
	}

	protected pushUniform(uniform: Uniform) {
		this.uniforms.push(uniform);
	}

	protected compileProgram(shaderSources: ShaderSourceList): WebGLProgram {
		const program = this.gl.createProgram();
		if (!program) throw new Error("Failed to create shader program.");

		const shaders: WebGLShader[] = [];

		for (const { type, source } of shaderSources) {
			const shader = this.compileShader(type, source);
			this.gl.attachShader(program, shader);
			shaders.push(shader);
		}

		this.gl.linkProgram(program);

		for (const shader of shaders) {
			this.gl.detachShader(program, shader);
			this.gl.deleteShader(shader);
		}

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			const errorLog = this.gl.getProgramInfoLog(program);
			this.gl.deleteProgram(program);
			throw new Error(`Failed to link shader program; ${errorLog}`);
		}

		return program;
	}

	protected setUniforms(program: WebGLProgram) {
		for (const uniform of this.uniforms) {
			const location = this.gl.getUniformLocation(program, uniform.name);
			uniform.setter(location);
		}
	}

	private compileShader(type: number, source: string): WebGLShader {
		const shader = this.gl.createShader(type);
		if (!shader) {
			throw new Error(
				`Failed to create WebGL shader of type ${getShaderTypeName(type)}`
			);
		}
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			const errorLog =
				this.gl.getShaderInfoLog(shader) ?? "An unknown error occurred.";
			this.gl.deleteShader(shader);
			throw new ShaderCompilationError(type, errorLog);
		}
		return shader;
	}

	private setDefaultUniforms() {
		this.pushUniform({
			name: "uViewportScale",
			setter: (location) => this.gl.uniform1f(location, this.viewport.scale)
		});
		this.pushUniform({
			name: "uViewportTranslation",
			setter: (location) =>
				this.gl.uniform2fv(location, this.viewport.translation)
		});
		this.pushUniform({
			name: "uViewportAspectRatio",
			setter: (location) =>
				this.gl.uniform1f(location, this.viewport.width / this.viewport.height)
		});
	}
}

export default Renderer;
export { RenderContextCreationError, ShaderCompilationError };
export type { ShaderSourceList };
