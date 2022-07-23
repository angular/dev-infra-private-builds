/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ActiveReleaseTrains } from '../../../release/versioning/active-release-trains.js';
import { NgDevConfig, GithubConfig } from '../../../utils/config.js';
import { PullRequestConfig } from '../../config/index.js';
import { PullRequestFromGithub } from '../fetch-pull-request.js';
import { PullRequestTarget } from '../targeting/target-label.js';
import { PullRequestValidationConfig } from './validation-config.js';
/**
 * Asserts that the given pull request is valid. Certain non-fatal validations
 * can be disabled through the validation config.
 *
 * Active release trains may be available for additional checks or not.
 *
 * @throws {PullRequestValidationFailure} A validation failure will be raised when
 *   an activated validation failed.
 */
export declare function assertValidPullRequest(pullRequest: PullRequestFromGithub, validationConfig: PullRequestValidationConfig, ngDevConfig: NgDevConfig<{
    pullRequest: PullRequestConfig;
    github: GithubConfig;
}>, activeReleaseTrains: ActiveReleaseTrains | null, target: PullRequestTarget): Promise<void>;
