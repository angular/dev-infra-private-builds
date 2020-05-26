/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/ts-circular-dependencies/analyzer" />
import * as ts from 'typescript';
export declare type ModuleResolver = (specifier: string) => string | null;
/**
 * Reference chains describe a sequence of source files which are connected through imports.
 * e.g. `file_a.ts` imports `file_b.ts`, whereas `file_b.ts` imports `file_c.ts`. The reference
 * chain data structure could be used to represent this import sequence.
 */
export declare type ReferenceChain<T = ts.SourceFile> = T[];
/**
 * Analyzer that can be used to detect import cycles within source files. It supports
 * custom module resolution, source file caching and collects unresolved specifiers.
 */
export declare class Analyzer {
    resolveModuleFn?: ModuleResolver | undefined;
    extensions: string[];
    private _sourceFileCache;
    unresolvedModules: Set<string>;
    unresolvedFiles: Map<string, string[]>;
    constructor(resolveModuleFn?: ModuleResolver | undefined, extensions?: string[]);
    /** Finds all cycles in the specified source file. */
    findCycles(sf: ts.SourceFile, visited?: WeakSet<ts.SourceFile>, path?: ReferenceChain): ReferenceChain[];
    /** Gets the TypeScript source file of the specified path. */
    getSourceFile(filePath: string): ts.SourceFile;
    /** Resolves the given import specifier with respect to the specified containing file path. */
    private _resolveImport;
    /** Tracks the given file import as unresolved. */
    private _trackUnresolvedFileImport;
    /** Resolves the given import specifier to the corresponding source file. */
    private _resolveFileSpecifier;
}
