/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Commit } from '../../../commit-message/parse.js';
import { PullRequestValidation } from './validation-config.js';
/** Assert the pull request is properly denoted if it contains breaking changes. */
export declare const breakingChangeInfoValidation: {
    run(validationConfig: import("./validation-config.js").PullRequestValidationConfig, fn: (v: Validation) => void): Promise<void>;
};
declare class Validation extends PullRequestValidation {
    assert(commits: Commit[], labels: string[]): void;
    private _createMissingBreakingChangeLabelError;
    private _createMissingBreakingChangeCommitError;
}
export {};
