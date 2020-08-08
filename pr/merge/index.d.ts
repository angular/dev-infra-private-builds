/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge" />
import { MergeConfigWithRemote } from './config';
/** URL to the Github page where personal access tokens can be generated. */
export declare const GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens";
/**
 * Merges a given pull request based on labels configured in the given merge configuration.
 * Pull requests can be merged with different strategies such as the Github API merge
 * strategy, or the local autosquash strategy. Either strategy has benefits and downsides.
 * More information on these strategies can be found in their dedicated strategy classes.
 *
 * See {@link GithubApiMergeStrategy} and {@link AutosquashMergeStrategy}
 *
 * @param prNumber Number of the pull request that should be merged.
 * @param githubToken Github token used for merging (i.e. fetching and pushing)
 * @param projectRoot Path to the local Git project that is used for merging.
 * @param config Configuration for merging pull requests.
 */
export declare function mergePullRequest(prNumber: number, githubToken: string, projectRoot?: string, config?: MergeConfigWithRemote): Promise<void>;
