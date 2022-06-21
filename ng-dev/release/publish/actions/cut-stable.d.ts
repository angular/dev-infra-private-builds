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
 * Release action that cuts a stable version for the current release-train in the release
 * candidate phase. The pre-release release-candidate version label is removed.
 */
export declare class CutStableAction extends ReleaseAction {
    private _newVersion;
    private _isNewMajor;
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    /** Gets the new stable version of the release candidate release-train. */
    private _computeNewVersion;
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
