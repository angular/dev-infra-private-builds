/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuiltPackage, BuiltPackageWithInfo, NpmPackage } from '../config';
/**
 * Analyzes and extends the given built packages with additional information,
 * such as their corresponding NPM information or a hash for the package contents.
 */
export declare function analyzeAndExtendBuiltPackagesWithInfo(builtPackages: BuiltPackage[], npmPackages: NpmPackage[]): Promise<BuiltPackageWithInfo[]>;
/**
 * Asserts that the expected built package content matches the disk
 * contents of the built packages.
 *
 * @throws {FatalReleaseActionError} When the integrity check failed.
 */
export declare function assertIntegrityOfBuiltPackages(builtPackagesWithInfo: BuiltPackageWithInfo[]): Promise<void>;
