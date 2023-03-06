/**
 * A function that simulates the Array.some behaviour but on an array of Promises.
 * Returns true if at least one promise returns true.
 * Returns false if all promises return false or error.
 *
 * @remarks
 *
 * Predicates provided as input must be implemented considering
 * the following points:
 * 1. if they throw an error, it won't be propagated;
 * 2. throwing an error should be logically equivalent to returning false.
 */
export declare function promiseSome(predicates: Promise<boolean>[]): Promise<boolean>;
/**
 * Obtains the values of all fulfilled promises.
 * If there are rejections (and `ignoreErrors` is false), throws a combined error of all rejected promises.
 */
export declare function allFulfilled<T>(promises: Promise<T>[], ignoreErrors?: boolean): Promise<T[]>;
