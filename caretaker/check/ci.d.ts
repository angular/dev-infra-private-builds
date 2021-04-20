/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/check/ci" />
import { BaseModule } from './base';
/** The result of checking a branch on CI. */
declare type CiBranchStatus = 'success' | 'failed' | 'not found';
/** A list of results for checking CI branches. */
declare type CiData = {
    active: boolean;
    name: string;
    label: string;
    status: CiBranchStatus;
}[];
export declare class CiModule extends BaseModule<CiData> {
    retrieveData(): Promise<{
        active: boolean;
        name: string;
        label: string;
        status: CiBranchStatus;
    }[]>;
    printToTerminal(): Promise<void>;
    /** Get the CI status of a given branch from CircleCI. */
    private getBranchStatusFromCi;
}
export {};
