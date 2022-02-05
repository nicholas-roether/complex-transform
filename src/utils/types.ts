type ElementUnion<A extends readonly string[]> = A[number];

function isElementUnionType<
	A extends readonly string[],
	U extends ElementUnion<A>
>(array: A, value: string): value is U {
	return (array as readonly string[]).includes(value);
}

export { isElementUnionType };

export type { ElementUnion };
