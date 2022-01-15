#version 300 es

uniform mat2 uViewportTransform;
uniform vec2 uViewportTranslation;
uniform mat2 uViewportTransformInverse;
uniform float uTime;

in vec4 aVertexPosition;
out vec2 vFragCoord;


vec2 transform(vec2 pos) {
	// return 1.0 / (pos.x * pos.x + pos.y * pos.y) * vec2(pos.x, -pos.y);
	// return vec2(pos.x * pos.x - pos.y * pos.y, 2.0 * pos.x * pos.y);
	return exp(pos.x) * vec2(cos(pos.y), sin(pos.y));
}

vec2 interpolatedTransform(vec2 pos) {
	float t = uTime / 5000.0;
	if (t > 1.0) t = 1.0;
	return pos + t * (transform(pos) - pos);
}

void main() {
	vec2 translatedPos = uViewportTransform * vec2(aVertexPosition) + uViewportTranslation;
	vec2 transformedPos = interpolatedTransform(translatedPos);
	vec2 vertexPos = uViewportTransformInverse * (transformedPos - uViewportTranslation);
	gl_Position = vec4(vertexPos, 0.0, 1.0);
	vFragCoord = translatedPos;
}
