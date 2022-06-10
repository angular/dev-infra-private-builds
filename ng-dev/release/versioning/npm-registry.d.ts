/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';
import { ReleaseConfig } from '../config/index.js';
import { LtsNpmDistTag } from './long-term-support.js';
/** Type describing the possible NPM dist tags used by Angular packages. */
export declare type NpmDistTag = 'latest' | 'next' | LtsNpmDistTag;
/** Type describing an NPM package fetched from the registry. */
export interface NpmPackageInfo {
    /** Maps of versions and their package JSON objects. */
    'versions': {
        [name: string]: undefined | object;
    };
    /** Map of NPM dist-tags and their chosen version. */
    'dist-tags': {
        [tagName: string]: string | undefined;
    };
    /** Map of versions and their ISO release time. */
    'time': {
        [name: string]: string;
    };
}
/**
 * Cache for requested NPM package information. A cache is desirable as the NPM
 * registry requests are usually very large and slow.
 */
export declare const _npmPackageInfoCache: {
    [pkgName: string]: Promise<NpmPackageInfo>;
};
/** Fetches the NPM package representing the project. */
export declare function fetchProjectNpmPackageInfo(config: ReleaseConfig): Promise<NpmPackageInfo>;
/** Gets whether the given version is published to NPM or not */
export declare function isVersionPublishedToNpm(version: semver.SemVer, config: ReleaseConfig): Promise<boolean>;
