import { HttpsCallableResult } from 'firebase/functions';
/**
 * Setup and invoke a firebase function on the server after confirming a ng-dev token is present.
 */
export declare function invokeServerFunction<P extends {}, R>(name: string, params?: P): Promise<HttpsCallableResult<R>>;
/**
 * Request a new ng-dev token from the server, storing it the file system for use.
 */
export declare function requestNgDevToken(): Promise<void>;
/**
 * Check the validity of the local ng-dev token with the server, if a local token is present. If a
 * valid token is present, restores it to the current ngDevToken in memory.
 */
export declare function restoreNgTokenFromDiskIfValid(): Promise<void>;
/** Get the current user for the ng-dev token. */
export declare function getCurrentUser(): Promise<string | false>;
