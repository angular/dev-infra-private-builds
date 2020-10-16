/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions/cut-lts-patch" />
import { ActiveReleaseTrains } from '../../versioning/active-release-trains';
import { ReleaseAction } from '../actions';
/**
 * Release action that cuts a new patch release for an active release-train in the long-term
 * support phase. The patch segment is incremented. The changelog is generated for the new
 * patch version, but also needs to be cherry-picked into the next development branch.
 */
export declare class CutLongTermSupportPatchAction extends ReleaseAction {
    /** Promise resolving an object describing long-term support branches. */
    ltsBranches: Promise<import("@angular/dev-infra-private/release/versioning/long-term-support").LtsBranches>;
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    /** Prompts the user to select an LTS branch for which a patch should but cut. */
    private _promptForTargetLtsBranch;
    /** Gets an inquirer choice for the given LTS branch. */
    private _getChoiceForLtsBranch;
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
