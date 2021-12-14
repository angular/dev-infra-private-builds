"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CutLongTermSupportPatchAction = void 0;
const inquirer_1 = require("inquirer");
const semver_1 = require("../../../utils/semver");
const long_term_support_1 = require("../../versioning/long-term-support");
const actions_1 = require("../actions");
/**
 * Release action that cuts a new patch release for an active release-train in the long-term
 * support phase. The patch segment is incremented. The changelog is generated for the new
 * patch version, but also needs to be cherry-picked into the next development branch.
 */
class CutLongTermSupportPatchAction extends actions_1.ReleaseAction {
    constructor() {
        super(...arguments);
        /** Promise resolving an object describing long-term support branches. */
        this.ltsBranches = (0, long_term_support_1.fetchLongTermSupportBranchesFromNpm)(this.config);
    }
    async getDescription() {
        const { active } = await this.ltsBranches;
        return `Cut a new release for an active LTS branch (${active.length} active).`;
    }
    async perform() {
        const ltsBranch = await this._promptForTargetLtsBranch();
        const newVersion = (0, semver_1.semverInc)(ltsBranch.version, 'patch');
        const compareVersionForReleaseNotes = ltsBranch.version;
        const { pullRequest, releaseNotes } = await this.checkoutBranchAndStageVersion(newVersion, compareVersionForReleaseNotes, ltsBranch.name);
        await this.waitForPullRequestToBeMerged(pullRequest);
        await this.buildAndPublish(releaseNotes, ltsBranch.name, ltsBranch.npmDistTag, {
            // For LTS patch versions, we want to skip experimental packages.
            skipExperimentalPackages: true,
        });
        await this.cherryPickChangelogIntoNextBranch(releaseNotes, ltsBranch.name);
    }
    /** Prompts the user to select an LTS branch for which a patch should but cut. */
    async _promptForTargetLtsBranch() {
        const { active, inactive } = await this.ltsBranches;
        const activeBranchChoices = active.map((branch) => this._getChoiceForLtsBranch(branch));
        // If there are inactive LTS branches, we allow them to be selected. In some situations,
        // patch releases are still cut for inactive LTS branches. e.g. when the LTS duration
        // has been increased due to exceptional events ()
        if (inactive.length !== 0) {
            activeBranchChoices.push({ name: 'Inactive LTS versions (not recommended)', value: null });
        }
        const { activeLtsBranch, inactiveLtsBranch } = await (0, inquirer_1.prompt)([
            {
                name: 'activeLtsBranch',
                type: 'list',
                message: 'Please select a version for which you want to cut an LTS patch',
                choices: activeBranchChoices,
            },
            {
                name: 'inactiveLtsBranch',
                type: 'list',
                when: (o) => o.activeLtsBranch === null,
                message: 'Please select an inactive LTS version for which you want to cut an LTS patch',
                choices: inactive.map((branch) => this._getChoiceForLtsBranch(branch)),
            },
        ]);
        return activeLtsBranch ?? inactiveLtsBranch;
    }
    /** Gets an inquirer choice for the given LTS branch. */
    _getChoiceForLtsBranch(branch) {
        return { name: `v${branch.version.major} (from ${branch.name})`, value: branch };
    }
    static async isActive(active) {
        // LTS patch versions can be only cut if there are release trains in LTS phase.
        // This action is always selectable as we support publishing of old LTS branches,
        // and have prompt for selecting an LTS branch when the action performs.
        return true;
    }
}
exports.CutLongTermSupportPatchAction = CutLongTermSupportPatchAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LWx0cy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbHRzLXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUFtRDtBQUVuRCxrREFBZ0Q7QUFFaEQsMEVBQWtHO0FBQ2xHLHdDQUF5QztBQUV6Qzs7OztHQUlHO0FBQ0gsTUFBYSw2QkFBOEIsU0FBUSx1QkFBYTtJQUFoRTs7UUFDRSx5RUFBeUU7UUFDekUsZ0JBQVcsR0FBRyxJQUFBLHVEQUFtQyxFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQXNFakUsQ0FBQztJQXBFVSxLQUFLLENBQUMsY0FBYztRQUMzQixNQUFNLEVBQUMsTUFBTSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3hDLE9BQU8sK0NBQStDLE1BQU0sQ0FBQyxNQUFNLFdBQVcsQ0FBQztJQUNqRixDQUFDO0lBRVEsS0FBSyxDQUFDLE9BQU87UUFDcEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUN6RCxNQUFNLFVBQVUsR0FBRyxJQUFBLGtCQUFTLEVBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6RCxNQUFNLDZCQUE2QixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFFeEQsTUFBTSxFQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FDMUUsVUFBVSxFQUNWLDZCQUE2QixFQUM3QixTQUFTLENBQUMsSUFBSSxDQUNmLENBQUM7UUFFRixNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRTtZQUM3RSxpRUFBaUU7WUFDakUsd0JBQXdCLEVBQUUsSUFBSTtTQUMvQixDQUFDLENBQUM7UUFDSCxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFRCxpRkFBaUY7SUFDekUsS0FBSyxDQUFDLHlCQUF5QjtRQUNyQyxNQUFNLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNsRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRXhGLHdGQUF3RjtRQUN4RixxRkFBcUY7UUFDckYsa0RBQWtEO1FBQ2xELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDekIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLHlDQUF5QyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1NBQzFGO1FBRUQsTUFBTSxFQUFDLGVBQWUsRUFBRSxpQkFBaUIsRUFBQyxHQUFHLE1BQU0sSUFBQSxpQkFBTSxFQUd0RDtZQUNEO2dCQUNFLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxnRUFBZ0U7Z0JBQ3pFLE9BQU8sRUFBRSxtQkFBbUI7YUFDN0I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEtBQUssSUFBSTtnQkFDdkMsT0FBTyxFQUFFLDhFQUE4RTtnQkFDdkYsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN2RTtTQUNGLENBQUMsQ0FBQztRQUNILE9BQU8sZUFBZSxJQUFJLGlCQUFpQixDQUFDO0lBQzlDLENBQUM7SUFFRCx3REFBd0Q7SUFDaEQsc0JBQXNCLENBQUMsTUFBaUI7UUFDOUMsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxVQUFVLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELE1BQU0sQ0FBVSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQTJCO1FBQ3hELCtFQUErRTtRQUMvRSxpRkFBaUY7UUFDakYsd0VBQXdFO1FBQ3hFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBeEVELHNFQXdFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtzZW12ZXJJbmN9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3NlbXZlcic7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7ZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0sIEx0c0JyYW5jaH0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY3V0cyBhIG5ldyBwYXRjaCByZWxlYXNlIGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbG9uZy10ZXJtXG4gKiBzdXBwb3J0IHBoYXNlLiBUaGUgcGF0Y2ggc2VnbWVudCBpcyBpbmNyZW1lbnRlZC4gVGhlIGNoYW5nZWxvZyBpcyBnZW5lcmF0ZWQgZm9yIHRoZSBuZXdcbiAqIHBhdGNoIHZlcnNpb24sIGJ1dCBhbHNvIG5lZWRzIHRvIGJlIGNoZXJyeS1waWNrZWQgaW50byB0aGUgbmV4dCBkZXZlbG9wbWVudCBicmFuY2guXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXRMb25nVGVybVN1cHBvcnRQYXRjaEFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogUHJvbWlzZSByZXNvbHZpbmcgYW4gb2JqZWN0IGRlc2NyaWJpbmcgbG9uZy10ZXJtIHN1cHBvcnQgYnJhbmNoZXMuICovXG4gIGx0c0JyYW5jaGVzID0gZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0odGhpcy5jb25maWcpO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHthY3RpdmV9ID0gYXdhaXQgdGhpcy5sdHNCcmFuY2hlcztcbiAgICByZXR1cm4gYEN1dCBhIG5ldyByZWxlYXNlIGZvciBhbiBhY3RpdmUgTFRTIGJyYW5jaCAoJHthY3RpdmUubGVuZ3RofSBhY3RpdmUpLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IGx0c0JyYW5jaCA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclRhcmdldEx0c0JyYW5jaCgpO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBzZW12ZXJJbmMobHRzQnJhbmNoLnZlcnNpb24sICdwYXRjaCcpO1xuICAgIGNvbnN0IGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzID0gbHRzQnJhbmNoLnZlcnNpb247XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3QsIHJlbGVhc2VOb3Rlc30gPSBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzLFxuICAgICAgbHRzQnJhbmNoLm5hbWUsXG4gICAgKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBsdHNCcmFuY2gubmFtZSwgbHRzQnJhbmNoLm5wbURpc3RUYWcsIHtcbiAgICAgIC8vIEZvciBMVFMgcGF0Y2ggdmVyc2lvbnMsIHdlIHdhbnQgdG8gc2tpcCBleHBlcmltZW50YWwgcGFja2FnZXMuXG4gICAgICBza2lwRXhwZXJpbWVudGFsUGFja2FnZXM6IHRydWUsXG4gICAgfSk7XG4gICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gocmVsZWFzZU5vdGVzLCBsdHNCcmFuY2gubmFtZSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgdXNlciB0byBzZWxlY3QgYW4gTFRTIGJyYW5jaCBmb3Igd2hpY2ggYSBwYXRjaCBzaG91bGQgYnV0IGN1dC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yVGFyZ2V0THRzQnJhbmNoKCk6IFByb21pc2U8THRzQnJhbmNoPiB7XG4gICAgY29uc3Qge2FjdGl2ZSwgaW5hY3RpdmV9ID0gYXdhaXQgdGhpcy5sdHNCcmFuY2hlcztcbiAgICBjb25zdCBhY3RpdmVCcmFuY2hDaG9pY2VzID0gYWN0aXZlLm1hcCgoYnJhbmNoKSA9PiB0aGlzLl9nZXRDaG9pY2VGb3JMdHNCcmFuY2goYnJhbmNoKSk7XG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgaW5hY3RpdmUgTFRTIGJyYW5jaGVzLCB3ZSBhbGxvdyB0aGVtIHRvIGJlIHNlbGVjdGVkLiBJbiBzb21lIHNpdHVhdGlvbnMsXG4gICAgLy8gcGF0Y2ggcmVsZWFzZXMgYXJlIHN0aWxsIGN1dCBmb3IgaW5hY3RpdmUgTFRTIGJyYW5jaGVzLiBlLmcuIHdoZW4gdGhlIExUUyBkdXJhdGlvblxuICAgIC8vIGhhcyBiZWVuIGluY3JlYXNlZCBkdWUgdG8gZXhjZXB0aW9uYWwgZXZlbnRzICgpXG4gICAgaWYgKGluYWN0aXZlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgYWN0aXZlQnJhbmNoQ2hvaWNlcy5wdXNoKHtuYW1lOiAnSW5hY3RpdmUgTFRTIHZlcnNpb25zIChub3QgcmVjb21tZW5kZWQpJywgdmFsdWU6IG51bGx9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7YWN0aXZlTHRzQnJhbmNoLCBpbmFjdGl2ZUx0c0JyYW5jaH0gPSBhd2FpdCBwcm9tcHQ8e1xuICAgICAgYWN0aXZlTHRzQnJhbmNoOiBMdHNCcmFuY2ggfCBudWxsO1xuICAgICAgaW5hY3RpdmVMdHNCcmFuY2g6IEx0c0JyYW5jaDtcbiAgICB9PihbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdhY3RpdmVMdHNCcmFuY2gnLFxuICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGEgdmVyc2lvbiBmb3Igd2hpY2ggeW91IHdhbnQgdG8gY3V0IGFuIExUUyBwYXRjaCcsXG4gICAgICAgIGNob2ljZXM6IGFjdGl2ZUJyYW5jaENob2ljZXMsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnaW5hY3RpdmVMdHNCcmFuY2gnLFxuICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgIHdoZW46IChvKSA9PiBvLmFjdGl2ZUx0c0JyYW5jaCA9PT0gbnVsbCxcbiAgICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gaW5hY3RpdmUgTFRTIHZlcnNpb24gZm9yIHdoaWNoIHlvdSB3YW50IHRvIGN1dCBhbiBMVFMgcGF0Y2gnLFxuICAgICAgICBjaG9pY2VzOiBpbmFjdGl2ZS5tYXAoKGJyYW5jaCkgPT4gdGhpcy5fZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaCkpLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICByZXR1cm4gYWN0aXZlTHRzQnJhbmNoID8/IGluYWN0aXZlTHRzQnJhbmNoO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gaW5xdWlyZXIgY2hvaWNlIGZvciB0aGUgZ2l2ZW4gTFRTIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBfZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaDogTHRzQnJhbmNoKTogTGlzdENob2ljZU9wdGlvbnMge1xuICAgIHJldHVybiB7bmFtZTogYHYke2JyYW5jaC52ZXJzaW9uLm1ham9yfSAoZnJvbSAke2JyYW5jaC5uYW1lfSlgLCB2YWx1ZTogYnJhbmNofTtcbiAgfVxuXG4gIHN0YXRpYyBvdmVycmlkZSBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBMVFMgcGF0Y2ggdmVyc2lvbnMgY2FuIGJlIG9ubHkgY3V0IGlmIHRoZXJlIGFyZSByZWxlYXNlIHRyYWlucyBpbiBMVFMgcGhhc2UuXG4gICAgLy8gVGhpcyBhY3Rpb24gaXMgYWx3YXlzIHNlbGVjdGFibGUgYXMgd2Ugc3VwcG9ydCBwdWJsaXNoaW5nIG9mIG9sZCBMVFMgYnJhbmNoZXMsXG4gICAgLy8gYW5kIGhhdmUgcHJvbXB0IGZvciBzZWxlY3RpbmcgYW4gTFRTIGJyYW5jaCB3aGVuIHRoZSBhY3Rpb24gcGVyZm9ybXMuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==