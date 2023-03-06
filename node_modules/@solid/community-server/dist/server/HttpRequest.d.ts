/// <reference types="node" />
import type { IncomingMessage } from 'http';
import type { Guarded } from '../util/GuardedStream';
/**
 * An incoming HTTP request;
 */
export declare type HttpRequest = Guarded<IncomingMessage>;
/**
 * Checks if the given stream is an HttpRequest.
 */
export declare function isHttpRequest(stream: any): stream is HttpRequest;
