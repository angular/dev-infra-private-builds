/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RuleFailure } from 'tslint/lib';
import { TypedRule } from 'tslint/lib/rules';
import * as ts from 'typescript';
/**
 * Rule which enforces that class members implementing abstract members
 * from base classes explicitly specify the `override` modifier.
 *
 * This ensures we follow the best-practice of applying `override` for abstract-implemented
 * members so that TypeScript creates diagnostics in both scenarios where either the abstract
 * class member is removed, or renamed.
 *
 * More details can be found here: https://github.com/microsoft/TypeScript/issues/44457.
 */
export declare class Rule extends TypedRule {
    applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[];
}
