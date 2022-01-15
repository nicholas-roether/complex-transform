#version 300 es

uniform mat2 uViewportTransform;
uniform vec2 uViewportTranslation;

in vec4 aVertexPosition;
out vec2 vFragCoord;

void main() {
	gl_Position = aVertexPosition;
	vFragCoord = uViewportTransform * vec2(aVertexPosition) + uViewportTranslation;
}
