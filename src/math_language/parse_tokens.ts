import { Token, TokenType } from "./lex";

class ExpressionTreeNode {
	public readonly tree: ExpressionTree;
	public readonly name: string;
	public readonly attributes: Map<string, string> = new Map();
	private _parent?: ExpressionTreeNode;
	private _children: ExpressionTreeNode[] = [];

	public get children(): ExpressionTreeNode[] {
		return this._children;
	}

	constructor(tree: ExpressionTree, name: string) {
		this.tree = tree;
		this.name = name;
	}

	public get parent(): ExpressionTreeNode | undefined {
		return this._parent;
	}

	public appendChild(node: ExpressionTreeNode) {
		this.children.push(node);
		node._parent = this;
	}

	public prependChild(node: ExpressionTreeNode) {
		this.children.unshift(node);
		node._parent = this;
	}

	public insertAbove(node: ExpressionTreeNode) {
		const parent = this.parent;
		if (!parent) return;
		parent.removeChild(this);
		node.appendChild(this);
		parent.appendChild(node);
	}

	public removeChild(node: ExpressionTreeNode) {
		this.children.splice(this.children.indexOf(node), 1);
		node._parent = undefined;
	}

	public setAttribute(name: string, value: string) {
		this.attributes.set(name, value);
	}

	public getAttribute(name: string): string | undefined {
		return this.attributes.get(name);
	}

	public deleteAttribute(name: string): void {
		this.attributes.delete(name);
	}
}

class ExpressionTree {
	public readonly root = this.createNode("_root");

	public createNode(name: string) {
		return new ExpressionTreeNode(this, name);
	}

	public toString(): string {
		function attributesToString(attributes: Map<string, string>): string {
			let attribStrs: string[] = [];
			for (const key of attributes.keys()) {
				const value = attributes.get(key);
				let str = "";
				if (value !== undefined) str += key;
				if (value !== "") str += `="${value}"`;
				attribStrs.push(str);
			}
			return attribStrs.join(" ");
		}

		function nodeToString(node: ExpressionTreeNode, indentation = 0): string {
			let openingTagContent = node.name;
			if (node.attributes.size > 0)
				openingTagContent += " " + attributesToString(node.attributes);
			const indentationStr = "   ".repeat(indentation);
			if (node.children.length === 0)
				return `${indentationStr}<${openingTagContent} />`;
			return (
				indentationStr +
				`<${openingTagContent}>\n` +
				node.children
					.map((child) => nodeToString(child, indentation + 1))
					.join("\n") +
				`\n${indentationStr}</${node.name}>`
			);
		}

		return nodeToString(this.root);
	}
}

type Operator = "+" | "-" | "*" | "" | "/" | "^";

const operators: string[] = ["+", "-", "*", "", "/", "^"];

const operatorPrecedence: Record<Operator, number> = {
	"+": 0,
	"-": 0,
	"*": 1,
	"": 1,
	"/": 1,
	"^": 2
};

const functionPrecedence =
	Object.values(operatorPrecedence).sort((a, b) => b - a)[0] + 1;

function isKnownOperator(operator: string): operator is Operator {
	return operators.includes(operator);
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

function parseTokensToTree(tokens: Token[]): ExpressionTree {
	const tree = new ExpressionTree();
	let state: TreeParseState = TreeParseState.EXPECT_VALUE;
	let rootStack: ExpressionTreeNode[] = [tree.root];
	let functionStack: ExpressionTreeNode[] = [];

	const getCurrentRoot = () => rootStack[rootStack.length - 1];
	const getCurrentFunction = () => functionStack[functionStack.length - 1];

	let currentNode = getCurrentRoot();

	function climbToNode(callback: (node: ExpressionTreeNode) => boolean) {
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

	function findParentOperationNodes(
		node: ExpressionTreeNode
	): ExpressionTreeNode[] {
		const operations = [];
		if (node === getCurrentRoot()) return [];
		if (node.name === "operation") operations.push(node);
		if (node.parent) operations.push(...findParentOperationNodes(node.parent));
		return operations;
	}

	function getOperationPrecedence(node: ExpressionTreeNode): number {
		if (node.name !== "operation")
			throw new Error("Non-operation nodes do not have precedence");
		const precedenceAttr = node.getAttribute("precedence");
		if (precedenceAttr !== undefined) return Number.parseInt(precedenceAttr);
		return 0;
	}

	function getHighestAbovePrecedence(precedence: number): ExpressionTreeNode {
		const parentOperations = findParentOperationNodes(currentNode);
		let result: ExpressionTreeNode = currentNode;
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

	function insertValueNode(string: string): void {
		climbToNode((node) => node.name === "operation");
		const valueNode = tree.createNode("value");
		valueNode.setAttribute("str", string);
		currentNode.appendChild(valueNode);
		currentNode = valueNode;
	}

	function insertOperationNode(string: string, precedence: number): void {
		const insertionPoint = getHighestAbovePrecedence(precedence);
		const operationNode = tree.createNode("operation");
		operationNode.setAttribute("str", string);
		operationNode.setAttribute("precedence", precedence.toString());
		insertionPoint.insertAbove(operationNode);
		currentNode = operationNode;
	}

	function insertFunctionNode(string: string): void {
		const insertionPoint = getHighestAbovePrecedence(functionPrecedence);
		const operationNode = tree.createNode("operation");
		operationNode.setAttribute("str", string);
		operationNode.setAttribute("precedence", functionPrecedence.toString());
		insertionPoint.appendChild(operationNode);
		currentNode = operationNode;
	}

	for (const token of tokens) {
		switch (token.type) {
			case TokenType.VALUE:
				if (state !== TreeParseState.EXPECT_VALUE)
					throw new Error("Unexpected value token.");
				insertValueNode(token.string);
				state = TreeParseState.AFTER_VALUE;
				break;
			case TokenType.OPERATOR:
				if (state !== TreeParseState.AFTER_VALUE)
					throw new Error("Unexpected operator token.");
				const precedence = getOperatorPrecendence(token.string);
				insertOperationNode(token.string, precedence);
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

export { parseTokensToTree };
