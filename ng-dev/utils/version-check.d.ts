/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Verifies that the `ng-dev` tool is up-to-date in the workspace. The check will compare
 * the local version of the tool against the requested version in the workspace lock file.
 *
 * This check is helpful ensuring that the caretaker does not accidentally run with an older
 * local version of `ng-dev` due to not running `yarn` after checking out new revisions.
 *
 * @returns a boolean indicating success or failure.
 */
export declare function verifyNgDevToolIsUpToDate(workspacePath: string): Promise<boolean>;
