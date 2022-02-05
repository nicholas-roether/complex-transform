import { generateGLSL } from "./generate_glsl";
import { lex } from "./lex";
import { parse } from "./parse";

function transpileMathToGLSL(math: string): string {
	const tokens = lex(math);
	const tree = parse(tokens);
	return generateGLSL(tree);
}

export { transpileMathToGLSL };
