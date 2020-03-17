/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/ts-circular-dependencies" />
/**
 * Runs the ts-circular-dependencies tool.
 * @param baseDir Base directory which is used to build up relative file paths in goldens.
 * @param approve Whether the detected circular dependencies should be approved.
 * @param goldenFile Path to the golden file.
 * @param glob Glob that is used to collect all source files which should be checked/approved.
 * @param printWarnings Whether warnings should be printed. Warnings for unresolved modules/files
 *     are not printed by default.
 * @returns Status code.
 */
export declare function main(baseDir: string, approve: boolean, goldenFile: string, glob: string, printWarnings: boolean): number;
