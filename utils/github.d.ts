/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/github" />
import { NgDevConfig } from './config';
/** The configuration required for github interactions. */
declare type GithubConfig = NgDevConfig['github'];
/** Get all pending PRs from github  */
export declare function getPendingPrs<PrSchema>(prSchema: PrSchema, { owner, name }: GithubConfig): Promise<PrSchema[]>;
export {};
