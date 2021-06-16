/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/formatters/base-formatter" />
import { GitClient } from '../../utils/git/git-client';
import { FormatConfig } from '../config';
export declare type CallbackFunc = (file: string, code: number, stdout: string, stderr: string) => boolean;
export declare type FormatterAction = 'check' | 'format';
interface FormatterActionMetadata {
    commandFlags: string;
    callback: CallbackFunc;
}
/**
 * The base class for formatters to run against provided files.
 */
export declare abstract class Formatter {
    protected config: FormatConfig;
    protected git: GitClient;
    /**
     * The name of the formatter, this is used for identification in logging and for enabling and
     * configuring the formatter in the config.
     */
    abstract name: string;
    /** The full path file location of the formatter binary. */
    abstract binaryFilePath: string;
    /** Metadata for each `FormatterAction` available to the formatter. */
    abstract actions: {
        check: FormatterActionMetadata;
        format: FormatterActionMetadata;
    };
    /** The default matchers for the formatter for filtering files to be formatted. */
    abstract defaultFileMatcher: string[];
    constructor(config: FormatConfig);
    /**
     * Retrieve the command to execute the provided action, including both the binary
     * and command line flags.
     */
    commandFor(action: FormatterAction): string;
    /**
     * Retrieve the callback for the provided action to determine if an action
     * failed in formatting.
     */
    callbackFor(action: FormatterAction): CallbackFunc;
    /** Whether the formatter is enabled in the provided config. */
    isEnabled(): boolean;
    /** Retrieve the active file matcher for the formatter. */
    getFileMatcher(): string[];
    /**
     * Retrieves the file matcher from the config provided to the constructor if provided.
     */
    private getFileMatcherFromConfig;
}
export {};
