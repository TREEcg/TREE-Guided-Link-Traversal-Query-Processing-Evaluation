import type { TargetExtractor } from '../../http/input/identifier/TargetExtractor';
import type { HttpHandlerInput } from '../HttpHandler';
import { HttpHandler } from '../HttpHandler';
export interface RouterHandlerArgs {
    baseUrl: string;
    targetExtractor: TargetExtractor;
    handler: HttpHandler;
    allowedMethods: string[];
    allowedPathNames: string[];
}
/**
 * An HttpHandler that checks if a given method and path are satisfied
 * and allows its handler to be executed if so.
 *
 * If `allowedMethods` contains '*' it will match all methods.
 */
export declare class RouterHandler extends HttpHandler {
    private readonly baseUrl;
    private readonly targetExtractor;
    private readonly handler;
    private readonly allowedMethods;
    private readonly allMethods;
    private readonly allowedPathNamesRegEx;
    constructor(args: RouterHandlerArgs);
    canHandle(input: HttpHandlerInput): Promise<void>;
    handle(input: HttpHandlerInput): Promise<void>;
}
