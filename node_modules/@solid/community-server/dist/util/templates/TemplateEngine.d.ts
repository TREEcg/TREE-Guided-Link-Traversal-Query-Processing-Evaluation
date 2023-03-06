/// <reference types="node" />
import Dict = NodeJS.Dict;
export declare type Template = TemplateFileName | TemplateString | TemplatePath;
export declare type TemplateFileName = string;
export interface TemplateString {
    templateString: string;
}
export interface TemplatePath {
    templateFile: string;
    templatePath?: string;
}
/**
 * A template engine renders content into a template.
 */
export interface TemplateEngine<T extends Dict<any> = Dict<any>> {
    /**
     * Renders the given contents into the template.
     *
     * @param contents - The contents to render.
     * @param template - The template to use for rendering;
     *                   if omitted, a default template is used.
     * @returns The rendered contents.
     */
    render(contents: T): Promise<string>;
    render<TCustom = T>(contents: TCustom, template: Template): Promise<string>;
}
/**
 * Returns the absolute path to the template.
 * Returns undefined if the input does not contain a file path.
 */
export declare function getTemplateFilePath(template?: Template): string | undefined;
/**
 * Reads the template and returns it as a string.
 */
export declare function readTemplate(template?: Template): Promise<string>;
