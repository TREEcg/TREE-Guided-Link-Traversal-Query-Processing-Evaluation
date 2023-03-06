import { BasicRepresentation } from '../http/representation/BasicRepresentation';
import type { Representation } from '../http/representation/Representation';
import { RepresentationMetadata } from '../http/representation/RepresentationMetadata';
/**
 * Helper function to generate type quads for a Container or Resource.
 * @param metadata - Metadata to add to.
 * @param isContainer - If the identifier corresponds to a container.
 *
 * @returns The generated quads.
 */
export declare function addResourceMetadata(metadata: RepresentationMetadata, isContainer: boolean): void;
/**
 * Updates the dc:modified time to the given time.
 * @param metadata - Metadata to update.
 * @param date - Last modified date. Defaults to current time.
 */
export declare function updateModifiedDate(metadata: RepresentationMetadata, date?: Date): void;
/**
 * Links a template file with a given content-type to the metadata using the SOLID_META.template predicate.
 * @param metadata - Metadata to update.
 * @param templateFile - Path to the template.
 * @param contentType - Content-type of the template after it is rendered.
 */
export declare function addTemplateMetadata(metadata: RepresentationMetadata, templateFile: string, contentType: string): void;
/**
 * Helper function to clone a representation, the original representation can still be used.
 * This function loads the entire stream in memory.
 * @param representation - The representation to clone.
 *
 * @returns The cloned representation.
 */
export declare function cloneRepresentation(representation: Representation): Promise<BasicRepresentation>;
