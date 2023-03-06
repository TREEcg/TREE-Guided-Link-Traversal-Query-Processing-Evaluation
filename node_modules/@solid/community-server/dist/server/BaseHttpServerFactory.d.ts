/// <reference types="node" />
import type { Server } from 'http';
import type { HttpHandler } from './HttpHandler';
import type { HttpServerFactory } from './HttpServerFactory';
/**
 * Options to be used when creating the server.
 * Due to Components.js not supporting external types, this has been simplified (for now?).
 * The common https keys here (key/cert/pfx) will be interpreted as file paths that need to be read
 * before passing the options to the `createServer` function.
 */
export interface BaseHttpServerOptions {
    /**
     * If the server should start as an http or https server.
     */
    https?: boolean;
    /**
     * If the error stack traces should be shown in case the HttpHandler throws one.
     */
    showStackTrace?: boolean;
    key?: string;
    cert?: string;
    pfx?: string;
    passphrase?: string;
}
/**
 * HttpServerFactory based on the native Node.js http module
 */
export declare class BaseHttpServerFactory implements HttpServerFactory {
    protected readonly logger: import("..").Logger;
    /** The main HttpHandler */
    private readonly handler;
    private readonly options;
    constructor(handler: HttpHandler, options?: BaseHttpServerOptions);
    /**
     * Creates and starts an HTTP(S) server
     * @param port - Port on which the server listens
     */
    startServer(port: number): Server;
    private createServerOptions;
}
