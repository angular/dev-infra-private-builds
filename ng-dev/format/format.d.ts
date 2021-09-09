/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Format provided files in place.
 *
 * @returns a status code indicating whether the formatting run was successful.
 */
export declare function formatFiles(files: string[]): Promise<1 | 0>;
/**
 * Check provided files for formatting correctness.
 *
 * @returns a status code indicating whether the format check run was successful.
 */
export declare function checkFiles(files: string[]): Promise<1 | 0>;
