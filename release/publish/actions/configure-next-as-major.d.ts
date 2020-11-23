/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions/configure-next-as-major" />
import { ActiveReleaseTrains } from '../../versioning/active-release-trains';
import { ReleaseAction } from '../actions';
/**
 * Release action that configures the active next release-train to be for a major
 * version. This means that major changes can land in the next branch.
 */
export declare class ConfigureNextAsMajorAction extends ReleaseAction {
    private _newVersion;
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    static isActive(active: ActiveReleaseTrains): Promise<boolean>;
}
