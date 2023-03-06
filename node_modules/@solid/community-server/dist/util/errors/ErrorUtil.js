"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorMessage = exports.assertError = exports.isError = void 0;
const util_1 = require("util");
/**
 * Checks if the input is an {@link Error}.
 */
function isError(error) {
    return util_1.types.isNativeError(error) ||
        (error &&
            typeof error.name === 'string' &&
            typeof error.message === 'string' &&
            (typeof error.stack === 'undefined' || typeof error.stack === 'string'));
}
exports.isError = isError;
/**
 * Asserts that the input is a native error.
 * If not the input will be re-thrown.
 */
function assertError(error) {
    if (!isError(error)) {
        throw error;
    }
}
exports.assertError = assertError;
function createErrorMessage(error) {
    return isError(error) ? error.message : `Unknown error: ${error}`;
}
exports.createErrorMessage = createErrorMessage;
//# sourceMappingURL=ErrorUtil.js.map