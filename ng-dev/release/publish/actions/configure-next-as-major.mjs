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
const constants_1 = require("../../../utils/constants");
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
            constants_1.workspaceRelativePackageJsonPath,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlLW5leHQtYXMtbWFqb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvY29uZmlndXJlLW5leHQtYXMtbWFqb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLG9EQUEyRDtBQUUzRCx3Q0FBeUM7QUFDekMsc0RBQTJFO0FBQzNFLHdEQUEwRTtBQUUxRTs7O0dBR0c7QUFDSCxNQUFhLDBCQUEyQixTQUFRLHVCQUFhO0lBQTdEOztRQUNVLGdCQUFXLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxhQUFhLENBQUUsQ0FBQztJQWtDMUYsQ0FBQztJQWhDVSxLQUFLLENBQUMsY0FBYztRQUMzQixNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxPQUFPLGtCQUFrQixVQUFVLHNDQUFzQyxVQUFVLElBQUksQ0FBQztJQUMxRixDQUFDO0lBRVEsS0FBSyxDQUFDLE9BQU87UUFDcEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3RDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFFcEMsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUMsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUEseURBQXdDLEVBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUUsNENBQWdDO1NBQ2pDLENBQUMsQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLHFDQUFxQyxDQUNsRSxVQUFVLEVBQ1Ysd0JBQXdCLFVBQVUsRUFBRSxFQUNwQyx1REFBdUQsVUFBVSxFQUFFLENBQ3BFLENBQUM7UUFFRixJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQyx5REFBeUQsQ0FBQyxDQUFDLENBQUM7UUFDdkUsSUFBQSxjQUFJLEVBQUMsSUFBQSxnQkFBTSxFQUFDLDRDQUE0QyxXQUFXLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFRCxNQUFNLENBQVUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUEyQjtRQUN4RCxpRkFBaUY7UUFDakYsZ0ZBQWdGO1FBQ2hGLDZDQUE2QztRQUM3QyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDOUIsQ0FBQztDQUNGO0FBbkNELGdFQW1DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtncmVlbiwgaW5mbywgeWVsbG93fSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUZvck5leHRCcmFuY2hNYWpvclN3aXRjaH0gZnJvbSAnLi4vY29tbWl0LW1lc3NhZ2UnO1xuaW1wb3J0IHt3b3Jrc3BhY2VSZWxhdGl2ZVBhY2thZ2VKc29uUGF0aH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc3RhbnRzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGNvbmZpZ3VyZXMgdGhlIGFjdGl2ZSBuZXh0IHJlbGVhc2UtdHJhaW4gdG8gYmUgZm9yIGEgbWFqb3JcbiAqIHZlcnNpb24uIFRoaXMgbWVhbnMgdGhhdCBtYWpvciBjaGFuZ2VzIGNhbiBsYW5kIGluIHRoZSBuZXh0IGJyYW5jaC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbmZpZ3VyZU5leHRBc01ham9yQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7dGhpcy5hY3RpdmUubmV4dC52ZXJzaW9uLm1ham9yICsgMX0uMC4wLW5leHQuMGApITtcblxuICBvdmVycmlkZSBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ29uZmlndXJlIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggdG8gYmUgcmVsZWFzZWQgYXMgbWFqb3IgKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuXG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKGJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGdldENvbW1pdE1lc3NhZ2VGb3JOZXh0QnJhbmNoTWFqb3JTd2l0Y2gobmV3VmVyc2lvbiksIFtcbiAgICAgIHdvcmtzcGFjZVJlbGF0aXZlUGFja2FnZUpzb25QYXRoLFxuICAgIF0pO1xuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgYnJhbmNoTmFtZSxcbiAgICAgIGBzd2l0Y2gtbmV4dC10by1tYWpvci0ke25ld1ZlcnNpb259YCxcbiAgICAgIGBDb25maWd1cmUgbmV4dCBicmFuY2ggdG8gcmVjZWl2ZSBtYWpvciBjaGFuZ2VzIGZvciB2JHtuZXdWZXJzaW9ufWAsXG4gICAgKTtcblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgTmV4dCBicmFuY2ggdXBkYXRlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuICB9XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIFRoZSBgbmV4dGAgYnJhbmNoIGNhbiBhbHdheXMgYmUgc3dpdGNoZWQgdG8gYSBtYWpvciB2ZXJzaW9uLCB1bmxlc3MgaXQgYWxyZWFkeVxuICAgIC8vIGlzIHRhcmdldGluZyBhIG5ldyBtYWpvci4gQSBtYWpvciBjYW4gY29udGFpbiBtaW5vciBjaGFuZ2VzLCBzbyB3ZSBjYW4gYWx3YXlzXG4gICAgLy8gY2hhbmdlIHRoZSB0YXJnZXQgZnJvbSBhIG1pbm9yIHRvIGEgbWFqb3IuXG4gICAgcmV0dXJuICFhY3RpdmUubmV4dC5pc01ham9yO1xuICB9XG59XG4iXX0=