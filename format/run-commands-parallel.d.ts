/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/run-commands-parallel" />
import { FormatterAction } from './formatters/index';
/** Interface describing a failure occurred during formatting of a file. */
export interface FormatFailure {
    /** Path to the file that failed. */
    filePath: string;
    /** Error message reported by the formatter. */
    message: string;
}
/**
 * Run the provided commands in parallel for each provided file.
 *
 * Running the formatter is split across (number of available cpu threads - 1) processess.
 * The task is done in multiple processess to speed up the overall time of the task, as running
 * across entire repositories takes a large amount of time.
 * As a data point for illustration, using 8 process rather than 1 cut the execution
 * time from 276 seconds to 39 seconds for the same 2700 files.
 *
 * A promise is returned, completed when the command has completed running for each file.
 * The promise resolves with a list of failures, or `false` if no formatters have matched.
 */
export declare function runFormatterInParallel(allFiles: string[], action: FormatterAction): Promise<false | FormatFailure[]>;
