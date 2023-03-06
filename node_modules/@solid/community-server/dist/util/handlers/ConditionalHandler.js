"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionalHandler = void 0;
const NotImplementedHttpError_1 = require("../errors/NotImplementedHttpError");
const AsyncHandler_1 = require("./AsyncHandler");
/**
 * This handler will pass all requests to the wrapped handler,
 * until a specific value has been set in the given storage.
 * After that all input will be rejected.
 * Once the value has been matched this behaviour will be cached,
 * so changing the value again afterwards will not enable this handler again.
 */
class ConditionalHandler extends AsyncHandler_1.AsyncHandler {
    constructor(source, storage, storageKey, storageValue) {
        super();
        this.source = source;
        this.storage = storage;
        this.storageKey = storageKey;
        this.storageValue = storageValue;
        this.finished = false;
    }
    async canHandle(input) {
        await this.checkCondition();
        await this.source.canHandle(input);
    }
    async handleSafe(input) {
        await this.checkCondition();
        return this.source.handleSafe(input);
    }
    async handle(input) {
        return this.source.handle(input);
    }
    /**
     * Checks if the condition has already been fulfilled.
     */
    async checkCondition() {
        if (!this.finished) {
            this.finished = await this.storage.get(this.storageKey) === this.storageValue;
        }
        if (this.finished) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('The condition has been fulfilled.');
        }
    }
}
exports.ConditionalHandler = ConditionalHandler;
//# sourceMappingURL=ConditionalHandler.js.map