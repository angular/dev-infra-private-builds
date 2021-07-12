/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as semver from 'semver';
import { fetchProjectNpmPackageInfo } from '../../versioning/npm-registry';
import { ReleaseAction } from '../actions';
import { invokeSetNpmDistCommand, invokeYarnInstallCommand } from '../external-commands';
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
export class TagRecentMajorAsLatest extends ReleaseAction {
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return `Tag recently published major v${this.active.latest.version} as "next" in NPM.`;
        });
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkoutUpstreamBranch(this.active.latest.branchName);
            yield invokeYarnInstallCommand(this.projectDir);
            yield invokeSetNpmDistCommand('latest', this.active.latest.version);
        });
    }
    static isActive({ latest }, config) {
        return __awaiter(this, void 0, void 0, function* () {
            // If the latest release-train does currently not have a major version as version. e.g.
            // the latest branch is `10.0.x` with the version being `10.0.2`. In such cases, a major
            // has not been released recently, and this action should never become active.
            if (latest.version.minor !== 0 || latest.version.patch !== 0) {
                return false;
            }
            const packageInfo = yield fetchProjectNpmPackageInfo(config);
            const npmLatestVersion = semver.parse(packageInfo['dist-tags']['latest']);
            // This action only becomes active if a major just has been released recently, but is
            // not set to the `latest` NPM dist tag in the NPM registry. Note that we only allow
            // re-tagging if the current `@latest` in NPM is the previous major version.
            return npmLatestVersion !== null && npmLatestVersion.major === latest.version.major - 1;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvdGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBSWpDLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDekMsT0FBTyxFQUFDLHVCQUF1QixFQUFFLHdCQUF3QixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkY7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGFBQWE7SUFDeEMsY0FBYzs7WUFDM0IsT0FBTyxpQ0FBaUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxvQkFBb0IsQ0FBQztRQUN6RixDQUFDO0tBQUE7SUFFYyxPQUFPOztZQUNwQixNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRSxNQUFNLHdCQUF3QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRCxNQUFNLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0RSxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQWdCLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBc0IsRUFBRSxNQUFxQjs7WUFDakYsdUZBQXVGO1lBQ3ZGLHdGQUF3RjtZQUN4Riw4RUFBOEU7WUFDOUUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO2dCQUM1RCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSwwQkFBMEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDMUUscUZBQXFGO1lBQ3JGLG9GQUFvRjtZQUNwRiw0RUFBNEU7WUFDNUUsT0FBTyxnQkFBZ0IsS0FBSyxJQUFJLElBQUksZ0JBQWdCLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUMxRixDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi9jb25maWcnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2ZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL25wbS1yZWdpc3RyeSc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtpbnZva2VTZXROcG1EaXN0Q29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCB0YWdzIHRoZSByZWNlbnRseSBwdWJsaXNoZWQgbWFqb3IgYXMgbGF0ZXN0IHdpdGhpbiB0aGUgTlBNXG4gKiByZWdpc3RyeS4gTWFqb3IgdmVyc2lvbnMgYXJlIHB1Ymxpc2hlZCB0byB0aGUgYG5leHRgIE5QTSBkaXN0IHRhZyBpbml0aWFsbHkgYW5kXG4gKiBjYW4gYmUgcmUtdGFnZ2VkIHRvIHRoZSBgbGF0ZXN0YCBOUE0gZGlzdCB0YWcuIFRoaXMgYWxsb3dzIGNhcmV0YWtlcnMgdG8gbWFrZSBtYWpvclxuICogcmVsZWFzZXMgYXZhaWxhYmxlIGF0IHRoZSBzYW1lIHRpbWUuIGUuZy4gRnJhbWV3b3JrLCBUb29saW5nIGFuZCBDb21wb25lbnRzXG4gKiBhcmUgYWJsZSB0byBwdWJsaXNoIHYxMiB0byBgQGxhdGVzdGAgYXQgdGhlIHNhbWUgdGltZS4gVGhpcyB3b3VsZG4ndCBiZSBwb3NzaWJsZSBpZlxuICogd2UgZGlyZWN0bHkgcHVibGlzaCB0byBgQGxhdGVzdGAgYmVjYXVzZSBUb29saW5nIGFuZCBDb21wb25lbnRzIG5lZWRzIHRvIHdhaXRcbiAqIGZvciB0aGUgbWFqb3IgZnJhbWV3b3JrIHJlbGVhc2UgdG8gYmUgYXZhaWxhYmxlIG9uIE5QTS5cbiAqIEBzZWUge0N1dFN0YWJsZUFjdGlvbiNwZXJmb3JtfSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgY2xhc3MgVGFnUmVjZW50TWFqb3JBc0xhdGVzdCBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBvdmVycmlkZSBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICByZXR1cm4gYFRhZyByZWNlbnRseSBwdWJsaXNoZWQgbWFqb3IgdiR7dGhpcy5hY3RpdmUubGF0ZXN0LnZlcnNpb259IGFzIFwibmV4dFwiIGluIE5QTS5gO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2godGhpcy5hY3RpdmUubGF0ZXN0LmJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgIGF3YWl0IGludm9rZVNldE5wbURpc3RDb21tYW5kKCdsYXRlc3QnLCB0aGlzLmFjdGl2ZS5sYXRlc3QudmVyc2lvbik7XG4gIH1cblxuICBzdGF0aWMgb3ZlcnJpZGUgYXN5bmMgaXNBY3RpdmUoe2xhdGVzdH06IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZykge1xuICAgIC8vIElmIHRoZSBsYXRlc3QgcmVsZWFzZS10cmFpbiBkb2VzIGN1cnJlbnRseSBub3QgaGF2ZSBhIG1ham9yIHZlcnNpb24gYXMgdmVyc2lvbi4gZS5nLlxuICAgIC8vIHRoZSBsYXRlc3QgYnJhbmNoIGlzIGAxMC4wLnhgIHdpdGggdGhlIHZlcnNpb24gYmVpbmcgYDEwLjAuMmAuIEluIHN1Y2ggY2FzZXMsIGEgbWFqb3JcbiAgICAvLyBoYXMgbm90IGJlZW4gcmVsZWFzZWQgcmVjZW50bHksIGFuZCB0aGlzIGFjdGlvbiBzaG91bGQgbmV2ZXIgYmVjb21lIGFjdGl2ZS5cbiAgICBpZiAobGF0ZXN0LnZlcnNpb24ubWlub3IgIT09IDAgfHwgbGF0ZXN0LnZlcnNpb24ucGF0Y2ggIT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlSW5mbyA9IGF3YWl0IGZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvKGNvbmZpZyk7XG4gICAgY29uc3QgbnBtTGF0ZXN0VmVyc2lvbiA9IHNlbXZlci5wYXJzZShwYWNrYWdlSW5mb1snZGlzdC10YWdzJ11bJ2xhdGVzdCddKTtcbiAgICAvLyBUaGlzIGFjdGlvbiBvbmx5IGJlY29tZXMgYWN0aXZlIGlmIGEgbWFqb3IganVzdCBoYXMgYmVlbiByZWxlYXNlZCByZWNlbnRseSwgYnV0IGlzXG4gICAgLy8gbm90IHNldCB0byB0aGUgYGxhdGVzdGAgTlBNIGRpc3QgdGFnIGluIHRoZSBOUE0gcmVnaXN0cnkuIE5vdGUgdGhhdCB3ZSBvbmx5IGFsbG93XG4gICAgLy8gcmUtdGFnZ2luZyBpZiB0aGUgY3VycmVudCBgQGxhdGVzdGAgaW4gTlBNIGlzIHRoZSBwcmV2aW91cyBtYWpvciB2ZXJzaW9uLlxuICAgIHJldHVybiBucG1MYXRlc3RWZXJzaW9uICE9PSBudWxsICYmIG5wbUxhdGVzdFZlcnNpb24ubWFqb3IgPT09IGxhdGVzdC52ZXJzaW9uLm1ham9yIC0gMTtcbiAgfVxufVxuIl19