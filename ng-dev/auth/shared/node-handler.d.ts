import { AuthorizationRequest, AuthorizationRequestHandler, AuthorizationRequestResponse, AuthorizationServiceConfiguration, Crypto, QueryStringUtils } from '@openid/appauth';
export declare class NodeBasedHandler extends AuthorizationRequestHandler {
    httpServerPort: number;
    authorizationPromise: Promise<AuthorizationRequestResponse | null> | null;
    /** The content for the authorization redirect response page. */
    protected authorizationRedirectPageContent: string;
    constructor(httpServerPort?: number, utils?: QueryStringUtils, crypto?: Crypto);
    performAuthorizationRequest(configuration: AuthorizationServiceConfiguration, request: AuthorizationRequest): void;
    protected completeAuthorizationRequest(): Promise<AuthorizationRequestResponse | null>;
}
