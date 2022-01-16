#version 300 es

precision mediump float;

in vec2 vFragCoord;
out vec4 oFragColor;

float gridFunc(vec2 pos) {
	vec2 modular = mod(pos - vec2(0.5, 0.5), 1.0) - vec2(0.5, 0.5);
	return modular.x * modular.y; 
}


bool isPartOfGrid(vec2 pos) {
	vec2 A = 0.5 * vec2(0.01, 0.01);
	vec2 B = vec2(A.x, -A.y);

	bool a = gridFunc(pos + A) >= 0.0;
	bool b = gridFunc(pos - A) >= 0.0;
	bool c = gridFunc(pos + B) >= 0.0;
	bool d = gridFunc(pos - B) >= 0.0;

	return (a || b || c || d) && !(a && b && c && d);
}

void main() {
	vec2 modular = mod(vFragCoord, 2.0);

	int x = int(modular.x);
	int y = int(modular.y);

	int color = abs(x) ^ abs(y);

	if (color == 1) oFragColor = vec4(vFragCoord.x * vFragCoord.y < 0.0 ? 0.0 : 1.0, 1.0, 1.0, 1.0);
	else oFragColor = vec4(0.0, 0.0, 0.0, 1.0);
	if (isPartOfGrid(vFragCoord))
		oFragColor = vec4(0.2, 0.7, 0.9, 1.0);
	else oFragColor = vec4(0.0, 0.0, 0.0, 0.0);
}
