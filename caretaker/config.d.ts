/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/config" />
import { NgDevConfig } from '../utils/config';
export interface CaretakerConfig {
    githubQueries?: {
        name: string;
        query: string;
    }[];
}
/** Retrieve and validate the config as `CaretakerConfig`. */
export declare function getCaretakerConfig(): Required<Partial<NgDevConfig<{
    caretaker: CaretakerConfig;
}>>>;
