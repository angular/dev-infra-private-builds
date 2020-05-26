/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/ts-circular-dependencies/parser" />
import * as ts from 'typescript';
/**
 * Finds all module references in the specified source file.
 * @param node Source file which should be parsed.
 * @returns List of import specifiers in the source file.
 */
export declare function getModuleReferences(node: ts.SourceFile): string[];
