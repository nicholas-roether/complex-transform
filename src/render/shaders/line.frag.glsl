#version 300 es

precision mediump float;

out vec4 oFragColor;

uniform uint uSubline;

void main() {
	if (uSubline == 1u) oFragColor = vec4(0.2, 0.2, 0.2, 1.0);
	else oFragColor = vec4(0.3, 0.8, 1.0, 1.0);
}
