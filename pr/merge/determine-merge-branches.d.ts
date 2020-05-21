/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/determine-merge-branches" />
/**
 * Helper function that can be used to determine merge branches based on a given
 * project version. The function determines merge branches primarily through the
 * specified version, but falls back to consulting the NPM registry when needed.
 *
 * Consulting the NPM registry for determining the patch branch may slow down merging,
 * so whenever possible, the branches are determined statically based on the current
 * version. In some cases, consulting the NPM registry is inevitable because for major
 * pre-releases, we cannot determine the latest stable minor version from the current
 * pre-release version.
 */
export declare function determineMergeBranches(currentVersion: string, npmPackageName: string): {
    minor: string;
    patch: string;
};
