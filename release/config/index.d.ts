/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/config" />
import * as semver from 'semver';
import { NgDevConfig } from '../../utils/config';
/** Interface describing a built package. */
export interface BuiltPackage {
    /** Name of the package. */
    name: string;
    /** Path to the package output directory. */
    outputPath: string;
}
/** Configuration for staging and publishing a release. */
export interface ReleaseConfig {
    /** Registry URL used for publishing release packages. Defaults to the NPM registry. */
    publishRegistry?: string;
    /** List of NPM packages that are published as part of this project. */
    npmPackages: string[];
    /** Builds release packages and returns a list of paths pointing to the output. */
    buildPackages: () => Promise<BuiltPackage[] | null>;
    /** Generates the release notes from the most recent tag to `HEAD`. */
    generateReleaseNotesForHead: (outputPath: string) => Promise<void>;
    /**
     * Gets a pattern for extracting the release notes of the a given version.
     * @returns A pattern matching the notes for a given version (including the header).
     */
    extractReleaseNotesPattern?: (version: semver.SemVer) => RegExp;
    /** The list of github labels to add to the release PRs. */
    releasePrLabels?: string[];
}
/** Configuration for releases in the dev-infra configuration. */
export declare type DevInfraReleaseConfig = NgDevConfig<{
    release: ReleaseConfig;
}>;
/** Retrieve and validate the config as `ReleaseConfig`. */
export declare function getReleaseConfig(config?: Partial<DevInfraReleaseConfig>): ReleaseConfig;
