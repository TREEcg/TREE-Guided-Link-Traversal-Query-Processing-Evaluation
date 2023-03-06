import type { ResourceIdentifier } from '../../http/representation/ResourceIdentifier';
import type { IdentifierGenerator } from './IdentifierGenerator';
/**
 * Generates identifiers by using the name as a subdomain on the base URL.
 * Non-alphanumeric characters will be replaced with `-`.
 */
export declare class SubdomainIdentifierGenerator implements IdentifierGenerator {
    private readonly baseParts;
    constructor(baseUrl: string);
    generate(name: string): ResourceIdentifier;
}
