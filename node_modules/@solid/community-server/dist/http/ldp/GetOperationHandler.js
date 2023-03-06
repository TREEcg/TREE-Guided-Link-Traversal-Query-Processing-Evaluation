"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOperationHandler = void 0;
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const OkResponseDescription_1 = require("../output/response/OkResponseDescription");
const OperationHandler_1 = require("./OperationHandler");
/**
 * Handles GET {@link Operation}s.
 * Calls the getRepresentation function from a {@link ResourceStore}.
 */
class GetOperationHandler extends OperationHandler_1.OperationHandler {
    constructor(store) {
        super();
        this.store = store;
    }
    async canHandle({ operation }) {
        if (operation.method !== 'GET') {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('This handler only supports GET operations');
        }
    }
    async handle({ operation }) {
        const body = await this.store.getRepresentation(operation.target, operation.preferences, operation.conditions);
        return new OkResponseDescription_1.OkResponseDescription(body.metadata, body.data);
    }
}
exports.GetOperationHandler = GetOperationHandler;
//# sourceMappingURL=GetOperationHandler.js.map