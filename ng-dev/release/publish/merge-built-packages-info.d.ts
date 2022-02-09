/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuiltPackage, NpmPackage } from '../config';
/** Type describing a built package with its associated NPM package info. */
export interface BuiltPackageWithInfo extends BuiltPackage, NpmPackage {
}
/** Merges the given built packages with their NPM package information. */
export declare function mergeBuiltPackagesWithInfo(builtPackages: BuiltPackage[], npmPackages: NpmPackage[]): BuiltPackageWithInfo[];
