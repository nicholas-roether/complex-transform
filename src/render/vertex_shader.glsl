attribute vec4 aVertexPosition;

uniform mat2 uViewportTransform;
uniform vec2 uViewportTranslation;

void main() {
	vec2 translated = uViewportTransform * vec2(aVertexPosition) + uViewportTranslation;
	gl_Position = vec4(translated.x, translated.y, 0.0, 1.0);
}
