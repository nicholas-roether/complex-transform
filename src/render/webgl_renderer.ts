import Viewport from "./viewport";

type ShaderSourceList = {
	type: number;
	source: string;
}[];

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

interface AttributeInfo {
	name: string;
	size: number;
	type: number;
}

interface Attribute {
	size: number;
	type: number;
	buffer: WebGLBuffer;
}

abstract class Renderer {
	public readonly viewport: Viewport;
	protected readonly gl: WebGL2RenderingContext;

	private readonly uniforms: Uniform[] = [];
	private readonly attributeMap: Map<string, Attribute> = new Map();
	private updateScheduled = false;
	private lastFrame: DOMHighResTimeStamp | null = null;
	private running = false;

	constructor(viewport: Viewport, gl: WebGL2RenderingContext) {
		this.viewport = viewport;
		this.gl = gl;
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.setDefaultUniforms();
		viewport.addEventListener("change", () => this.update());
	}

	public start(): void {
		this.running = true;
		/*setTimeout( */ this.drawLoop() /* ) */;
	}

	public stop(): void {
		this.running = false;
	}

	public update(): void {
		this.updateScheduled = true;
	}

	protected abstract draw(): void;

	protected abstract frame(dt: number): void;

	protected pushAttribute(attributeInfo: AttributeInfo) {
		const attribute = {
			...attributeInfo,
			buffer: this.createBuffer()
		};
		this.attributeMap.set(attributeInfo.name, attribute);
	}

	protected setAttributeBuffer(
		name: string,
		data: BufferSource,
		usage: number
	) {
		const attribute = this.attributeMap.get(name);
		if (!attribute) return;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attribute.buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	protected setVertexAttributes(program: WebGLProgram) {
		this.attributeMap.forEach(({ size, type, buffer }, name) => {
			const location = this.gl.getAttribLocation(program, name);
			if (location === -1) return;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
			this.gl.enableVertexAttribArray(location);
			this.gl.vertexAttribPointer(location, size, type, false, 0, 0);
		});
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	protected resetVertexAttributes(program: WebGLProgram) {
		for (const name of this.attributeMap.keys()) {
			const location = this.gl.getAttribLocation(program, name);
			if (location === -1) continue;
			this.gl.disableVertexAttribArray(location);
		}
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

	protected setUniforms(program: WebGLProgram, ...names: string[]) {
		for (const uniform of this.uniforms) {
			if (names.length > 0 && !names.includes(uniform.name)) continue;
			const location = this.gl.getUniformLocation(program, uniform.name);
			uniform.setter(location);
		}
	}

	private drawLoop(ts?: DOMHighResTimeStamp) {
		if (!this.running) return;
		if (ts) {
			if (this.lastFrame != null) {
				const dt = ts - this.lastFrame;
				this.frame(dt);
			}
			this.lastFrame = ts;
		}
		if (this.updateScheduled) {
			this.clearScreen();
			this.gl.viewport(0, 0, this.viewport.width, this.viewport.height);
			this.draw();
			this.updateScheduled = false;
		}
		requestAnimationFrame((ts) => this.drawLoop(ts));
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
			name: "uScreenspaceMatrix",
			setter: (location) =>
				this.gl.uniformMatrix2fv(
					location,
					false,
					this.viewport.screenspaceMatrix
				)
		});
		this.pushUniform({
			name: "uScreenspaceOffset",
			setter: (location) =>
				this.gl.uniform2fv(location, this.viewport.translationVector)
		});
	}
}

export default Renderer;
export { ShaderCompilationError };
export type { ShaderSourceList };
