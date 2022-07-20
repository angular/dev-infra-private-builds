import { AuthorizationServiceConfiguration, TokenResponse } from '@openid/appauth';
interface OAuthDanceConfig {
    authConfig: AuthorizationServiceConfiguration;
    deviceAuthEndpoint: string;
    oob: {
        client_id: string;
        client_secret?: string;
    };
    loopback: {
        client_id: string;
        client_secret?: string;
    };
    scope: string;
}
export declare function authorizationCodeOAuthDance({ loopback: { client_id, client_secret }, authConfig, scope, }: OAuthDanceConfig): Promise<TokenResponse>;
export declare function deviceCodeOAuthDance({ oob: { client_id, client_secret }, authConfig, deviceAuthEndpoint, scope, }: OAuthDanceConfig): Promise<TokenResponse>;
export declare const GoogleOAuthDanceConfig: OAuthDanceConfig;
export declare const GithubOAuthDanceConfig: OAuthDanceConfig;
export {};
