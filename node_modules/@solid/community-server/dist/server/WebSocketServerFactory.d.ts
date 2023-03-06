/// <reference types="node" />
import type { Server } from 'http';
import type { HttpServerFactory } from './HttpServerFactory';
import type { WebSocketHandler } from './WebSocketHandler';
/**
 * Factory that adds WebSocket functionality to an existing server
 */
export declare class WebSocketServerFactory implements HttpServerFactory {
    private readonly baseServerFactory;
    private readonly webSocketHandler;
    constructor(baseServerFactory: HttpServerFactory, webSocketHandler: WebSocketHandler);
    startServer(port: number): Server;
}
