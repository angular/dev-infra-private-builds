/// <amd-module name="@angular/dev-infra-private/pullapprove/utils" />
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { IMinimatch } from 'minimatch';
/**
 * Gets a glob for the given pattern. The cached glob will be returned
 * if available. Otherwise a new glob will be created and cached.
 */
export declare function getOrCreateGlob(pattern: string): IMinimatch;
