"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHttpRequest = void 0;
/**
 * Checks if the given stream is an HttpRequest.
 */
function isHttpRequest(stream) {
    return typeof stream.socket === 'object' && typeof stream.url === 'string' && typeof stream.method === 'string';
}
exports.isHttpRequest = isHttpRequest;
//# sourceMappingURL=HttpRequest.js.map