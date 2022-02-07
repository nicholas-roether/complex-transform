#version 300 es

precision highp float;

in vec4 aVertexPosition;

uniform mat2 uScreenspaceMatrix;
uniform vec2 uScreenspaceOffset;
uniform float uTime;

// Normal constants

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;
const float E = 2.718281828459045;
const float LN_2 = 0.6931471805599453;
const float LN_10 = 2.302585092994046;

// Complex function utilities

mat2 complexNumber(float re, float im) {
	return mat2(re, im, -im, re);
}

mat2 complexNumber(float re) {
	return complexNumber(re, 0.0);
}

float realPart(mat2 z) {
	return z[0][0];
}

float imagPart(mat2 z) {
	return z[0][1];
}

mat2 polarComplexNumber(float r, float arg) {
	return complexNumber(r * cos(arg), r * sin(arg));
}

vec2 complexToVector(mat2 z) {
	return vec2(realPart(z), imagPart(z));
}

float complexLength(mat2 z) {
	return length(complexToVector(z));
}

float complexArg(mat2 z) {
	return atan(imagPart(z) / realPart(z));
}

mat2 complexConjugate(mat2 z) {
	return complexNumber(realPart(z), -imagPart(z));
}

mat2 complexReciprocal(mat2 z) {
	return 1.0 / (realPart(z) * realPart(z) + imagPart(z) * imagPart(z)) * complexConjugate(z);
}

mat2 complexPositiveIntegerPow(mat2 z, uint power) {
	mat2 result = complexNumber(1.0);
	for (uint i = uint(0); i < power; i++) result *= z;
	return result;
}

mat2 complexIntegerPow(mat2 z, int power) {
	// FIXME potential performance impact due to branching
	if (power >= 0)
		return complexPositiveIntegerPow(z, uint(power));
	return complexReciprocal(complexPositiveIntegerPow(z, uint(-power)));
}

mat2 complexFloatPow(mat2 z, float power) {
	float r = pow(complexLength(z), power);
	float arg = power * complexArg(z);
	return polarComplexNumber(r, arg);
}

mat2 floatComplexPow(float x, mat2 power) {
	return polarComplexNumber(
		pow(x, realPart(power)),
		imagPart(power) * log(x)
	);
}

mat2 floatPow(float x, float power) {
	// FIXME branching!
	if (x >= 0.0) return complexNumber(pow(x, power));
	return polarComplexNumber(pow(-x, power), PI * power);
}

mat2 complexPow(mat2 z, mat2 power) {
	// FIXME branching!
	if (imagPart(z) == 0.0) {
		if (imagPart(power) == 0.0) return floatPow(realPart(z), realPart(power));
		return floatComplexPow(realPart(z), power);
	}
	if (imagPart(power) == 0.0) {
		if (realPart(power) == floor(realPart(power))) return complexIntegerPow(z, int(realPart(power)));
		return complexFloatPow(z, realPart(power));
	}
	float r = complexLength(z);
	float arg = complexArg(z);

	return polarComplexNumber(
		pow(r, realPart(power)) * exp(-imagPart(power) * arg),
		arg * realPart(power) + imagPart(power) * log(r)
	);
}

// Complex constants

const mat2 I = mat2(0.0, 1.0, -1.0, 0.0);
const mat2 CMPLX_ONE = mat2(1.0, 0.0, 0.0, 1.0);
const mat2 CMPLX_PI = PI * CMPLX_ONE;
const mat2 CMPLX_TAU = TAU * CMPLX_ONE;
const mat2 CMPLX_E = E * CMPLX_ONE;

// Complex functions for procedual expression

mat2 cmplxRe(mat2 z) {
	return complexNumber(realPart(z));
}

mat2 cmplxIm(mat2 z) {
	return complexNumber(imagPart(z));
}

mat2 cmplxAbs(mat2 z) {
	return complexNumber(complexLength(z));
}

mat2 cmplxArg(mat2 z) {
	return complexNumber(complexArg(z));
}

mat2 cmplxConj(mat2 z) {
	return complexConjugate(z);
}

mat2 cmplxAdd(mat2 z1, mat2 z2) {
	return z1 + z2;
}

mat2 cmplxSub(mat2 z1, mat2 z2) {
	return z1 - z2;
}

mat2 cmplxMult(mat2 z1, mat2 z2) {
	return z1 * z2;
}

mat2 cmplxDiv(mat2 z1, mat2 z2) {
	return z1 * complexReciprocal(z2);
}

mat2 cmplxPow(mat2 z1, mat2 z2) {
	return complexPow(z1, z2);
}

mat2 cmplxSqrt(mat2 z) {
	float r = complexLength(z);
	return complexNumber(
		sqrt((r + realPart(z)) / 2.0),
		sign(imagPart(z)) * sqrt((r - realPart(z)) / 2.0)
	);
}

mat2 cmplxCbrt(mat2 z) {
	return complexFloatPow(z, 1.0 / 3.0);
}

mat2 cmplxExp(mat2 z) {
	return polarComplexNumber(exp(realPart(z)), imagPart(z));
}

mat2 cmplxLn(mat2 z) {
	float r = complexLength(z);
	float arg = complexArg(z);
	return complexNumber(log(r), arg);
}

mat2 cmplxLog(mat2 z, mat2 base) {
	return cmplxDiv(cmplxLn(z), cmplxLn(base));
}

mat2 cmplxLog2(mat2 z) {
	return cmplxLn(z) / LN_2;
}

mat2 cmplxLog10(mat2 z) {
	return cmplxLn(z) / LN_10;
}

mat2 cmplxSin(mat2 z) {
	return -I * (cmplxExp(I * z) - cmplxExp(-I * z)) / 2.0;
}

mat2 cmplxCos(mat2 z) {
	return (cmplxExp(I * z) + cmplxExp(-I * z)) / 2.0;
}

mat2 cmplxTan(mat2 z) {
	return cmplxDiv(cmplxSin(z), cmplxCos(z));
}

mat2 cmplxSinh(mat2 z) {
	return (cmplxExp(z) - cmplxExp(-z)) / 2.0;
}

mat2 cmplxCosh(mat2 z) {
	return (cmplxExp(z) + cmplxExp(-z)) / 2.0;
}

mat2 cmplxTanh(mat2 z) {
	return cmplxDiv(cmplxSinh(z), cmplxCosh(z));
}

mat2 cmplxAsin(mat2 z) {
	return I * cmplxLn(cmplxSqrt(CMPLX_ONE - z * z) - I * z);
}

mat2 cmplxAcos(mat2 z) {
	return 0.5 * CMPLX_PI - cmplxAsin(z);
}

mat2 cmplxAtan(mat2 z) {
	return -0.5 * I * cmplxLn(cmplxDiv(I - z, I + z));
}

mat2 cmplxAsinh(mat2 z) {
	return cmplxLn(z + cmplxSqrt(z * z + CMPLX_ONE));
}

mat2 cmplxAcosh(mat2 z) {
	return cmplxLn(z + cmplxSqrt(z + CMPLX_ONE) * cmplxSqrt(z - CMPLX_ONE));
}

mat2 cmplxAtanh(mat2 z) {
	return 0.5 * cmplxLn(cmplxDiv(CMPLX_ONE + z, CMPLX_ONE - z));
}

// Rendering code

vec2 transform(vec2 pos) {
	mat2 z = complexNumber(pos.x, pos.y);
	// mat2 zTransformed = cmplxDiv(CMPLX_ONE, z);
	// mat2 zTransformed = cmplxSin(cmplxPow(z, complexNumber(2.0)));
	mat2 zTransformed = %TRANSFORM_FUNCTION%;

	return complexToVector(zTransformed);
}

float interpolationFunc(float t) {
	// float k = 100.0;
	// return 1.0 / k * (pow(k + 1.0, t) - 1.0);
	return t;
}

vec2 interpolatedTransform(vec2 pos) {
	if (uTime == 0.0) return pos;
	return pos + interpolationFunc(uTime) * (transform(pos) - pos);
}

void main() {
	vec2 coordinate = vec2(aVertexPosition.x, aVertexPosition.y);
	vec2 transformedCoord = interpolatedTransform(coordinate);
	gl_Position = vec4(uScreenspaceMatrix * transformedCoord + uScreenspaceOffset, 0.0, 1.0);
}
