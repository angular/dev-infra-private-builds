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
        await this.buildAndPublish(releaseNotes, ltsBranch.name, ltsBranch.npmDistTag);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LWx0cy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbHRzLXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUFtRDtBQUVuRCxrREFBZ0Q7QUFFaEQsMEVBQWtHO0FBQ2xHLHdDQUF5QztBQUV6Qzs7OztHQUlHO0FBQ0gsTUFBYSw2QkFBOEIsU0FBUSx1QkFBYTtJQUFoRTs7UUFDRSx5RUFBeUU7UUFDekUsZ0JBQVcsR0FBRyxJQUFBLHVEQUFtQyxFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQW1FakUsQ0FBQztJQWpFVSxLQUFLLENBQUMsY0FBYztRQUMzQixNQUFNLEVBQUMsTUFBTSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3hDLE9BQU8sK0NBQStDLE1BQU0sQ0FBQyxNQUFNLFdBQVcsQ0FBQztJQUNqRixDQUFDO0lBRVEsS0FBSyxDQUFDLE9BQU87UUFDcEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUN6RCxNQUFNLFVBQVUsR0FBRyxJQUFBLGtCQUFTLEVBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6RCxNQUFNLDZCQUE2QixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFFeEQsTUFBTSxFQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FDMUUsVUFBVSxFQUNWLDZCQUE2QixFQUM3QixTQUFTLENBQUMsSUFBSSxDQUNmLENBQUM7UUFFRixNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELGlGQUFpRjtJQUN6RSxLQUFLLENBQUMseUJBQXlCO1FBQ3JDLE1BQU0sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2xELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFeEYsd0ZBQXdGO1FBQ3hGLHFGQUFxRjtRQUNyRixrREFBa0Q7UUFDbEQsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN6QixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUseUNBQXlDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7U0FDMUY7UUFFRCxNQUFNLEVBQUMsZUFBZSxFQUFFLGlCQUFpQixFQUFDLEdBQUcsTUFBTSxJQUFBLGlCQUFNLEVBR3REO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLGlCQUFpQjtnQkFDdkIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osT0FBTyxFQUFFLGdFQUFnRTtnQkFDekUsT0FBTyxFQUFFLG1CQUFtQjthQUM3QjtZQUNEO2dCQUNFLElBQUksRUFBRSxtQkFBbUI7Z0JBQ3pCLElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsS0FBSyxJQUFJO2dCQUN2QyxPQUFPLEVBQUUsOEVBQThFO2dCQUN2RixPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZFO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxlQUFlLElBQUksaUJBQWlCLENBQUM7SUFDOUMsQ0FBQztJQUVELHdEQUF3RDtJQUNoRCxzQkFBc0IsQ0FBQyxNQUFpQjtRQUM5QyxPQUFPLEVBQUMsSUFBSSxFQUFFLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFVBQVUsTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsTUFBTSxDQUFVLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBMkI7UUFDeEQsK0VBQStFO1FBQy9FLGlGQUFpRjtRQUNqRix3RUFBd0U7UUFDeEUsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUFyRUQsc0VBcUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvc2VtdmVyJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtmZXRjaExvbmdUZXJtU3VwcG9ydEJyYW5jaGVzRnJvbU5wbSwgTHRzQnJhbmNofSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2xvbmctdGVybS1zdXBwb3J0JztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgbmV3IHBhdGNoIHJlbGVhc2UgZm9yIGFuIGFjdGl2ZSByZWxlYXNlLXRyYWluIGluIHRoZSBsb25nLXRlcm1cbiAqIHN1cHBvcnQgcGhhc2UuIFRoZSBwYXRjaCBzZWdtZW50IGlzIGluY3JlbWVudGVkLiBUaGUgY2hhbmdlbG9nIGlzIGdlbmVyYXRlZCBmb3IgdGhlIG5ld1xuICogcGF0Y2ggdmVyc2lvbiwgYnV0IGFsc28gbmVlZHMgdG8gYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSBuZXh0IGRldmVsb3BtZW50IGJyYW5jaC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dExvbmdUZXJtU3VwcG9ydFBhdGNoQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIC8qKiBQcm9taXNlIHJlc29sdmluZyBhbiBvYmplY3QgZGVzY3JpYmluZyBsb25nLXRlcm0gc3VwcG9ydCBicmFuY2hlcy4gKi9cbiAgbHRzQnJhbmNoZXMgPSBmZXRjaExvbmdUZXJtU3VwcG9ydEJyYW5jaGVzRnJvbU5wbSh0aGlzLmNvbmZpZyk7XG5cbiAgb3ZlcnJpZGUgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2FjdGl2ZX0gPSBhd2FpdCB0aGlzLmx0c0JyYW5jaGVzO1xuICAgIHJldHVybiBgQ3V0IGEgbmV3IHJlbGVhc2UgZm9yIGFuIGFjdGl2ZSBMVFMgYnJhbmNoICgke2FjdGl2ZS5sZW5ndGh9IGFjdGl2ZSkuYDtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3QgbHRzQnJhbmNoID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yVGFyZ2V0THRzQnJhbmNoKCk7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHNlbXZlckluYyhsdHNCcmFuY2gudmVyc2lvbiwgJ3BhdGNoJyk7XG4gICAgY29uc3QgY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMgPSBsdHNCcmFuY2gudmVyc2lvbjtcblxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdCwgcmVsZWFzZU5vdGVzfSA9IGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24oXG4gICAgICBuZXdWZXJzaW9uLFxuICAgICAgY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMsXG4gICAgICBsdHNCcmFuY2gubmFtZSxcbiAgICApO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHB1bGxSZXF1ZXN0KTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIGx0c0JyYW5jaC5uYW1lLCBsdHNCcmFuY2gubnBtRGlzdFRhZyk7XG4gICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gocmVsZWFzZU5vdGVzLCBsdHNCcmFuY2gubmFtZSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgdXNlciB0byBzZWxlY3QgYW4gTFRTIGJyYW5jaCBmb3Igd2hpY2ggYSBwYXRjaCBzaG91bGQgYnV0IGN1dC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yVGFyZ2V0THRzQnJhbmNoKCk6IFByb21pc2U8THRzQnJhbmNoPiB7XG4gICAgY29uc3Qge2FjdGl2ZSwgaW5hY3RpdmV9ID0gYXdhaXQgdGhpcy5sdHNCcmFuY2hlcztcbiAgICBjb25zdCBhY3RpdmVCcmFuY2hDaG9pY2VzID0gYWN0aXZlLm1hcCgoYnJhbmNoKSA9PiB0aGlzLl9nZXRDaG9pY2VGb3JMdHNCcmFuY2goYnJhbmNoKSk7XG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgaW5hY3RpdmUgTFRTIGJyYW5jaGVzLCB3ZSBhbGxvdyB0aGVtIHRvIGJlIHNlbGVjdGVkLiBJbiBzb21lIHNpdHVhdGlvbnMsXG4gICAgLy8gcGF0Y2ggcmVsZWFzZXMgYXJlIHN0aWxsIGN1dCBmb3IgaW5hY3RpdmUgTFRTIGJyYW5jaGVzLiBlLmcuIHdoZW4gdGhlIExUUyBkdXJhdGlvblxuICAgIC8vIGhhcyBiZWVuIGluY3JlYXNlZCBkdWUgdG8gZXhjZXB0aW9uYWwgZXZlbnRzICgpXG4gICAgaWYgKGluYWN0aXZlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgYWN0aXZlQnJhbmNoQ2hvaWNlcy5wdXNoKHtuYW1lOiAnSW5hY3RpdmUgTFRTIHZlcnNpb25zIChub3QgcmVjb21tZW5kZWQpJywgdmFsdWU6IG51bGx9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7YWN0aXZlTHRzQnJhbmNoLCBpbmFjdGl2ZUx0c0JyYW5jaH0gPSBhd2FpdCBwcm9tcHQ8e1xuICAgICAgYWN0aXZlTHRzQnJhbmNoOiBMdHNCcmFuY2ggfCBudWxsO1xuICAgICAgaW5hY3RpdmVMdHNCcmFuY2g6IEx0c0JyYW5jaDtcbiAgICB9PihbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdhY3RpdmVMdHNCcmFuY2gnLFxuICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGEgdmVyc2lvbiBmb3Igd2hpY2ggeW91IHdhbnQgdG8gY3V0IGFuIExUUyBwYXRjaCcsXG4gICAgICAgIGNob2ljZXM6IGFjdGl2ZUJyYW5jaENob2ljZXMsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnaW5hY3RpdmVMdHNCcmFuY2gnLFxuICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgIHdoZW46IChvKSA9PiBvLmFjdGl2ZUx0c0JyYW5jaCA9PT0gbnVsbCxcbiAgICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gaW5hY3RpdmUgTFRTIHZlcnNpb24gZm9yIHdoaWNoIHlvdSB3YW50IHRvIGN1dCBhbiBMVFMgcGF0Y2gnLFxuICAgICAgICBjaG9pY2VzOiBpbmFjdGl2ZS5tYXAoKGJyYW5jaCkgPT4gdGhpcy5fZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaCkpLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICByZXR1cm4gYWN0aXZlTHRzQnJhbmNoID8/IGluYWN0aXZlTHRzQnJhbmNoO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gaW5xdWlyZXIgY2hvaWNlIGZvciB0aGUgZ2l2ZW4gTFRTIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBfZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaDogTHRzQnJhbmNoKTogTGlzdENob2ljZU9wdGlvbnMge1xuICAgIHJldHVybiB7bmFtZTogYHYke2JyYW5jaC52ZXJzaW9uLm1ham9yfSAoZnJvbSAke2JyYW5jaC5uYW1lfSlgLCB2YWx1ZTogYnJhbmNofTtcbiAgfVxuXG4gIHN0YXRpYyBvdmVycmlkZSBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBMVFMgcGF0Y2ggdmVyc2lvbnMgY2FuIGJlIG9ubHkgY3V0IGlmIHRoZXJlIGFyZSByZWxlYXNlIHRyYWlucyBpbiBMVFMgcGhhc2UuXG4gICAgLy8gVGhpcyBhY3Rpb24gaXMgYWx3YXlzIHNlbGVjdGFibGUgYXMgd2Ugc3VwcG9ydCBwdWJsaXNoaW5nIG9mIG9sZCBMVFMgYnJhbmNoZXMsXG4gICAgLy8gYW5kIGhhdmUgcHJvbXB0IGZvciBzZWxlY3RpbmcgYW4gTFRTIGJyYW5jaCB3aGVuIHRoZSBhY3Rpb24gcGVyZm9ybXMuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==