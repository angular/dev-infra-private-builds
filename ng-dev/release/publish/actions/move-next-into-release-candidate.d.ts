/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ActiveReleaseTrains } from '../../versioning';
import { BranchOffNextBranchBaseAction } from './branch-off-next-branch';
/**
 * Release action that moves the next release-train into the release-candidate phase. This means
 * that a new version branch is created from the next branch, and the first release candidate
 * version is cut indicating the new phase.
 */
export declare class MoveNextIntoReleaseCandidateAction extends BranchOffNextBranchBaseAction {
    newPhaseName: "release-candidate";
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
