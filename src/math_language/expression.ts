class Operation {
	public readonly name: string;
	public readonly numArgs: number;

	constructor(name: string, numArgs: number) {
		this.name = name;
		this.numArgs = numArgs;
	}
}

class Value {
	public readonly value: string;

	constructor(value: string) {
		this.value = value;
	}
}

type Expression = (Operation | Value)[];

export { Operation, Value };

export type { Expression };
