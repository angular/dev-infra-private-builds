/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pullapprove/condition_evaluator" />
import { PullApproveGroup } from './group';
/**
 * Converts a given condition to a function that accepts a set of files. The returned
 * function can be called to check if the set of files matches the condition.
 */
export declare function convertConditionToFunction(expr: string): (files: string[], groups: PullApproveGroup[]) => boolean;
