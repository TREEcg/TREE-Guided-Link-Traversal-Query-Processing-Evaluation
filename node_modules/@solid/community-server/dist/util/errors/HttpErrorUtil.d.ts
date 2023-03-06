import { HttpError } from './HttpError';
/**
 * Returns the HTTP status code corresponding to the error.
 */
export declare function getStatusCode(error: Error): number;
/**
 * Combines a list of errors into a single HttpErrors.
 * Status code depends on the input errors. If they all share the same status code that code will be re-used.
 * If they are all within the 4xx range, 400 will be used, otherwise 500.
 *
 * @param errors - Errors to combine.
 * @param messagePrefix - Prefix for the aggregate error message. Will be followed with an array of all the messages.
 */
export declare function createAggregateError(errors: Error[], messagePrefix?: string): HttpError;
