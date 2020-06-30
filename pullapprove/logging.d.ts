/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pullapprove/logging" />
import { PullApproveGroupResult } from './group';
/** Create logs for each pullapprove group result. */
export declare function logGroup(group: PullApproveGroupResult, matched?: boolean, printMessageFn?: {
    (...text: string[]): void;
    group(text: string, collapsed?: boolean | undefined): void;
    groupEnd(): void;
}): void;
/** Logs a header within a text drawn box. */
export declare function logHeader(...params: string[]): void;
