enum TokenType {
	NUMBER,
	SYMBOL,
	OPERATOR,
	PARENTHESIS_OPEN,
	PARENTHESIS_CLOSE,
	FUNCTION_NAME,
	FUNCTION_ARGS_START,
	FUNCTION_ARGS_END,
	ARG_SEPERATOR
}

interface Token {
	type: TokenType;
	string: string;
}

enum LexState {
	EXPECT_VALUE,
	VARIABLE_OR_FUNCTION,
	NUMBER,
	DECIMAL_EXPANSION,
	AFTER_VALUE
}

type ClosingParenthesis =
	| TokenType.PARENTHESIS_CLOSE
	| TokenType.FUNCTION_ARGS_END;

class LexingError extends Error {
	public readonly char: string;
	public readonly index: number;

	constructor(message: string, char: string, index: number) {
		super(`Unexpected character "${char}" at index ${index}: ${message}`);
		this.char = char;
		this.index = index;
	}
}

function lex(str: string): Token[] {
	let tokens: Token[] = [];
	let state = LexState.EXPECT_VALUE;
	let parenthesisStack: ClosingParenthesis[] = [];
	let token: string = "";

	const operatorRegex = /[+\-*/^]/;
	// This means that "-" is now a valid number...
	const numberStartRegex = /[-0-9]/;
	const numberRegex = /[0-9]/;
	const variableStartRegex = /[a-z]/i;
	const variableRegex = /[a-z0-9_]/i;

	const pushToken = (type: TokenType) => {
		tokens.push({ type, string: token });
		token = "";
	};

	str.split("").forEach((char, i) => {
		if (char === " ") {
			switch (state) {
				case LexState.NUMBER:
				case LexState.DECIMAL_EXPANSION:
					state = LexState.AFTER_VALUE;
					pushToken(TokenType.NUMBER);
					break;
				case LexState.VARIABLE_OR_FUNCTION:
					state = LexState.AFTER_VALUE;
					pushToken(TokenType.SYMBOL);
					break;
				case LexState.AFTER_VALUE:
				case LexState.EXPECT_VALUE:
					break;
			}
		} else if (char === "(") {
			switch (state) {
				case LexState.NUMBER:
				case LexState.DECIMAL_EXPANSION:
					parenthesisStack.push(TokenType.PARENTHESIS_CLOSE);
					pushToken(TokenType.NUMBER);
					pushToken(TokenType.OPERATOR); // Implicit multiplication (string = "")
					token += char;
					pushToken(TokenType.PARENTHESIS_OPEN);
					break;
				case LexState.VARIABLE_OR_FUNCTION:
					parenthesisStack.push(TokenType.FUNCTION_ARGS_END);
					pushToken(TokenType.FUNCTION_NAME);
					token += char;
					pushToken(TokenType.FUNCTION_ARGS_START);
					break;
				case LexState.AFTER_VALUE:
					parenthesisStack.push(TokenType.PARENTHESIS_CLOSE);
					pushToken(TokenType.OPERATOR); // Implicit multiplication
					token += char;
					pushToken(TokenType.PARENTHESIS_OPEN);
					break;
				case LexState.EXPECT_VALUE:
					parenthesisStack.push(TokenType.PARENTHESIS_CLOSE);
					token += char;
					pushToken(TokenType.PARENTHESIS_OPEN);
			}
			state = LexState.EXPECT_VALUE;
		} else if (char === ")") {
			if (parenthesisStack.length === 0) {
				throw new LexingError("Unmatched closing parenthesis.", char, i);
			}
			switch (state) {
				case LexState.NUMBER:
				case LexState.DECIMAL_EXPANSION:
					pushToken(TokenType.NUMBER);
					token += char;
					// pop will never return undefined because we check that parenthesisStack is never empty.
					pushToken(parenthesisStack.pop() as ClosingParenthesis);
					break;
				case LexState.VARIABLE_OR_FUNCTION:
					pushToken(TokenType.SYMBOL);
					token += char;
					pushToken(parenthesisStack.pop() as ClosingParenthesis);
					break;
				case LexState.AFTER_VALUE:
					token += char;
					pushToken(parenthesisStack.pop() as ClosingParenthesis);
					break;
				case LexState.EXPECT_VALUE:
					throw new LexingError(
						"Expected a number, variable or function name.",
						char,
						i
					);
			}
			state = LexState.AFTER_VALUE;
		} else if (char === ".") {
			switch (state) {
				case LexState.NUMBER:
					state = LexState.DECIMAL_EXPANSION;
					token += char;
					break;
				default:
					throw new LexingError(
						"This symbol may only appear inside number literals.",
						char,
						i
					);
			}
		} else if (char === ",") {
			// Argument separators may only appear if the current structure is a function (no unmatched parentheses, etc.)
			if (
				parenthesisStack[parenthesisStack.length - 1] ===
				TokenType.FUNCTION_ARGS_END
			) {
				switch (state) {
					case LexState.NUMBER:
					case LexState.DECIMAL_EXPANSION:
					case LexState.VARIABLE_OR_FUNCTION:
						pushToken(TokenType.SYMBOL);
						break;
					case LexState.AFTER_VALUE:
						// This means the previous value token is already finished.
						break;
					case LexState.EXPECT_VALUE:
						// This means that the argument is incomplete (e.g. "2 *" or "x ^").
						throw new LexingError(
							"The preceding function argument is incomplete",
							char,
							i
						);
				}
				state = LexState.EXPECT_VALUE;
				token += char;
				pushToken(TokenType.ARG_SEPERATOR);
			} else {
				throw new LexingError(
					"Commas may only appear within a function argument list.",
					char,
					i
				);
			}
		} else {
			switch (state) {
				case LexState.NUMBER:
				case LexState.DECIMAL_EXPANSION:
					if (numberRegex.test(char)) token += char;
					else if (variableStartRegex.test(char)) {
						state = LexState.VARIABLE_OR_FUNCTION;
						pushToken(TokenType.NUMBER);
						pushToken(TokenType.OPERATOR); // Implicit multiplication
						token += char;
					} else if (operatorRegex.test(char)) {
						state = LexState.EXPECT_VALUE;
						pushToken(TokenType.NUMBER);
						token += char;
						pushToken(TokenType.OPERATOR);
					} else {
						throw new LexingError(
							"This character cannot appear inside a number literal.",
							char,
							i
						);
					}
					break;
				case LexState.VARIABLE_OR_FUNCTION:
					if (variableRegex.test(char)) token += char;
					else if (operatorRegex.test(char)) {
						state = LexState.EXPECT_VALUE;
						pushToken(TokenType.SYMBOL);
						token += char;
						pushToken(TokenType.OPERATOR);
					} else {
						throw new LexingError(
							"This character cannot appear inside a variable or function name.",
							char,
							i
						);
					}
					break;
				case LexState.AFTER_VALUE:
					if (variableStartRegex.test(char)) {
						state = LexState.VARIABLE_OR_FUNCTION;
						pushToken(TokenType.OPERATOR); // Implicit multiplication
						token += char;
					} else if (operatorRegex.test(char)) {
						state = LexState.EXPECT_VALUE;
						token += char;
						pushToken(TokenType.OPERATOR);
					} else {
						throw new LexingError(
							"This character cannot appear after a complete operation statement.",
							char,
							i
						);
					}
					break;
				case LexState.EXPECT_VALUE:
					if (numberStartRegex.test(char)) {
						state = LexState.NUMBER;
						token += char;
					} else if (variableStartRegex.test(char)) {
						state = LexState.VARIABLE_OR_FUNCTION;
						token += char;
					} else {
						throw new LexingError(
							"Expected a number, variable or function name.",
							char,
							i
						);
					}
			}
		}
	});

	switch (state as LexState) {
		case LexState.NUMBER:
		case LexState.DECIMAL_EXPANSION:
			pushToken(TokenType.NUMBER);
			break;
		case LexState.VARIABLE_OR_FUNCTION:
			pushToken(TokenType.SYMBOL);
			break;
		case LexState.EXPECT_VALUE:
			throw new LexingError(
				"Expected a number, variable or function name.",
				"END OF STRING",
				str.length
			);
	}

	return tokens;
}

export { lex, Token, TokenType };
