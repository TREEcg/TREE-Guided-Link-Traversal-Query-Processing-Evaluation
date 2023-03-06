"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticHandler = void 0;
const AsyncHandler_1 = require("./AsyncHandler");
/**
 * A handler that always resolves and always returns the stored value.
 * Will return undefined if no value is stored.
 *
 * The generic type extends `any` due to Components.js requirements.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
class StaticHandler extends AsyncHandler_1.AsyncHandler {
    constructor(value) {
        super();
        this.value = value;
    }
    async handle() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return this.value;
    }
}
exports.StaticHandler = StaticHandler;
//# sourceMappingURL=StaticHandler.js.map