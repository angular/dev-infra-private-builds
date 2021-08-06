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
        this.ltsBranches = long_term_support_1.fetchLongTermSupportBranchesFromNpm(this.config);
    }
    async getDescription() {
        const { active } = await this.ltsBranches;
        return `Cut a new release for an active LTS branch (${active.length} active).`;
    }
    async perform() {
        const ltsBranch = await this._promptForTargetLtsBranch();
        const newVersion = semver_1.semverInc(ltsBranch.version, 'patch');
        const { pullRequest, releaseNotes } = await this.checkoutBranchAndStageVersion(newVersion, ltsBranch.name);
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
        const { activeLtsBranch, inactiveLtsBranch } = await inquirer_1.prompt([
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LWx0cy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbHRzLXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUFtRDtBQUVuRCxrREFBZ0Q7QUFFaEQsMEVBQWtHO0FBQ2xHLHdDQUF5QztBQUV6Qzs7OztHQUlHO0FBQ0gsTUFBYSw2QkFBOEIsU0FBUSx1QkFBYTtJQUFoRTs7UUFDRSx5RUFBeUU7UUFDekUsZ0JBQVcsR0FBRyx1REFBbUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFnRWpFLENBQUM7SUE5RFUsS0FBSyxDQUFDLGNBQWM7UUFDM0IsTUFBTSxFQUFDLE1BQU0sRUFBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN4QyxPQUFPLCtDQUErQyxNQUFNLENBQUMsTUFBTSxXQUFXLENBQUM7SUFDakYsQ0FBQztJQUVRLEtBQUssQ0FBQyxPQUFPO1FBQ3BCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDekQsTUFBTSxVQUFVLEdBQUcsa0JBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELE1BQU0sRUFBQyxXQUFXLEVBQUUsWUFBWSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQzFFLFVBQVUsRUFDVixTQUFTLENBQUMsSUFBSSxDQUNmLENBQUM7UUFFRixNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELGlGQUFpRjtJQUN6RSxLQUFLLENBQUMseUJBQXlCO1FBQ3JDLE1BQU0sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2xELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFeEYsd0ZBQXdGO1FBQ3hGLHFGQUFxRjtRQUNyRixrREFBa0Q7UUFDbEQsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN6QixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUseUNBQXlDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7U0FDMUY7UUFFRCxNQUFNLEVBQUMsZUFBZSxFQUFFLGlCQUFpQixFQUFDLEdBQUcsTUFBTSxpQkFBTSxDQUd0RDtZQUNEO2dCQUNFLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxnRUFBZ0U7Z0JBQ3pFLE9BQU8sRUFBRSxtQkFBbUI7YUFDN0I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEtBQUssSUFBSTtnQkFDdkMsT0FBTyxFQUFFLDhFQUE4RTtnQkFDdkYsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN2RTtTQUNGLENBQUMsQ0FBQztRQUNILE9BQU8sZUFBZSxJQUFJLGlCQUFpQixDQUFDO0lBQzlDLENBQUM7SUFFRCx3REFBd0Q7SUFDaEQsc0JBQXNCLENBQUMsTUFBaUI7UUFDOUMsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxVQUFVLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELE1BQU0sQ0FBVSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQTJCO1FBQ3hELCtFQUErRTtRQUMvRSxpRkFBaUY7UUFDakYsd0VBQXdFO1FBQ3hFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBbEVELHNFQWtFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtzZW12ZXJJbmN9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3NlbXZlcic7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7ZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0sIEx0c0JyYW5jaH0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY3V0cyBhIG5ldyBwYXRjaCByZWxlYXNlIGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbG9uZy10ZXJtXG4gKiBzdXBwb3J0IHBoYXNlLiBUaGUgcGF0Y2ggc2VnbWVudCBpcyBpbmNyZW1lbnRlZC4gVGhlIGNoYW5nZWxvZyBpcyBnZW5lcmF0ZWQgZm9yIHRoZSBuZXdcbiAqIHBhdGNoIHZlcnNpb24sIGJ1dCBhbHNvIG5lZWRzIHRvIGJlIGNoZXJyeS1waWNrZWQgaW50byB0aGUgbmV4dCBkZXZlbG9wbWVudCBicmFuY2guXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXRMb25nVGVybVN1cHBvcnRQYXRjaEFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogUHJvbWlzZSByZXNvbHZpbmcgYW4gb2JqZWN0IGRlc2NyaWJpbmcgbG9uZy10ZXJtIHN1cHBvcnQgYnJhbmNoZXMuICovXG4gIGx0c0JyYW5jaGVzID0gZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0odGhpcy5jb25maWcpO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHthY3RpdmV9ID0gYXdhaXQgdGhpcy5sdHNCcmFuY2hlcztcbiAgICByZXR1cm4gYEN1dCBhIG5ldyByZWxlYXNlIGZvciBhbiBhY3RpdmUgTFRTIGJyYW5jaCAoJHthY3RpdmUubGVuZ3RofSBhY3RpdmUpLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IGx0c0JyYW5jaCA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclRhcmdldEx0c0JyYW5jaCgpO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBzZW12ZXJJbmMobHRzQnJhbmNoLnZlcnNpb24sICdwYXRjaCcpO1xuICAgIGNvbnN0IHtwdWxsUmVxdWVzdCwgcmVsZWFzZU5vdGVzfSA9IGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24oXG4gICAgICBuZXdWZXJzaW9uLFxuICAgICAgbHRzQnJhbmNoLm5hbWUsXG4gICAgKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBsdHNCcmFuY2gubmFtZSwgbHRzQnJhbmNoLm5wbURpc3RUYWcpO1xuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgbHRzQnJhbmNoLm5hbWUpO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIHVzZXIgdG8gc2VsZWN0IGFuIExUUyBicmFuY2ggZm9yIHdoaWNoIGEgcGF0Y2ggc2hvdWxkIGJ1dCBjdXQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclRhcmdldEx0c0JyYW5jaCgpOiBQcm9taXNlPEx0c0JyYW5jaD4ge1xuICAgIGNvbnN0IHthY3RpdmUsIGluYWN0aXZlfSA9IGF3YWl0IHRoaXMubHRzQnJhbmNoZXM7XG4gICAgY29uc3QgYWN0aXZlQnJhbmNoQ2hvaWNlcyA9IGFjdGl2ZS5tYXAoKGJyYW5jaCkgPT4gdGhpcy5fZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaCkpO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIGluYWN0aXZlIExUUyBicmFuY2hlcywgd2UgYWxsb3cgdGhlbSB0byBiZSBzZWxlY3RlZC4gSW4gc29tZSBzaXR1YXRpb25zLFxuICAgIC8vIHBhdGNoIHJlbGVhc2VzIGFyZSBzdGlsbCBjdXQgZm9yIGluYWN0aXZlIExUUyBicmFuY2hlcy4gZS5nLiB3aGVuIHRoZSBMVFMgZHVyYXRpb25cbiAgICAvLyBoYXMgYmVlbiBpbmNyZWFzZWQgZHVlIHRvIGV4Y2VwdGlvbmFsIGV2ZW50cyAoKVxuICAgIGlmIChpbmFjdGl2ZS5sZW5ndGggIT09IDApIHtcbiAgICAgIGFjdGl2ZUJyYW5jaENob2ljZXMucHVzaCh7bmFtZTogJ0luYWN0aXZlIExUUyB2ZXJzaW9ucyAobm90IHJlY29tbWVuZGVkKScsIHZhbHVlOiBudWxsfSk7XG4gICAgfVxuXG4gICAgY29uc3Qge2FjdGl2ZUx0c0JyYW5jaCwgaW5hY3RpdmVMdHNCcmFuY2h9ID0gYXdhaXQgcHJvbXB0PHtcbiAgICAgIGFjdGl2ZUx0c0JyYW5jaDogTHRzQnJhbmNoIHwgbnVsbDtcbiAgICAgIGluYWN0aXZlTHRzQnJhbmNoOiBMdHNCcmFuY2g7XG4gICAgfT4oW1xuICAgICAge1xuICAgICAgICBuYW1lOiAnYWN0aXZlTHRzQnJhbmNoJyxcbiAgICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhIHZlcnNpb24gZm9yIHdoaWNoIHlvdSB3YW50IHRvIGN1dCBhbiBMVFMgcGF0Y2gnLFxuICAgICAgICBjaG9pY2VzOiBhY3RpdmVCcmFuY2hDaG9pY2VzLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2luYWN0aXZlTHRzQnJhbmNoJyxcbiAgICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgICB3aGVuOiAobykgPT4gby5hY3RpdmVMdHNCcmFuY2ggPT09IG51bGwsXG4gICAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGFuIGluYWN0aXZlIExUUyB2ZXJzaW9uIGZvciB3aGljaCB5b3Ugd2FudCB0byBjdXQgYW4gTFRTIHBhdGNoJyxcbiAgICAgICAgY2hvaWNlczogaW5hY3RpdmUubWFwKChicmFuY2gpID0+IHRoaXMuX2dldENob2ljZUZvckx0c0JyYW5jaChicmFuY2gpKSxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgcmV0dXJuIGFjdGl2ZUx0c0JyYW5jaCA/PyBpbmFjdGl2ZUx0c0JyYW5jaDtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIGlucXVpcmVyIGNob2ljZSBmb3IgdGhlIGdpdmVuIExUUyBicmFuY2guICovXG4gIHByaXZhdGUgX2dldENob2ljZUZvckx0c0JyYW5jaChicmFuY2g6IEx0c0JyYW5jaCk6IExpc3RDaG9pY2VPcHRpb25zIHtcbiAgICByZXR1cm4ge25hbWU6IGB2JHticmFuY2gudmVyc2lvbi5tYWpvcn0gKGZyb20gJHticmFuY2gubmFtZX0pYCwgdmFsdWU6IGJyYW5jaH07XG4gIH1cblxuICBzdGF0aWMgb3ZlcnJpZGUgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gTFRTIHBhdGNoIHZlcnNpb25zIGNhbiBiZSBvbmx5IGN1dCBpZiB0aGVyZSBhcmUgcmVsZWFzZSB0cmFpbnMgaW4gTFRTIHBoYXNlLlxuICAgIC8vIFRoaXMgYWN0aW9uIGlzIGFsd2F5cyBzZWxlY3RhYmxlIGFzIHdlIHN1cHBvcnQgcHVibGlzaGluZyBvZiBvbGQgTFRTIGJyYW5jaGVzLFxuICAgIC8vIGFuZCBoYXZlIHByb21wdCBmb3Igc2VsZWN0aW5nIGFuIExUUyBicmFuY2ggd2hlbiB0aGUgYWN0aW9uIHBlcmZvcm1zLlxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=