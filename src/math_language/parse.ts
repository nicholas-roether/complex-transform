import { ElementUnion, isElementUnionType } from "../utils/types";
import { ExpressionNode, ExpressionTree } from "./expression";
import { Token, TokenType } from "./lex";

const operators = ["+", "-", "*", "/", "^"] as const;

type Operator = ElementUnion<typeof operators>;

const operatorPrecedence: Record<Operator, number> = {
	"+": 0,
	"-": 1,
	"*": 2,
	"/": 3,
	"^": 4
};

const functionPrecedence =
	Object.values(operatorPrecedence).sort((a, b) => b - a)[0] + 1;

function isKnownOperator(operator: string): operator is Operator {
	return isElementUnionType(operators, operator);
}

function getOperatorPrecendence(operator: string): number {
	if (!isKnownOperator(operator))
		throw new Error(`Unknown operator "${operator}"`);
	return operatorPrecedence[operator];
}

enum TreeParseState {
	EXPECT_VALUE,
	AFTER_VALUE,
	EXPECT_ARGUMENT_LIST
}

function parse(tokens: Token[]): ExpressionTree {
	const tree = new ExpressionTree();
	let state: TreeParseState = TreeParseState.EXPECT_VALUE;
	let rootStack: ExpressionNode[] = [tree.root];
	let functionStack: ExpressionNode[] = [];

	const getCurrentRoot = () => rootStack[rootStack.length - 1];
	const getCurrentFunction = () => functionStack[functionStack.length - 1];

	let currentNode = getCurrentRoot();

	function climbToNode(callback: (node: ExpressionNode) => boolean) {
		if (currentNode === getCurrentRoot()) return;
		while (!callback(currentNode) && currentNode.parent) {
			if (currentNode.parent === getCurrentRoot()) break;
			currentNode = currentNode.parent;
		}
	}

	function pushRoot() {
		rootStack.push(currentNode);
	}

	function popRoot() {
		currentNode = rootStack.pop() ?? tree.root;
		if (rootStack.length === 0) rootStack = [tree.root];
	}

	function findParentOperationNodes(node: ExpressionNode): ExpressionNode[] {
		const operations = [];
		if (node === getCurrentRoot()) return [];
		if (node.name === "operation") operations.push(node);
		if (node.parent) operations.push(...findParentOperationNodes(node.parent));
		return operations;
	}

	function getOperationPrecedence(node: ExpressionNode): number {
		if (node.name !== "operation")
			throw new Error("Non-operation nodes do not have precedence");
		const precedenceAttr = node.getAttribute("precedence");
		if (precedenceAttr !== undefined) return Number.parseInt(precedenceAttr);
		return 0;
	}

	function getHighestAbovePrecedence(precedence: number): ExpressionNode {
		const parentOperations = findParentOperationNodes(currentNode);
		let result: ExpressionNode = currentNode;
		while (
			parentOperations.length > 0 &&
			getOperationPrecedence(parentOperations[0]) > precedence
		) {
			const res = parentOperations.shift();
			if (!res) {
				throw new Error(
					"An error occurred when computing operation precedence."
				);
			}
			result = res;
		}
		return result;
	}

	function insertValueNode(type: string, string: string): void {
		climbToNode((node) => node.name === "operation");
		const valueNode = tree.createNode(type);
		valueNode.str = string;
		currentNode.appendChild(valueNode);
		currentNode = valueNode;
	}

	function insertOperationNode(string: string, precedence: number): void {
		const insertionPoint = getHighestAbovePrecedence(precedence);
		const operationNode = tree.createNode("operation");
		operationNode.str = string;
		operationNode.setAttribute("precedence", precedence.toString());
		insertionPoint.insertAbove(operationNode);
		currentNode = operationNode;
	}

	function insertFunctionNode(string: string): void {
		const insertionPoint = getHighestAbovePrecedence(functionPrecedence);
		const operationNode = tree.createNode("operation");
		operationNode.str = string;
		operationNode.setAttribute("precedence", functionPrecedence.toString());
		insertionPoint.appendChild(operationNode);
		currentNode = operationNode;
	}

	for (const token of tokens) {
		switch (token.type) {
			case TokenType.NUMBER:
				if (state !== TreeParseState.EXPECT_VALUE)
					throw new Error("Unexpected number token.");
				insertValueNode("number", token.string);
				state = TreeParseState.AFTER_VALUE;
				break;
			case TokenType.SYMBOL:
				if (state !== TreeParseState.EXPECT_VALUE)
					throw new Error("Unexpected variable token.");
				insertValueNode("symbol", token.string);
				state = TreeParseState.AFTER_VALUE;
				break;
			case TokenType.OPERATOR:
				if (state !== TreeParseState.AFTER_VALUE)
					throw new Error("Unexpected operator token.");
				const operator = token.string === "" ? "*" : token.string;
				const precedence = getOperatorPrecendence(operator);
				insertOperationNode(operator, precedence);
				state = TreeParseState.EXPECT_VALUE;
				break;
			case TokenType.FUNCTION_NAME:
				if (state !== TreeParseState.EXPECT_VALUE)
					throw new Error("Unexpected function name token.");
				insertFunctionNode(token.string);
				functionStack.push(currentNode);
				pushRoot();
				state = TreeParseState.EXPECT_ARGUMENT_LIST;
				break;
			case TokenType.FUNCTION_ARGS_START:
				if (state !== TreeParseState.EXPECT_ARGUMENT_LIST)
					throw new Error("Unexpected argument list start token.");
				state = TreeParseState.EXPECT_VALUE;
				break;
			case TokenType.FUNCTION_ARGS_END:
				if (state !== TreeParseState.AFTER_VALUE || functionStack.length === 0)
					throw new Error("Unexpected argument list end token.");
				functionStack.pop();
				popRoot();
				state = TreeParseState.AFTER_VALUE;
				break;
			case TokenType.ARG_SEPERATOR:
				if (state !== TreeParseState.AFTER_VALUE || functionStack.length === 0)
					throw new Error("Unexpected argument separator token.");
				currentNode = getCurrentFunction();
				state = TreeParseState.EXPECT_VALUE;
				break;
			case TokenType.PARENTHESIS_OPEN:
				if (state !== TreeParseState.EXPECT_VALUE)
					throw new Error("Unexpected parenthesis open token.");
				pushRoot();
				state = TreeParseState.EXPECT_VALUE;
				break;
			case TokenType.PARENTHESIS_CLOSE:
				if (state !== TreeParseState.AFTER_VALUE || rootStack.length <= 1)
					throw new Error("Unexpected parenthesis close token.");
				popRoot();
		}
	}

	return tree;
}

export { parse };
