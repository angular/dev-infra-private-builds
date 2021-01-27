/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions/index" />
import { ReleaseActionConstructor } from '../actions';
/**
 * List of release actions supported by the release staging tool. These are sorted
 * by priority. Actions which are selectable are sorted based on this declaration order.
 */
export declare const actions: ReleaseActionConstructor[];
