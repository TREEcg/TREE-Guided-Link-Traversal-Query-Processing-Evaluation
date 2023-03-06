"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getETag = void 0;
const Vocabularies_1 = require("../util/Vocabularies");
/**
 * Generates an ETag based on the last modified date of a resource.
 * @param metadata - Metadata of the resource.
 *
 * @returns the generated ETag. Undefined if no last modified date was found.
 */
function getETag(metadata) {
    const modified = metadata.get(Vocabularies_1.DC.terms.modified);
    if (modified) {
        const date = new Date(modified.value);
        return `"${date.getTime()}"`;
    }
}
exports.getETag = getETag;
//# sourceMappingURL=Conditions.js.map