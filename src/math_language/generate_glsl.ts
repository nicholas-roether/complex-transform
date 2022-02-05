import { ElementUnion, isElementUnionType } from "../utils/types";
import { ExpressionNode, ExpressionTree } from "./expression";

const functionNames = [
	"sqrt",
	"cbrt",
	"exp",
	"ln",
	"log",
	"log2",
	"log10",
	"sin",
	"cos",
	"tan",
	"sinh",
	"cosh",
	"tanh",
	"asin",
	"acos",
	"atan",
	"asinh",
	"acosh",
	"atanh",
	"abs",
	"arg",
	"Re",
	"Im"
] as const;

type FunctionName = ElementUnion<typeof functionNames>;

function isFunctionName(str: string): str is FunctionName {
	return isElementUnionType(functionNames, str);
}

function getGLSLFunction(functionName: FunctionName): string {
	return "cmplx" + functionName[0].toUpperCase() + functionName.substring(1);
}

const numArgsMap: Partial<Record<FunctionName, number>> = {
	log: 2
};

function getNumArgs(functionName: FunctionName): number {
	return numArgsMap[functionName] ?? 1;
}

const operators = ["+", "-", "*", "/", "^"] as const;

type Operator = ElementUnion<typeof operators>;

function isOperator(str: string): str is Operator {
	return isElementUnionType(operators, str);
}

const operatorFunctions: Record<Operator, string> = {
	"+": "cmplxAdd",
	"-": "cmplxSub",
	"*": "cmplxMult",
	"/": "cmplxDiv",
	"^": "cmplxPow"
};

const symbols = ["z", "i", "pi", "tau", "e"] as const;

type Symbol = ElementUnion<typeof symbols>;

function isSymbol(str: string): str is Symbol {
	return isElementUnionType(symbols, str);
}

const symbolNames: Record<Symbol, string> = {
	z: "z",
	i: "I",
	pi: "CMPLX_PI",
	tau: "CMPLX_TAU",
	e: "CMPLX_E"
};

function generateGLSLForNode(node: ExpressionNode): string {
	switch (node.name) {
		case "number":
			return node.str;
		case "symbol":
			if (!isSymbol(node.str)) throw new Error(`Unknown symbol "${node.str}".`);
			return symbolNames[node.str];
		case "operation":
			let functionName: string | null = null;
			let numArgs = 0;
			if (isOperator(node.str)) {
				functionName = operatorFunctions[node.str];
				numArgs = 2;
			} else if (isFunctionName(node.str)) {
				functionName = getGLSLFunction(node.str);
				numArgs = getNumArgs(node.str);
			} else throw new Error(`Unknown operation "${node.str}".`);
			if (node.children.length !== numArgs) {
				throw new Error(
					`Expected ${numArgs} arguments for operation "${node.str}"; got ${node.children.length}.`
				);
			}
			const argString = node.children
				.map((child) => generateGLSLForNode(child))
				.join(", ");
			return `${functionName}(${argString})`;
		default:
			throw new Error(
				`Malformed expression tree: encountered tree node of unknown type ${node.name}`
			);
	}
}

function generateGLSL(tree: ExpressionTree): string {
	if (tree.root.children.length !== 1) {
		throw new Error(
			`Malformed expression tree: precisely one top level node is required; recieved ${tree.root.children.length}.`
		);
	}
	return generateGLSLForNode(tree.root.children[0]);
}

export { generateGLSL };
