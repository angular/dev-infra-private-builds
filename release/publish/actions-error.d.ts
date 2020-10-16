/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions-error" />
/** Error that will be thrown if the user manually aborted a release action. */
export declare class UserAbortedReleaseActionError extends Error {
    constructor();
}
/** Error that will be thrown if the action has been aborted due to a fatal error. */
export declare class FatalReleaseActionError extends Error {
    constructor();
}
