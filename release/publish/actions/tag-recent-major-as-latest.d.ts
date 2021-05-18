/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/actions/tag-recent-major-as-latest" />
import { ReleaseConfig } from '../../config';
import { ActiveReleaseTrains } from '../../versioning/active-release-trains';
import { ReleaseAction } from '../actions';
/**
 * Release action that tags the recently published major as latest within the NPM
 * registry. Major versions are published to the `next` NPM dist tag initially and
 * can be re-tagged to the `latest` NPM dist tag. This allows caretakers to make major
 * releases available at the same time. e.g. Framework, Tooling and Components
 * are able to publish v12 to `@latest` at the same time. This wouldn't be possible if
 * we directly publish to `@latest` because Tooling and Components needs to wait
 * for the major framework release to be available on NPM.
 * @see {CutStableAction#perform} for more details.
 */
export declare class TagRecentMajorAsLatest extends ReleaseAction {
    getDescription(): Promise<string>;
    perform(): Promise<void>;
    static isActive({ latest }: ActiveReleaseTrains, config: ReleaseConfig): Promise<boolean>;
}
