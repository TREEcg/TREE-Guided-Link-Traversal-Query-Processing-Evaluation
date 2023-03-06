import type { CredentialSet } from './Credentials';
import { CredentialsExtractor } from './CredentialsExtractor';
/**
 * Extracts the public credentials, to be used for data everyone has access to.
 */
export declare class PublicCredentialsExtractor extends CredentialsExtractor {
    handle(): Promise<CredentialSet>;
}
