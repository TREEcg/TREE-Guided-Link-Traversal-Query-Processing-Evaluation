/// <reference types="node" />
import type { Readable } from 'stream';
import type { Guarded } from '../../../util/GuardedStream';
import type { RepresentationMetadata } from '../../representation/RepresentationMetadata';
/**
 * The result of executing an operation.
 */
export declare class ResponseDescription {
    readonly statusCode: number;
    readonly metadata?: RepresentationMetadata;
    readonly data?: Guarded<Readable>;
    /**
     * @param statusCode - Status code to return.
     * @param metadata - Metadata corresponding to the response (and data potentially).
     * @param data - Data that needs to be returned. @ignored
     */
    constructor(statusCode: number, metadata?: RepresentationMetadata, data?: Guarded<Readable>);
}
