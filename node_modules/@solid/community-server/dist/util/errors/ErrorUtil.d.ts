/**
 * Checks if the input is an {@link Error}.
 */
export declare function isError(error: any): error is Error;
/**
 * Asserts that the input is a native error.
 * If not the input will be re-thrown.
 */
export declare function assertError(error: unknown): asserts error is Error;
export declare function createErrorMessage(error: unknown): string;
