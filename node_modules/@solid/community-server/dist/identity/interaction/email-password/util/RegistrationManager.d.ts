/// <reference types="node" />
import type { IdentifierGenerator } from '../../../../pods/generate/IdentifierGenerator';
import type { PodManager } from '../../../../pods/PodManager';
import type { OwnershipValidator } from '../../../ownership/OwnershipValidator';
import type { AccountStore } from '../storage/AccountStore';
export interface RegistrationManagerArgs {
    /**
     * Used to set the `oidcIssuer` value of newly registered pods.
     */
    baseUrl: string;
    /**
     * Appended to the generated pod identifier to create the corresponding WebID.
     */
    webIdSuffix: string;
    /**
     * Generates identifiers for new pods.
     */
    identifierGenerator: IdentifierGenerator;
    /**
     * Verifies the user is the owner of the WebID they provide.
     */
    ownershipValidator: OwnershipValidator;
    /**
     * Stores all the registered account information.
     */
    accountStore: AccountStore;
    /**
     * Creates the new pods.
     */
    podManager: PodManager;
}
/**
 * The parameters expected for registration.
 */
export interface RegistrationParams {
    email: string;
    webId?: string;
    password: string;
    podName?: string;
    template?: string;
    createWebId: boolean;
    register: boolean;
    createPod: boolean;
    rootPod: boolean;
}
/**
 * The result of a registration action.
 */
export interface RegistrationResponse {
    email: string;
    webId?: string;
    oidcIssuer?: string;
    podBaseUrl?: string;
    createWebId: boolean;
    register: boolean;
    createPod: boolean;
}
/**
 * Supports IDP registration and pod creation based on input parameters.
 *
 * The above behaviour is combined in the two class functions.
 * `validateInput` will make sure all incoming data is correct and makes sense.
 * `register` will call all the correct handlers based on the requirements of the validated parameters.
 */
export declare class RegistrationManager {
    protected readonly logger: import("../../../..").Logger;
    private readonly baseUrl;
    private readonly webIdSuffix;
    private readonly identifierGenerator;
    private readonly ownershipValidator;
    private readonly accountStore;
    private readonly podManager;
    constructor(args: RegistrationManagerArgs);
    /**
     * Trims the input if it is a string, returns `undefined` otherwise.
     */
    private trimString;
    /**
     * Makes sure the input conforms to the following requirements when relevant:
     *  * At least one option needs to be chosen.
     *  * In case a new WebID needs to be created, the other 2 steps will be set to true.
     *  * Valid email/WebID/password/podName when required.
     *  * Only create a root pod when allowed.
     *
     * @param input - Input parameters for the registration procedure.
     * @param allowRoot - If creating a pod in the root container should be allowed.
     *
     * @returns A cleaned up version of the input parameters.
     * Only (trimmed) parameters that are relevant to the registration procedure will be retained.
     */
    validateInput(input: NodeJS.Dict<unknown>, allowRoot?: boolean): RegistrationParams;
    /**
     * Handles the 3 potential steps of the registration process:
     *  1. Generating a new WebID.
     *  2. Registering a WebID with the IDP.
     *  3. Creating a new pod for a given WebID.
     *
     * All of these steps are optional and will be determined based on the input parameters.
     *
     * This includes the following steps:
     *  * Ownership will be verified when the WebID is provided.
     *  * When registering and creating a pod, the base URL will be used as oidcIssuer value.
     */
    register(input: RegistrationParams, allowRoot?: boolean): Promise<RegistrationResponse>;
}
