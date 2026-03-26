import {evaluate} from './evaluate';
import {Parser} from './Parser';
import {tokenize} from './tokenize';

/**
 * Build a filter function from an OData filter string.
 * @param filter The OData filter string.
 * @returns A function that takes an object of type T and returns a boolean indicating whether the object matches the filter.
 * @example
 * const filter = createODataFilter<{name: string; age: number}>("name eq 'John' and age gt 30");
 * const filter = createODataFilter<{name: string; age: number}>("name eq 'John' or name eq 'Jane'");
 */
export function createODataFilter<T>(filter: string): (data: T) => boolean {
	const parser = new Parser(tokenize(filter));
	const astNode = parser.parse();
	return (data: T) => Boolean(evaluate(astNode, data as unknown as Record<string, unknown>));
}
