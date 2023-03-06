"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionCredentialsExtractor = void 0;
const UnionHandler_1 = require("../util/handlers/UnionHandler");
/**
 * Combines the results of several CredentialsExtractors into one.
 * If multiple of these extractors return a value for the same key,
 * the last result will be used.
 */
class UnionCredentialsExtractor extends UnionHandler_1.UnionHandler {
    constructor(extractors) {
        super(extractors);
    }
    async combine(results) {
        // Combine all the results into a single object
        return results.reduce((result, credential) => {
            for (const [key, value] of Object.entries(credential)) {
                if (value) {
                    result[key] = value;
                }
            }
            return result;
        }, {});
    }
}
exports.UnionCredentialsExtractor = UnionCredentialsExtractor;
//# sourceMappingURL=UnionCredentialsExtractor.js.map