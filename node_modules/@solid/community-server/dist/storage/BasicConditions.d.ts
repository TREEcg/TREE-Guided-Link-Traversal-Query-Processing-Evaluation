import type { RepresentationMetadata } from '../http/representation/RepresentationMetadata';
import type { Conditions } from './Conditions';
export interface BasicConditionsOptions {
    matchesETag?: string[];
    notMatchesETag?: string[];
    modifiedSince?: Date;
    unmodifiedSince?: Date;
}
/**
 * Stores all the relevant Conditions values and matches them based on RFC7232.
 */
export declare class BasicConditions implements Conditions {
    readonly matchesETag?: string[];
    readonly notMatchesETag?: string[];
    readonly modifiedSince?: Date;
    readonly unmodifiedSince?: Date;
    constructor(options: BasicConditionsOptions);
    matchesMetadata(metadata?: RepresentationMetadata): boolean;
    matches(eTag?: string, lastModified?: Date): boolean;
}
