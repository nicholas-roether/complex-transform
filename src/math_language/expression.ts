class ExpressionNode {
	public readonly tree: ExpressionTree;
	public readonly name: string;
	public readonly attributes: Map<string, string> = new Map();
	private _parent?: ExpressionNode;
	private _children: ExpressionNode[] = [];

	public get children(): ExpressionNode[] {
		return this._children;
	}

	public get str(): string {
		return this.getAttribute("str") ?? "";
	}

	public set str(val: string) {
		this.setAttribute("str", val);
	}

	constructor(tree: ExpressionTree, name: string) {
		this.tree = tree;
		this.name = name;
	}

	public get parent(): ExpressionNode | undefined {
		return this._parent;
	}

	public appendChild(node: ExpressionNode) {
		this.children.push(node);
		node._parent = this;
	}

	public prependChild(node: ExpressionNode) {
		this.children.unshift(node);
		node._parent = this;
	}

	public insertAbove(node: ExpressionNode) {
		const parent = this.parent;
		if (!parent) return;
		parent.removeChild(this);
		node.appendChild(this);
		parent.appendChild(node);
	}

	public removeChild(node: ExpressionNode) {
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
		return new ExpressionNode(this, name);
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

		function nodeToString(node: ExpressionNode, indentation = 0): string {
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

export { ExpressionTree, ExpressionNode };
