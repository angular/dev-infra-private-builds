/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ReleaseAction } from '../actions';
/**
 * Base action that can be used to move the next release-train into the feature-freeze or
 * release-candidate phase. This means that a new version branch is created from the next
 * branch, and a new pre-release (either RC or another `next`) is cut indicating the new phase.
 */
export declare abstract class BranchOffNextBranchBaseAction extends ReleaseAction {
    /**
     * Phase which the release-train currently in the `next` phase will move into.
     *
     * Note that we only allow for a next version to branch into feature-freeze or
     * directly into the release-candidate phase. A stable version cannot be released
     * without release-candidate.
     */
    abstract newPhaseName: 'feature-freeze' | 'release-candidate';
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    /** Computes the new version for the release-train being branched-off. */
    private _computeNewVersion;
    /** Creates a new version branch from the next branch. */
    private _createNewVersionBranchFromNext;
    /**
     * Creates a pull request for the next branch that bumps the version to the next
     * minor, and cherry-picks the changelog for the newly branched-off release-candidate
     * or feature-freeze version.
     */
    private _createNextBranchUpdatePullRequest;
}
