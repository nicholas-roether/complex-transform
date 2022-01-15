#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uViewportSize;

void main() {
	gl_FragColor = vec4(0.3, gl_FragCoord.x / uViewportSize.x, gl_FragCoord.y / uViewportSize.y, 1.0);
}
