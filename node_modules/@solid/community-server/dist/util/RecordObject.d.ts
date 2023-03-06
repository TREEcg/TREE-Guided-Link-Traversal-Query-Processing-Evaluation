/**
 * Helper class for instantiating multiple objects with Components.js.
 * See https://github.com/LinkedSoftwareDependencies/Components.js/issues/26
 */
export declare class RecordObject implements Record<string, any> {
    constructor(record?: Record<string, string>);
}
