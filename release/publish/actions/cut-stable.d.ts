/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions/cut-stable" />
import { ActiveReleaseTrains } from '../../versioning/active-release-trains';
import { ReleaseAction } from '../actions';
/**
 * Release action that cuts a stable version for the current release-train in the release
 * candidate phase. The pre-release release-candidate version label is removed.
 */
export declare class CutStableAction extends ReleaseAction {
    private _newVersion;
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    /** Gets the new stable version of the release candidate release-train. */
    private _computeNewVersion;
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
