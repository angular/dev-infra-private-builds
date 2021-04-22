/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish" />
import { GithubConfig } from '../../utils/config';
import { ReleaseConfig } from '../config/index';
export declare enum CompletionState {
    SUCCESS = 0,
    FATAL_ERROR = 1,
    MANUALLY_ABORTED = 2
}
export declare class ReleaseTool {
    protected _config: ReleaseConfig;
    protected _github: GithubConfig;
    protected _githubToken: string;
    protected _projectRoot: string;
    /** The singleton instance of the GitClient. */
    private _git;
    /** The previous git commit to return back to after the release tool runs. */
    private previousGitBranchOrRevision;
    constructor(_config: ReleaseConfig, _github: GithubConfig, _githubToken: string, _projectRoot: string);
    /** Runs the interactive release tool. */
    run(): Promise<CompletionState>;
    /** Run post release tool cleanups. */
    private cleanup;
    /** Prompts the caretaker for a release action that should be performed. */
    private _promptForReleaseAction;
    /**
     * Verifies that there are no uncommitted changes in the project.
     * @returns a boolean indicating success or failure.
     */
    private _verifyNoUncommittedChanges;
    /**
     * Verifies the current environment contains /usr/bin/python which points to the Python3
     * interpreter.  python is required by our tooling in bazel as it contains scripts setting
     * `#! /usr/bin/env python`.
     *
     * @returns a boolean indicating success or failure.
     */
    private _verifyEnvironmentHasPython3Symlink;
    /**
     * Verifies that the next branch from the configured repository is checked out.
     * @returns a boolean indicating success or failure.
     */
    private _verifyRunningFromNextBranch;
    /**
     * Verifies that the user is logged into NPM at the correct registry, if defined for the release.
     * @returns a boolean indicating whether the user is logged into NPM.
     */
    private _verifyNpmLoginState;
}
