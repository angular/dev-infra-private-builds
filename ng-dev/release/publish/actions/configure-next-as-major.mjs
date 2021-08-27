"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureNextAsMajorAction = void 0;
const semver = require("semver");
const console_1 = require("../../../utils/console");
const actions_1 = require("../actions");
const commit_message_1 = require("../commit-message");
const constants_1 = require("../constants");
/**
 * Release action that configures the active next release-train to be for a major
 * version. This means that major changes can land in the next branch.
 */
class ConfigureNextAsMajorAction extends actions_1.ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = semver.parse(`${this.active.next.version.major + 1}.0.0-next.0`);
    }
    async getDescription() {
        const { branchName } = this.active.next;
        const newVersion = this._newVersion;
        return `Configure the "${branchName}" branch to be released as major (v${newVersion}).`;
    }
    async perform() {
        const { branchName } = this.active.next;
        const newVersion = this._newVersion;
        await this.verifyPassingGithubStatus(branchName);
        await this.checkoutUpstreamBranch(branchName);
        await this.updateProjectVersion(newVersion);
        await this.createCommit((0, commit_message_1.getCommitMessageForNextBranchMajorSwitch)(newVersion), [
            constants_1.packageJsonPath,
        ]);
        const pullRequest = await this.pushChangesToForkAndCreatePullRequest(branchName, `switch-next-to-major-${newVersion}`, `Configure next branch to receive major changes for v${newVersion}`);
        (0, console_1.info)((0, console_1.green)('  ✓   Next branch update pull request has been created.'));
        (0, console_1.info)((0, console_1.yellow)(`      Please ask team members to review: ${pullRequest.url}.`));
    }
    static async isActive(active) {
        // The `next` branch can always be switched to a major version, unless it already
        // is targeting a new major. A major can contain minor changes, so we can always
        // change the target from a minor to a major.
        return !active.next.isMajor;
    }
}
exports.ConfigureNextAsMajorAction = ConfigureNextAsMajorAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlLW5leHQtYXMtbWFqb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvY29uZmlndXJlLW5leHQtYXMtbWFqb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLG9EQUEyRDtBQUUzRCx3Q0FBeUM7QUFDekMsc0RBQTJFO0FBQzNFLDRDQUE2QztBQUU3Qzs7O0dBR0c7QUFDSCxNQUFhLDBCQUEyQixTQUFRLHVCQUFhO0lBQTdEOztRQUNVLGdCQUFXLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxhQUFhLENBQUUsQ0FBQztJQWtDMUYsQ0FBQztJQWhDVSxLQUFLLENBQUMsY0FBYztRQUMzQixNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxPQUFPLGtCQUFrQixVQUFVLHNDQUFzQyxVQUFVLElBQUksQ0FBQztJQUMxRixDQUFDO0lBRVEsS0FBSyxDQUFDLE9BQU87UUFDcEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3RDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFFcEMsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUMsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUEseURBQXdDLEVBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUUsMkJBQWU7U0FDaEIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMscUNBQXFDLENBQ2xFLFVBQVUsRUFDVix3QkFBd0IsVUFBVSxFQUFFLEVBQ3BDLHVEQUF1RCxVQUFVLEVBQUUsQ0FDcEUsQ0FBQztRQUVGLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBSyxFQUFDLHlEQUF5RCxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFBLGNBQUksRUFBQyxJQUFBLGdCQUFNLEVBQUMsNENBQTRDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELE1BQU0sQ0FBVSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQTJCO1FBQ3hELGlGQUFpRjtRQUNqRixnRkFBZ0Y7UUFDaEYsNkNBQTZDO1FBQzdDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUM5QixDQUFDO0NBQ0Y7QUFuQ0QsZ0VBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2dyZWVuLCBpbmZvLCB5ZWxsb3d9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yTmV4dEJyYW5jaE1ham9yU3dpdGNofSBmcm9tICcuLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge3BhY2thZ2VKc29uUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGNvbmZpZ3VyZXMgdGhlIGFjdGl2ZSBuZXh0IHJlbGVhc2UtdHJhaW4gdG8gYmUgZm9yIGEgbWFqb3JcbiAqIHZlcnNpb24uIFRoaXMgbWVhbnMgdGhhdCBtYWpvciBjaGFuZ2VzIGNhbiBsYW5kIGluIHRoZSBuZXh0IGJyYW5jaC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbmZpZ3VyZU5leHRBc01ham9yQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7dGhpcy5hY3RpdmUubmV4dC52ZXJzaW9uLm1ham9yICsgMX0uMC4wLW5leHQuMGApITtcblxuICBvdmVycmlkZSBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ29uZmlndXJlIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggdG8gYmUgcmVsZWFzZWQgYXMgbWFqb3IgKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuXG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKGJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGdldENvbW1pdE1lc3NhZ2VGb3JOZXh0QnJhbmNoTWFqb3JTd2l0Y2gobmV3VmVyc2lvbiksIFtcbiAgICAgIHBhY2thZ2VKc29uUGF0aCxcbiAgICBdKTtcbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIGJyYW5jaE5hbWUsXG4gICAgICBgc3dpdGNoLW5leHQtdG8tbWFqb3ItJHtuZXdWZXJzaW9ufWAsXG4gICAgICBgQ29uZmlndXJlIG5leHQgYnJhbmNoIHRvIHJlY2VpdmUgbWFqb3IgY2hhbmdlcyBmb3IgdiR7bmV3VmVyc2lvbn1gLFxuICAgICk7XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIE5leHQgYnJhbmNoIHVwZGF0ZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcbiAgfVxuXG4gIHN0YXRpYyBvdmVycmlkZSBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBUaGUgYG5leHRgIGJyYW5jaCBjYW4gYWx3YXlzIGJlIHN3aXRjaGVkIHRvIGEgbWFqb3IgdmVyc2lvbiwgdW5sZXNzIGl0IGFscmVhZHlcbiAgICAvLyBpcyB0YXJnZXRpbmcgYSBuZXcgbWFqb3IuIEEgbWFqb3IgY2FuIGNvbnRhaW4gbWlub3IgY2hhbmdlcywgc28gd2UgY2FuIGFsd2F5c1xuICAgIC8vIGNoYW5nZSB0aGUgdGFyZ2V0IGZyb20gYSBtaW5vciB0byBhIG1ham9yLlxuICAgIHJldHVybiAhYWN0aXZlLm5leHQuaXNNYWpvcjtcbiAgfVxufVxuIl19