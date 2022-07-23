/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PullRequestFromGithub } from '../fetch-pull-request.js';
import { PullRequestValidation } from './validation-config.js';
/** Assert the pull request is pending, not closed, merged or in draft. */
export declare const pendingStateValidation: {
    run(validationConfig: import("./validation-config.js").PullRequestValidationConfig, fn: (v: Validation) => void): Promise<void>;
};
declare class Validation extends PullRequestValidation {
    assert(pullRequest: PullRequestFromGithub): void;
}
export {};
