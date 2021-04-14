/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/ts-circular-dependencies/golden" />
import { ReferenceChain } from './analyzer';
export declare type CircularDependency = ReferenceChain<string>;
export declare type Golden = CircularDependency[];
/**
 * Converts a list of reference chains to a JSON-compatible golden object. Reference chains
 * by default use TypeScript source file objects. In order to make those chains printable,
 * the source file objects are mapped to their relative file names.
 */
export declare function convertReferenceChainToGolden(refs: ReferenceChain[], baseDir: string): Golden;
/**
 * Compares the specified goldens and returns two lists that describe newly
 * added circular dependencies, or fixed circular dependencies.
 */
export declare function compareGoldens(actual: Golden, expected: Golden): {
    newCircularDeps: CircularDependency[];
    fixedCircularDeps: CircularDependency[];
};
