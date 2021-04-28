/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions/cut-next-prerelease" />
import { ReleaseAction } from '../actions';
/**
 * Release action that cuts a prerelease for the next branch. A version in the next
 * branch can have an arbitrary amount of next pre-releases.
 */
export declare class CutNextPrereleaseAction extends ReleaseAction {
    /** Promise resolving with the new version if a NPM next pre-release is cut. */
    private _newVersion;
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    /** Gets the release train for which NPM next pre-releases should be cut. */
    private _getActivePrereleaseTrain;
    /** Gets the new pre-release version for this release action. */
    private _computeNewVersion;
    static isActive(): Promise<boolean>;
}
