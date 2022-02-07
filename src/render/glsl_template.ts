class GLSLTemplateError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "GLSLTemplateVariableError";
	}
}

const VARIABLE_REGEX = /%([A-Z_][A-Z0-9_]*)%/g;

class GLSLTemplate {
	public readonly raw: string;

	constructor(raw: string) {
		this.raw = raw;
	}

	generate(assignments: Record<string, string>): string {
		const variables = new Set<string>();
		const assignmentNames = Object.keys(assignments);
		for (const match of this.raw.matchAll(VARIABLE_REGEX))
			variables.add(match[1]);
		let result = this.raw;
		for (const varName of new Set([...assignmentNames, ...variables])) {
			if (!assignmentNames.includes(varName))
				throw new GLSLTemplateError(`Missing required variable "${varName}".`);
			else if (!variables.has(varName)) {
				const knownVariables = Array.from(variables).map((name) => `"${name}"`);
				let knownVariableString = "";
				if (knownVariables.length > 0) {
					knownVariableString += `(known variables are: ${knownVariables.join(
						", "
					)} `;
				} else
					knownVariableString = "The shader contains no template variables.";
				throw new GLSLTemplateError(
					`Unknown variable "${varName}". ${knownVariableString}`
				);
			}
			result = result.replaceAll(`%${varName}%`, assignments[varName]);
		}
		return result;
	}
}

export default GLSLTemplate;
