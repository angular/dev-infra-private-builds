/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/config" />
import { NgDevConfig } from '../utils/config';
interface Formatter {
    matchers: string[];
}
export interface FormatConfig {
    [key: string]: boolean | Formatter;
}
/** Retrieve and validate the config as `FormatConfig`. */
export declare function getFormatConfig(): Required<Partial<NgDevConfig<{
    format: FormatConfig;
}>>>;
export {};
