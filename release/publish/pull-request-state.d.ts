/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/pull-request-state" />
import { GitClient } from '../../utils/git/git-client';
/** State of a pull request in Github. */
export declare type PullRequestState = 'merged' | 'closed' | 'open';
/** Gets whether a given pull request has been merged. */
export declare function getPullRequestState(api: GitClient, id: number): Promise<PullRequestState>;
