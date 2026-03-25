import {evaluate} from './evaluate';
import {Parser} from './Parser';
import {tokenize} from './tokenize';

/**
 * Build a filter function from an OData filter string.
 * @param filter The OData filter string.
 * @returns A function that takes an object of type T and returns a boolean indicating whether the object matches the filter.
 * @example
 * const filter = buildODataFilter<{name: string; age: number}>("name eq 'John' and age gt 30");
 * const filter = buildODataFilter<{name: string; age: number}>("name eq 'John' or name eq 'Jane'");
 */
export function buildODataFilter<T>(filter: string): (data: T) => boolean {
	const tokens = tokenize(filter);
	const parser = new Parser(tokens);
	const ast = parser.parse();
	return (data: T) => Boolean(evaluate(ast, data as unknown as Record<string, unknown>));
}
