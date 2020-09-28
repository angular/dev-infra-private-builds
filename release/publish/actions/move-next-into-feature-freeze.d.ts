/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions/move-next-into-feature-freeze" />
import { ActiveReleaseTrains } from '../../versioning/active-release-trains';
import { ReleaseAction } from '../actions';
/**
 * Release action that moves the next release-train into the feature-freeze phase. This means
 * that a new version branch is created from the next branch, and a new next pre-release is
 * cut indicating the started feature-freeze.
 */
export declare class MoveNextIntoFeatureFreezeAction extends ReleaseAction {
    private _newVersion;
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    /** Creates a new version branch from the next branch. */
    private _createNewVersionBranchFromNext;
    /**
     * Creates a pull request for the next branch that bumps the version to the next
     * minor, and cherry-picks the changelog for the newly branched-off feature-freeze version.
     */
    private _createNextBranchUpdatePullRequest;
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
