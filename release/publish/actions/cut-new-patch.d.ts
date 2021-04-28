/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions/cut-new-patch" />
import { ActiveReleaseTrains } from '../../versioning/active-release-trains';
import { ReleaseAction } from '../actions';
/**
 * Release action that cuts a new patch release for the current latest release-train version
 * branch (i.e. the patch branch). The patch segment is incremented. The changelog is generated
 * for the new patch version, but also needs to be cherry-picked into the next development branch.
 */
export declare class CutNewPatchAction extends ReleaseAction {
    private _newVersion;
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
