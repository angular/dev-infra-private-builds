/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/ts-circular-dependencies/file_system" />
/// <reference types="node" />
import { Stats } from 'fs';
/** Gets the status of the specified file. Returns null if the file does not exist. */
export declare function getFileStatus(filePath: string): Stats | null;
/** Ensures that the specified path uses forward slashes as delimiter. */
export declare function convertPathToForwardSlash(path: string): string;
