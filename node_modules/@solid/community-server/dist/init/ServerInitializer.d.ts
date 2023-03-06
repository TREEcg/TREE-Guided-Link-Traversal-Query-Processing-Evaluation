import type { HttpServerFactory } from '../server/HttpServerFactory';
import type { Finalizable } from './final/Finalizable';
import { Initializer } from './Initializer';
/**
 * Creates and starts an HTTP server.
 */
export declare class ServerInitializer extends Initializer implements Finalizable {
    private readonly serverFactory;
    private readonly port;
    private server?;
    constructor(serverFactory: HttpServerFactory, port: number);
    handle(): Promise<void>;
    finalize(): Promise<void>;
}
