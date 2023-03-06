import type { OperationMetadataCollectorInput } from './OperationMetadataCollector';
import { OperationMetadataCollector } from './OperationMetadataCollector';
/**
 * Indicates which acl permissions are available on the requested resource.
 * Only adds public and agent permissions for HEAD/GET requests.
 */
export declare class WebAclMetadataCollector extends OperationMetadataCollector {
    handle({ metadata, operation }: OperationMetadataCollectorInput): Promise<void>;
}
