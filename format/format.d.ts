/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/format" />
/**
 * Format provided files in place.
 */
export declare function formatFiles(files: string[]): Promise<void>;
/**
 * Check provided files for formatting correctness.
 */
export declare function checkFiles(files: string[]): Promise<void>;
