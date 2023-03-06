import { AsyncHandler } from './AsyncHandler';
declare type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
declare type InType<T extends AsyncHandler<any, any>> = Parameters<T['handle']>[0];
declare type OutType<T extends AsyncHandler<any, any>> = Awaited<ReturnType<T['handle']>>;
/**
 * Utility handler that allows combining the results of multiple handlers into one.
 * Will run the handlers and then call the abstract `combine` function with the results,
 * which then generates the handler's output.
 */
export declare abstract class UnionHandler<T extends AsyncHandler<any, any>> extends AsyncHandler<InType<T>, OutType<T>> {
    protected readonly handlers: T[];
    private readonly requireAll;
    private readonly ignoreErrors;
    /**
     * Creates a new `UnionHandler`.
     *
     * When `requireAll` is false or `ignoreErrors` is true,
     * the length of the input to `combine` can vary;
     * otherwise, it is exactly the number of handlers.
     *
     * @param handlers - The handlers whose output is to be combined.
     * @param requireAll - If true, will fail if any of the handlers do not support the input.
                           If false, only the handlers that support the input will be called;
     *                     will fail only if none of the handlers can handle the input.
     * @param ignoreErrors - If true, ignores handlers that fail by omitting their output;
     *                       if false, fails when any handlers fail.
     */
    constructor(handlers: T[], requireAll?: boolean, ignoreErrors?: boolean);
    canHandle(input: InType<T>): Promise<void>;
    handle(input: InType<T>): Promise<OutType<T>>;
    /**
     * Checks if all handlers can handle the input.
     * If not, throw an error based on the errors of the failed handlers.
     */
    protected allCanHandle(input: InType<T>): Promise<void>;
    /**
     * Combines the results of the handlers into a single output.
     */
    protected abstract combine(results: OutType<T>[]): Promise<OutType<T>>;
}
export {};
