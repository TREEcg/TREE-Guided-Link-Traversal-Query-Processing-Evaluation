"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServerFactory = void 0;
const ws_1 = require("ws");
/**
 * Factory that adds WebSocket functionality to an existing server
 */
class WebSocketServerFactory {
    constructor(baseServerFactory, webSocketHandler) {
        this.baseServerFactory = baseServerFactory;
        this.webSocketHandler = webSocketHandler;
    }
    startServer(port) {
        // Create WebSocket server
        const webSocketServer = new ws_1.Server({ noServer: true });
        webSocketServer.on('connection', async (webSocket, upgradeRequest) => {
            await this.webSocketHandler.handleSafe({ webSocket, upgradeRequest });
        });
        // Create base HTTP server
        const httpServer = this.baseServerFactory.startServer(port);
        httpServer.on('upgrade', (upgradeRequest, socket, head) => {
            webSocketServer.handleUpgrade(upgradeRequest, socket, head, (webSocket) => {
                webSocketServer.emit('connection', webSocket, upgradeRequest);
            });
        });
        return httpServer;
    }
}
exports.WebSocketServerFactory = WebSocketServerFactory;
//# sourceMappingURL=WebSocketServerFactory.js.map