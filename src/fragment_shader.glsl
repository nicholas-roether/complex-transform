#version 300 es

precision mediump float;

uniform vec2 uViewportSize;

in vec2 vFragCoord;
out vec4 oFragColor;

vec2 transformation(vec2 pos) {
	return mat2(1.0, 0.5, 0.5, 1.0) * pos;
}

void main() {
	vec2 modular = mod(vFragCoord, 2.0);

	int x = int(modular.x);
	int y = int(modular.y);

	int color = abs(x) ^ abs(y);

	if (color == 1) oFragColor = vec4(vFragCoord.x * vFragCoord.y < 0.0 ? 0.0 : 1.0, 1.0, 1.0, 1.0);
	else oFragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
