"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkResponseDescription = void 0;
const ResponseDescription_1 = require("./ResponseDescription");
/**
 * Corresponds to a 200 response, containing relevant metadata and potentially data.
 */
class OkResponseDescription extends ResponseDescription_1.ResponseDescription {
    /**
     * @param metadata - Metadata concerning the response.
     * @param data - Potential data. @ignored
     */
    constructor(metadata, data) {
        super(200, metadata, data);
    }
}
exports.OkResponseDescription = OkResponseDescription;
//# sourceMappingURL=OkResponseDescription.js.map