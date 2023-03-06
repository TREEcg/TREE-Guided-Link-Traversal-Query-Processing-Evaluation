import { UnionHandler } from '../util/handlers/UnionHandler';
import type { CredentialSet } from './Credentials';
import type { CredentialsExtractor } from './CredentialsExtractor';
/**
 * Combines the results of several CredentialsExtractors into one.
 * If multiple of these extractors return a value for the same key,
 * the last result will be used.
 */
export declare class UnionCredentialsExtractor extends UnionHandler<CredentialsExtractor> {
    constructor(extractors: CredentialsExtractor[]);
    combine(results: CredentialSet[]): Promise<CredentialSet>;
}
