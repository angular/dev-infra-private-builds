/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ActiveReleaseTrains } from '../../versioning/active-release-trains.js';
import { ReleaseAction } from '../actions.js';
/**
 * Release action that cuts a new patch release for the current latest release-train version
 * branch (i.e. the patch branch). The patch segment is incremented. The changelog is generated
 * for the new patch version, but also needs to be cherry-picked into the next development branch.
 */
export declare class CutNewPatchAction extends ReleaseAction {
    private _previousVersion;
    private _newVersion;
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
