"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadOperationHandler = void 0;
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const OkResponseDescription_1 = require("../output/response/OkResponseDescription");
const OperationHandler_1 = require("./OperationHandler");
/**
 * Handles HEAD {@link Operation}s.
 * Calls the getRepresentation function from a {@link ResourceStore}.
 */
class HeadOperationHandler extends OperationHandler_1.OperationHandler {
    constructor(store) {
        super();
        this.store = store;
    }
    async canHandle({ operation }) {
        if (operation.method !== 'HEAD') {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('This handler only supports HEAD operations');
        }
    }
    async handle({ operation }) {
        const body = await this.store.getRepresentation(operation.target, operation.preferences, operation.conditions);
        // Close the Readable as we will not return it.
        body.data.destroy();
        return new OkResponseDescription_1.OkResponseDescription(body.metadata);
    }
}
exports.HeadOperationHandler = HeadOperationHandler;
//# sourceMappingURL=HeadOperationHandler.js.map