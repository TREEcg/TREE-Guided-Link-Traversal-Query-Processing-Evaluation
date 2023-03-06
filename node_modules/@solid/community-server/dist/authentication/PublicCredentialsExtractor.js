"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicCredentialsExtractor = void 0;
const Credentials_1 = require("./Credentials");
const CredentialsExtractor_1 = require("./CredentialsExtractor");
/**
 * Extracts the public credentials, to be used for data everyone has access to.
 */
class PublicCredentialsExtractor extends CredentialsExtractor_1.CredentialsExtractor {
    async handle() {
        return { [Credentials_1.CredentialGroup.public]: {} };
    }
}
exports.PublicCredentialsExtractor = PublicCredentialsExtractor;
//# sourceMappingURL=PublicCredentialsExtractor.js.map