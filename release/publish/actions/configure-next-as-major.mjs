/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as semver from 'semver';
import { green, info, yellow } from '../../../utils/console';
import { ReleaseAction } from '../actions';
import { getCommitMessageForNextBranchMajorSwitch } from '../commit-message';
import { packageJsonPath } from '../constants';
/**
 * Release action that configures the active next release-train to be for a major
 * version. This means that major changes can land in the next branch.
 */
export class ConfigureNextAsMajorAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = semver.parse(`${this.active.next.version.major + 1}.0.0-next.0`);
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.next;
            const newVersion = this._newVersion;
            return `Configure the "${branchName}" branch to be released as major (v${newVersion}).`;
        });
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.next;
            const newVersion = this._newVersion;
            yield this.verifyPassingGithubStatus(branchName);
            yield this.checkoutUpstreamBranch(branchName);
            yield this.updateProjectVersion(newVersion);
            yield this.createCommit(getCommitMessageForNextBranchMajorSwitch(newVersion), [packageJsonPath]);
            const pullRequest = yield this.pushChangesToForkAndCreatePullRequest(branchName, `switch-next-to-major-${newVersion}`, `Configure next branch to receive major changes for v${newVersion}`);
            info(green('  ✓   Next branch update pull request has been created.'));
            info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));
        });
    }
    static isActive(active) {
        return __awaiter(this, void 0, void 0, function* () {
            // The `next` branch can always be switched to a major version, unless it already
            // is targeting a new major. A major can contain minor changes, so we can always
            // change the target from a minor to a major.
            return !active.next.isMajor;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlLW5leHQtYXMtbWFqb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvY29uZmlndXJlLW5leHQtYXMtbWFqb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRWpDLE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRTNELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDekMsT0FBTyxFQUFDLHdDQUF3QyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDM0UsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUU3Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sMEJBQTJCLFNBQVEsYUFBYTtJQUE3RDs7UUFDVSxnQkFBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsYUFBYSxDQUFFLENBQUM7SUErQjFGLENBQUM7SUE3Qk8sY0FBYzs7WUFDbEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3RDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDcEMsT0FBTyxrQkFBa0IsVUFBVSxzQ0FBc0MsVUFBVSxJQUFJLENBQUM7UUFDMUYsQ0FBQztLQUFBO0lBRUssT0FBTzs7WUFDWCxNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUVwQyxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5QyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1QyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQ25CLHdDQUF3QyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUM3RSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxxQ0FBcUMsQ0FDaEUsVUFBVSxFQUFFLHdCQUF3QixVQUFVLEVBQUUsRUFDaEQsdURBQXVELFVBQVUsRUFBRSxDQUFDLENBQUM7WUFFekUsSUFBSSxDQUFDLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyw0Q0FBNEMsV0FBVyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sUUFBUSxDQUFDLE1BQTJCOztZQUMvQyxpRkFBaUY7WUFDakYsZ0ZBQWdGO1lBQ2hGLDZDQUE2QztZQUM3QyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDOUIsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7Z3JlZW4sIGluZm8sIHllbGxvd30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JOZXh0QnJhbmNoTWFqb3JTd2l0Y2h9IGZyb20gJy4uL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7cGFja2FnZUpzb25QYXRofSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY29uZmlndXJlcyB0aGUgYWN0aXZlIG5leHQgcmVsZWFzZS10cmFpbiB0byBiZSBmb3IgYSBtYWpvclxuICogdmVyc2lvbi4gVGhpcyBtZWFucyB0aGF0IG1ham9yIGNoYW5nZXMgY2FuIGxhbmQgaW4gdGhlIG5leHQgYnJhbmNoLlxuICovXG5leHBvcnQgY2xhc3MgQ29uZmlndXJlTmV4dEFzTWFqb3JBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHt0aGlzLmFjdGl2ZS5uZXh0LnZlcnNpb24ubWFqb3IgKyAxfS4wLjAtbmV4dC4wYCkhO1xuXG4gIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDb25maWd1cmUgdGhlIFwiJHticmFuY2hOYW1lfVwiIGJyYW5jaCB0byBiZSByZWxlYXNlZCBhcyBtYWpvciAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoYnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKGJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoXG4gICAgICAgIGdldENvbW1pdE1lc3NhZ2VGb3JOZXh0QnJhbmNoTWFqb3JTd2l0Y2gobmV3VmVyc2lvbiksIFtwYWNrYWdlSnNvblBhdGhdKTtcbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgYnJhbmNoTmFtZSwgYHN3aXRjaC1uZXh0LXRvLW1ham9yLSR7bmV3VmVyc2lvbn1gLFxuICAgICAgICBgQ29uZmlndXJlIG5leHQgYnJhbmNoIHRvIHJlY2VpdmUgbWFqb3IgY2hhbmdlcyBmb3IgdiR7bmV3VmVyc2lvbn1gKTtcblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgTmV4dCBicmFuY2ggdXBkYXRlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIFRoZSBgbmV4dGAgYnJhbmNoIGNhbiBhbHdheXMgYmUgc3dpdGNoZWQgdG8gYSBtYWpvciB2ZXJzaW9uLCB1bmxlc3MgaXQgYWxyZWFkeVxuICAgIC8vIGlzIHRhcmdldGluZyBhIG5ldyBtYWpvci4gQSBtYWpvciBjYW4gY29udGFpbiBtaW5vciBjaGFuZ2VzLCBzbyB3ZSBjYW4gYWx3YXlzXG4gICAgLy8gY2hhbmdlIHRoZSB0YXJnZXQgZnJvbSBhIG1pbm9yIHRvIGEgbWFqb3IuXG4gICAgcmV0dXJuICFhY3RpdmUubmV4dC5pc01ham9yO1xuICB9XG59XG4iXX0=