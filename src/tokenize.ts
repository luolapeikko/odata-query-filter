import type { Token } from "./tokenTypes";

const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const whiteSpaceChars = new Set([' ', '\t', '\r', '\n']);

/**
 * Tokenize an OData filter string into an array of tokens.
 * @param input The OData filter string.
 * @returns An array of tokens representing the filter string.
 */
export function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
        // Skip whitespace
        if (whiteSpaceChars.has(input[i])) {
            i++;
            continue;
        }

        // Parentheses
        if (input[i] === '(') {
            tokens.push({type: 'lparen', value: '('});
            i++;
            continue;
        }
        if (input[i] === ')') {
            tokens.push({type: 'rparen', value: ')'});
            i++;
            continue;
        }

        // Comma
        if (input[i] === ',') {
            tokens.push({type: 'comma', value: ','});
            i++;
            continue;
        }

        // Forward slash (property path separator)
        if (input[i] === '/') {
            tokens.push({type: 'slash', value: '/'});
            i++;
            continue;
        }

        // Colon (lambda separator)
        if (input[i] === ':') {
            tokens.push({type: 'colon', value: ':'});
            i++;
            continue;
        }

        // String literal
        if (input[i] === "'") {
            i++; // skip opening quote
            let str = '';
            while (i < input.length) {
                if (input[i] === "'" && input[i + 1] === "'") {
                    str += "'"; // escaped single quote
                    i += 2;
                } else if (input[i] === "'") {
                    break;
                } else {
                    str += input[i];
                    i++;
                }
            }
            if (i >= input.length) {
                throw new Error('Unterminated string literal');
            }
            i++; // skip closing quote
            tokens.push({type: 'string', value: str});
            continue;
        }

        const datetimeCandidate = input.slice(i, i + 35);
        const datetimeMatch = datetimeCandidate.match(ISO_DATETIME_REGEX);
        if (datetimeMatch) {
            tokens.push({type: 'datetime', value: datetimeMatch[0]});
            i += datetimeMatch[0].length;
            continue;
        }

        // Number literal (including negative)
        if ((input[i] >= '0' && input[i] <= '9') || (input[i] === '-' && i + 1 < input.length && input[i + 1] >= '0' && input[i + 1] <= '9')) {
            let num = '';
            if (input[i] === '-') {
                num += '-';
                i++;
            }
            while (i < input.length && ((input[i] >= '0' && input[i] <= '9') || input[i] === '.')) {
                num += input[i];
                i++;
            }
            tokens.push({type: 'number', value: num});
            continue;
        }

        // Identifiers / keywords
        if ((input[i] >= 'a' && input[i] <= 'z') || (input[i] >= 'A' && input[i] <= 'Z') || input[i] === '_') {
            let ident = '';
            while (
                i < input.length &&
                ((input[i] >= 'a' && input[i] <= 'z') || (input[i] >= 'A' && input[i] <= 'Z') || (input[i] >= '0' && input[i] <= '9') || input[i] === '_')
            ) {
                ident += input[i];
                i++;
            }
            if (ident === 'true' || ident === 'false') {
                tokens.push({type: 'boolean', value: ident});
            } else if (ident === 'null') {
                tokens.push({type: 'null', value: 'null'});
            } else {
                tokens.push({type: 'identifier', value: ident});
            }
            continue;
        }

        throw new Error(`Unexpected character '${input[i]}' at position ${i}`);
    }

    return tokens;
}