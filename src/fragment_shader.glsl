#version 300 es

precision mediump float;

uniform vec2 uViewportSize;

in vec2 vFragCoord;
out vec4 oFragColor;

void main() {
	int x = abs(int(vFragCoord.x) % 2);
	int y = abs(int(vFragCoord.y) % 2);

	int color = x ^ y;

	if (color == 1) oFragColor = vec4(1.0, 1.0, 1.0, 1.0);
	else oFragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
