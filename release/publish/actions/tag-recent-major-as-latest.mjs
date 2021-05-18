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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvdGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBSWpDLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDekMsT0FBTyxFQUFDLHVCQUF1QixFQUFFLHdCQUF3QixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkY7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGFBQWE7SUFDakQsY0FBYzs7WUFDbEIsT0FBTyxpQ0FBaUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxvQkFBb0IsQ0FBQztRQUN6RixDQUFDO0tBQUE7SUFFSyxPQUFPOztZQUNYLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sd0JBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sdUJBQXVCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7S0FBQTtJQUVELE1BQU0sQ0FBTyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQXNCLEVBQUUsTUFBcUI7O1lBQ3hFLHVGQUF1RjtZQUN2Rix3RkFBd0Y7WUFDeEYsOEVBQThFO1lBQzlFLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDNUQsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzFFLHFGQUFxRjtZQUNyRixvRkFBb0Y7WUFDcEYsNEVBQTRFO1lBQzVFLE9BQU8sZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDMUYsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mb30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9ucG0tcmVnaXN0cnknO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7aW52b2tlU2V0TnBtRGlzdENvbW1hbmQsIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZH0gZnJvbSAnLi4vZXh0ZXJuYWwtY29tbWFuZHMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgdGFncyB0aGUgcmVjZW50bHkgcHVibGlzaGVkIG1ham9yIGFzIGxhdGVzdCB3aXRoaW4gdGhlIE5QTVxuICogcmVnaXN0cnkuIE1ham9yIHZlcnNpb25zIGFyZSBwdWJsaXNoZWQgdG8gdGhlIGBuZXh0YCBOUE0gZGlzdCB0YWcgaW5pdGlhbGx5IGFuZFxuICogY2FuIGJlIHJlLXRhZ2dlZCB0byB0aGUgYGxhdGVzdGAgTlBNIGRpc3QgdGFnLiBUaGlzIGFsbG93cyBjYXJldGFrZXJzIHRvIG1ha2UgbWFqb3JcbiAqIHJlbGVhc2VzIGF2YWlsYWJsZSBhdCB0aGUgc2FtZSB0aW1lLiBlLmcuIEZyYW1ld29yaywgVG9vbGluZyBhbmQgQ29tcG9uZW50c1xuICogYXJlIGFibGUgdG8gcHVibGlzaCB2MTIgdG8gYEBsYXRlc3RgIGF0IHRoZSBzYW1lIHRpbWUuIFRoaXMgd291bGRuJ3QgYmUgcG9zc2libGUgaWZcbiAqIHdlIGRpcmVjdGx5IHB1Ymxpc2ggdG8gYEBsYXRlc3RgIGJlY2F1c2UgVG9vbGluZyBhbmQgQ29tcG9uZW50cyBuZWVkcyB0byB3YWl0XG4gKiBmb3IgdGhlIG1ham9yIGZyYW1ld29yayByZWxlYXNlIHRvIGJlIGF2YWlsYWJsZSBvbiBOUE0uXG4gKiBAc2VlIHtDdXRTdGFibGVBY3Rpb24jcGVyZm9ybX0gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRhZ1JlY2VudE1ham9yQXNMYXRlc3QgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIGBUYWcgcmVjZW50bHkgcHVibGlzaGVkIG1ham9yIHYke3RoaXMuYWN0aXZlLmxhdGVzdC52ZXJzaW9ufSBhcyBcIm5leHRcIiBpbiBOUE0uYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHRoaXMuYWN0aXZlLmxhdGVzdC5icmFuY2hOYW1lKTtcbiAgICBhd2FpdCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBhd2FpdCBpbnZva2VTZXROcG1EaXN0Q29tbWFuZCgnbGF0ZXN0JywgdGhpcy5hY3RpdmUubGF0ZXN0LnZlcnNpb24pO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKHtsYXRlc3R9OiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpIHtcbiAgICAvLyBJZiB0aGUgbGF0ZXN0IHJlbGVhc2UtdHJhaW4gZG9lcyBjdXJyZW50bHkgbm90IGhhdmUgYSBtYWpvciB2ZXJzaW9uIGFzIHZlcnNpb24uIGUuZy5cbiAgICAvLyB0aGUgbGF0ZXN0IGJyYW5jaCBpcyBgMTAuMC54YCB3aXRoIHRoZSB2ZXJzaW9uIGJlaW5nIGAxMC4wLjJgLiBJbiBzdWNoIGNhc2VzLCBhIG1ham9yXG4gICAgLy8gaGFzIG5vdCBiZWVuIHJlbGVhc2VkIHJlY2VudGx5LCBhbmQgdGhpcyBhY3Rpb24gc2hvdWxkIG5ldmVyIGJlY29tZSBhY3RpdmUuXG4gICAgaWYgKGxhdGVzdC52ZXJzaW9uLm1pbm9yICE9PSAwIHx8IGxhdGVzdC52ZXJzaW9uLnBhdGNoICE9PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcGFja2FnZUluZm8gPSBhd2FpdCBmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mbyhjb25maWcpO1xuICAgIGNvbnN0IG5wbUxhdGVzdFZlcnNpb24gPSBzZW12ZXIucGFyc2UocGFja2FnZUluZm9bJ2Rpc3QtdGFncyddWydsYXRlc3QnXSk7XG4gICAgLy8gVGhpcyBhY3Rpb24gb25seSBiZWNvbWVzIGFjdGl2ZSBpZiBhIG1ham9yIGp1c3QgaGFzIGJlZW4gcmVsZWFzZWQgcmVjZW50bHksIGJ1dCBpc1xuICAgIC8vIG5vdCBzZXQgdG8gdGhlIGBsYXRlc3RgIE5QTSBkaXN0IHRhZyBpbiB0aGUgTlBNIHJlZ2lzdHJ5LiBOb3RlIHRoYXQgd2Ugb25seSBhbGxvd1xuICAgIC8vIHJlLXRhZ2dpbmcgaWYgdGhlIGN1cnJlbnQgYEBsYXRlc3RgIGluIE5QTSBpcyB0aGUgcHJldmlvdXMgbWFqb3IgdmVyc2lvbi5cbiAgICByZXR1cm4gbnBtTGF0ZXN0VmVyc2lvbiAhPT0gbnVsbCAmJiBucG1MYXRlc3RWZXJzaW9uLm1ham9yID09PSBsYXRlc3QudmVyc2lvbi5tYWpvciAtIDE7XG4gIH1cbn1cbiJdfQ==