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
 * Release action that moves the next release-train into the feature-freeze phase. This means
 * that a new version branch is created from the next branch, and a new next pre-release is
 * cut indicating the started feature-freeze.
 */
export declare class MoveNextIntoFeatureFreezeAction extends BranchOffNextBranchBaseAction {
    newPhaseName: "feature-freeze";
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
