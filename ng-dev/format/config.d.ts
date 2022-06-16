/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgDevConfig } from '../utils/config.js';
interface Formatter {
    matchers: string[];
}
export interface FormatConfig {
    [key: string]: boolean | Formatter;
}
/** Retrieve and validate the config as `FormatConfig`. */
export declare function assertValidFormatConfig<T extends NgDevConfig>(config: T & Partial<{
    format: FormatConfig;
}>): asserts config is T & {
    format: FormatConfig;
};
export {};
