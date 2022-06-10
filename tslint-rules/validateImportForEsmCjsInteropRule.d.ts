/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import ts from 'typescript';
/**
 * Rule that blocks named imports from being used for certain configured module
 * specifiers. This is helpful for enforcing an ESM-compatible interop with CommonJS
 * modules which do not expose named bindings at runtime.
 *
 * For example, consider the `typescript` module. It does not statically expose named
 * exports even though the type definition suggests it. An import like the following
 * will break at runtime when the `typescript` CommonJS module is imported inside an ESM.
 *
 * ```
 * import * as ts from 'typescript';
 * console.log(ts.SyntaxKind.CallExpression); // `SyntaxKind is undefined`.
 * ```
 *
 * More details here: https://nodejs.org/api/esm.html#esm_import_statements.
 */
export declare class Rule extends AbstractRule {
    apply(sourceFile: ts.SourceFile): RuleFailure[];
}
