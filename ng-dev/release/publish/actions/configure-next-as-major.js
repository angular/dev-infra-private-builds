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
        await this.createCommit(commit_message_1.getCommitMessageForNextBranchMajorSwitch(newVersion), [
            constants_1.packageJsonPath,
        ]);
        const pullRequest = await this.pushChangesToForkAndCreatePullRequest(branchName, `switch-next-to-major-${newVersion}`, `Configure next branch to receive major changes for v${newVersion}`);
        console_1.info(console_1.green('  ✓   Next branch update pull request has been created.'));
        console_1.info(console_1.yellow(`      Please ask team members to review: ${pullRequest.url}.`));
    }
    static async isActive(active) {
        // The `next` branch can always be switched to a major version, unless it already
        // is targeting a new major. A major can contain minor changes, so we can always
        // change the target from a minor to a major.
        return !active.next.isMajor;
    }
}
exports.ConfigureNextAsMajorAction = ConfigureNextAsMajorAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlLW5leHQtYXMtbWFqb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvY29uZmlndXJlLW5leHQtYXMtbWFqb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLG9EQUEyRDtBQUUzRCx3Q0FBeUM7QUFDekMsc0RBQTJFO0FBQzNFLDRDQUE2QztBQUU3Qzs7O0dBR0c7QUFDSCxNQUFhLDBCQUEyQixTQUFRLHVCQUFhO0lBQTdEOztRQUNVLGdCQUFXLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxhQUFhLENBQUUsQ0FBQztJQWtDMUYsQ0FBQztJQWhDVSxLQUFLLENBQUMsY0FBYztRQUMzQixNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxPQUFPLGtCQUFrQixVQUFVLHNDQUFzQyxVQUFVLElBQUksQ0FBQztJQUMxRixDQUFDO0lBRVEsS0FBSyxDQUFDLE9BQU87UUFDcEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3RDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFFcEMsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUMsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLHlEQUF3QyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzVFLDJCQUFlO1NBQ2hCLENBQUMsQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLHFDQUFxQyxDQUNsRSxVQUFVLEVBQ1Ysd0JBQXdCLFVBQVUsRUFBRSxFQUNwQyx1REFBdUQsVUFBVSxFQUFFLENBQ3BFLENBQUM7UUFFRixjQUFJLENBQUMsZUFBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUMsQ0FBQztRQUN2RSxjQUFJLENBQUMsZ0JBQU0sQ0FBQyw0Q0FBNEMsV0FBVyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQsTUFBTSxDQUFVLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBMkI7UUFDeEQsaUZBQWlGO1FBQ2pGLGdGQUFnRjtRQUNoRiw2Q0FBNkM7UUFDN0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzlCLENBQUM7Q0FDRjtBQW5DRCxnRUFtQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7Z3JlZW4sIGluZm8sIHllbGxvd30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JOZXh0QnJhbmNoTWFqb3JTd2l0Y2h9IGZyb20gJy4uL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7cGFja2FnZUpzb25QYXRofSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY29uZmlndXJlcyB0aGUgYWN0aXZlIG5leHQgcmVsZWFzZS10cmFpbiB0byBiZSBmb3IgYSBtYWpvclxuICogdmVyc2lvbi4gVGhpcyBtZWFucyB0aGF0IG1ham9yIGNoYW5nZXMgY2FuIGxhbmQgaW4gdGhlIG5leHQgYnJhbmNoLlxuICovXG5leHBvcnQgY2xhc3MgQ29uZmlndXJlTmV4dEFzTWFqb3JBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHt0aGlzLmFjdGl2ZS5uZXh0LnZlcnNpb24ubWFqb3IgKyAxfS4wLjAtbmV4dC4wYCkhO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDb25maWd1cmUgdGhlIFwiJHticmFuY2hOYW1lfVwiIGJyYW5jaCB0byBiZSByZWxlYXNlZCBhcyBtYWpvciAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoYnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKGJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoZ2V0Q29tbWl0TWVzc2FnZUZvck5leHRCcmFuY2hNYWpvclN3aXRjaChuZXdWZXJzaW9uKSwgW1xuICAgICAgcGFja2FnZUpzb25QYXRoLFxuICAgIF0pO1xuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgYnJhbmNoTmFtZSxcbiAgICAgIGBzd2l0Y2gtbmV4dC10by1tYWpvci0ke25ld1ZlcnNpb259YCxcbiAgICAgIGBDb25maWd1cmUgbmV4dCBicmFuY2ggdG8gcmVjZWl2ZSBtYWpvciBjaGFuZ2VzIGZvciB2JHtuZXdWZXJzaW9ufWAsXG4gICAgKTtcblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgTmV4dCBicmFuY2ggdXBkYXRlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuICB9XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIFRoZSBgbmV4dGAgYnJhbmNoIGNhbiBhbHdheXMgYmUgc3dpdGNoZWQgdG8gYSBtYWpvciB2ZXJzaW9uLCB1bmxlc3MgaXQgYWxyZWFkeVxuICAgIC8vIGlzIHRhcmdldGluZyBhIG5ldyBtYWpvci4gQSBtYWpvciBjYW4gY29udGFpbiBtaW5vciBjaGFuZ2VzLCBzbyB3ZSBjYW4gYWx3YXlzXG4gICAgLy8gY2hhbmdlIHRoZSB0YXJnZXQgZnJvbSBhIG1pbm9yIHRvIGEgbWFqb3IuXG4gICAgcmV0dXJuICFhY3RpdmUubmV4dC5pc01ham9yO1xuICB9XG59XG4iXX0=