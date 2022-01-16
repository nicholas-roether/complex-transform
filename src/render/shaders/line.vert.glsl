#version 300 es

in vec4 aVertexPosition;
out vec2 vFragCoord;

uniform float uViewportScale;
uniform vec2 uViewportTranslation;
uniform float uViewportAspectRatio;
uniform float uTime;

const float TAU = 6.28318530718;

vec2 transform(vec2 pos) {
	// return pos;
	// return 1.0 / (pos.x * pos.x + pos.y * pos.y) * vec2(pos.x, -pos.y);
	return vec2(pos.x * pos.x - pos.y * pos.y, 2.0 * pos.x * pos.y);
	// return exp(pos.x) * vec2(cos(pos.y), sin(pos.y));
	// return 0.5 * vec2(sin(pos.x) * (exp(-pos.y) + exp(pos.y)), cos(pos.x) * (exp(-pos.y) - exp(pos.y)));
}

float interpolationFunc(float t) {
	// float k = 100.0;
	// return 1.0 / k * (pow(k + 1.0, t) - 1.0);
	return t;
}

vec2 interpolatedTransform(vec2 pos) {
	return pos + interpolationFunc(uTime) * (transform(pos) - pos);
}

void main() {
	vec2 coordinate = vec2(aVertexPosition.x, aVertexPosition.y / uViewportAspectRatio);
	vec2 transformedCoord = interpolatedTransform(coordinate);
	vec2 transformedPos = vec2(transformedCoord.x, transformedCoord.y * uViewportAspectRatio);
	gl_Position = vec4(uViewportScale * transformedPos + uViewportTranslation, 0.0, 1.0);
}
