/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish" />
import { GithubConfig } from '../../utils/config';
import { ReleaseConfig } from '../config';
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
    /** Client for interacting with the Github API and the local Git command. */
    private _git;
    constructor(_config: ReleaseConfig, _github: GithubConfig, _githubToken: string, _projectRoot: string);
    /** Runs the interactive release tool. */
    run(): Promise<CompletionState>;
    /** Prompts the caretaker for a release action that should be performed. */
    private _promptForReleaseAction;
    /**
     * Verifies that there are no uncommitted changes in the project.
     * @returns a boolean indicating success or failure.
     */
    private _verifyNoUncommittedChanges;
    /**
     * Verifies that the next branch from the configured repository is checked out.
     * @returns a boolean indicating success or failure.
     */
    private _verifyRunningFromNextBranch;
}
