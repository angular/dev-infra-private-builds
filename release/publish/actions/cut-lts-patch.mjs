/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { prompt } from 'inquirer';
import { semverInc } from '../../versioning/inc-semver';
import { fetchLongTermSupportBranchesFromNpm } from '../../versioning/long-term-support';
import { ReleaseAction } from '../actions';
/**
 * Release action that cuts a new patch release for an active release-train in the long-term
 * support phase. The patch segment is incremented. The changelog is generated for the new
 * patch version, but also needs to be cherry-picked into the next development branch.
 */
export class CutLongTermSupportPatchAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        /** Promise resolving an object describing long-term support branches. */
        this.ltsBranches = fetchLongTermSupportBranchesFromNpm(this.config);
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const { active } = yield this.ltsBranches;
            return `Cut a new release for an active LTS branch (${active.length} active).`;
        });
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const ltsBranch = yield this._promptForTargetLtsBranch();
            const newVersion = semverInc(ltsBranch.version, 'patch');
            const { pullRequest, releaseNotes } = yield this.checkoutBranchAndStageVersion(newVersion, ltsBranch.name);
            yield this.waitForPullRequestToBeMerged(pullRequest);
            yield this.buildAndPublish(releaseNotes, ltsBranch.name, ltsBranch.npmDistTag);
            yield this.cherryPickChangelogIntoNextBranch(releaseNotes, ltsBranch.name);
        });
    }
    /** Prompts the user to select an LTS branch for which a patch should but cut. */
    _promptForTargetLtsBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            const { active, inactive } = yield this.ltsBranches;
            const activeBranchChoices = active.map(branch => this._getChoiceForLtsBranch(branch));
            // If there are inactive LTS branches, we allow them to be selected. In some situations,
            // patch releases are still cut for inactive LTS branches. e.g. when the LTS duration
            // has been increased due to exceptional events ()
            if (inactive.length !== 0) {
                activeBranchChoices.push({ name: 'Inactive LTS versions (not recommended)', value: null });
            }
            const { activeLtsBranch, inactiveLtsBranch } = yield prompt([
                {
                    name: 'activeLtsBranch',
                    type: 'list',
                    message: 'Please select a version for which you want to cut an LTS patch',
                    choices: activeBranchChoices,
                },
                {
                    name: 'inactiveLtsBranch',
                    type: 'list',
                    when: o => o.activeLtsBranch === null,
                    message: 'Please select an inactive LTS version for which you want to cut an LTS patch',
                    choices: inactive.map(branch => this._getChoiceForLtsBranch(branch)),
                }
            ]);
            return activeLtsBranch !== null && activeLtsBranch !== void 0 ? activeLtsBranch : inactiveLtsBranch;
        });
    }
    /** Gets an inquirer choice for the given LTS branch. */
    _getChoiceForLtsBranch(branch) {
        return { name: `v${branch.version.major} (from ${branch.name})`, value: branch };
    }
    static isActive(active) {
        return __awaiter(this, void 0, void 0, function* () {
            // LTS patch versions can be only cut if there are release trains in LTS phase.
            // This action is always selectable as we support publishing of old LTS branches,
            // and have prompt for selecting an LTS branch when the action performs.
            return true;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LWx0cy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbHRzLXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQW9CLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUduRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEQsT0FBTyxFQUFDLG1DQUFtQyxFQUFZLE1BQU0sb0NBQW9DLENBQUM7QUFDbEcsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV6Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLDZCQUE4QixTQUFRLGFBQWE7SUFBaEU7O1FBQ0UseUVBQXlFO1FBQ3pFLGdCQUFXLEdBQUcsbUNBQW1DLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBNERqRSxDQUFDO0lBMURnQixjQUFjOztZQUMzQixNQUFNLEVBQUMsTUFBTSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3hDLE9BQU8sK0NBQStDLE1BQU0sQ0FBQyxNQUFNLFdBQVcsQ0FBQztRQUNqRixDQUFDO0tBQUE7SUFFYyxPQUFPOztZQUNwQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ3pELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pELE1BQU0sRUFBQyxXQUFXLEVBQUUsWUFBWSxFQUFDLEdBQzdCLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFekUsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckQsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvRSxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdFLENBQUM7S0FBQTtJQUVELGlGQUFpRjtJQUNuRSx5QkFBeUI7O1lBQ3JDLE1BQU0sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2xELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXRGLHdGQUF3RjtZQUN4RixxRkFBcUY7WUFDckYsa0RBQWtEO1lBQ2xELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSx5Q0FBeUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzthQUMxRjtZQUVELE1BQU0sRUFBQyxlQUFlLEVBQUUsaUJBQWlCLEVBQUMsR0FDdEMsTUFBTSxNQUFNLENBQW9FO2dCQUM5RTtvQkFDRSxJQUFJLEVBQUUsaUJBQWlCO29CQUN2QixJQUFJLEVBQUUsTUFBTTtvQkFDWixPQUFPLEVBQUUsZ0VBQWdFO29CQUN6RSxPQUFPLEVBQUUsbUJBQW1CO2lCQUM3QjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsbUJBQW1CO29CQUN6QixJQUFJLEVBQUUsTUFBTTtvQkFDWixJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBZSxLQUFLLElBQUk7b0JBQ3JDLE9BQU8sRUFBRSw4RUFBOEU7b0JBQ3ZGLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNyRTthQUNGLENBQUMsQ0FBQztZQUNQLE9BQU8sZUFBZSxhQUFmLGVBQWUsY0FBZixlQUFlLEdBQUksaUJBQWlCLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUQsd0RBQXdEO0lBQ2hELHNCQUFzQixDQUFDLE1BQWlCO1FBQzlDLE9BQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxNQUFNLENBQWdCLFFBQVEsQ0FBQyxNQUEyQjs7WUFDeEQsK0VBQStFO1lBQy9FLGlGQUFpRjtZQUNqRix3RUFBd0U7WUFDeEUsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9pbmMtc2VtdmVyJztcbmltcG9ydCB7ZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0sIEx0c0JyYW5jaH0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY3V0cyBhIG5ldyBwYXRjaCByZWxlYXNlIGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbG9uZy10ZXJtXG4gKiBzdXBwb3J0IHBoYXNlLiBUaGUgcGF0Y2ggc2VnbWVudCBpcyBpbmNyZW1lbnRlZC4gVGhlIGNoYW5nZWxvZyBpcyBnZW5lcmF0ZWQgZm9yIHRoZSBuZXdcbiAqIHBhdGNoIHZlcnNpb24sIGJ1dCBhbHNvIG5lZWRzIHRvIGJlIGNoZXJyeS1waWNrZWQgaW50byB0aGUgbmV4dCBkZXZlbG9wbWVudCBicmFuY2guXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXRMb25nVGVybVN1cHBvcnRQYXRjaEFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogUHJvbWlzZSByZXNvbHZpbmcgYW4gb2JqZWN0IGRlc2NyaWJpbmcgbG9uZy10ZXJtIHN1cHBvcnQgYnJhbmNoZXMuICovXG4gIGx0c0JyYW5jaGVzID0gZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0odGhpcy5jb25maWcpO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHthY3RpdmV9ID0gYXdhaXQgdGhpcy5sdHNCcmFuY2hlcztcbiAgICByZXR1cm4gYEN1dCBhIG5ldyByZWxlYXNlIGZvciBhbiBhY3RpdmUgTFRTIGJyYW5jaCAoJHthY3RpdmUubGVuZ3RofSBhY3RpdmUpLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IGx0c0JyYW5jaCA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclRhcmdldEx0c0JyYW5jaCgpO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBzZW12ZXJJbmMobHRzQnJhbmNoLnZlcnNpb24sICdwYXRjaCcpO1xuICAgIGNvbnN0IHtwdWxsUmVxdWVzdCwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgbHRzQnJhbmNoLm5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHB1bGxSZXF1ZXN0KTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIGx0c0JyYW5jaC5uYW1lLCBsdHNCcmFuY2gubnBtRGlzdFRhZyk7XG4gICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gocmVsZWFzZU5vdGVzLCBsdHNCcmFuY2gubmFtZSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgdXNlciB0byBzZWxlY3QgYW4gTFRTIGJyYW5jaCBmb3Igd2hpY2ggYSBwYXRjaCBzaG91bGQgYnV0IGN1dC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yVGFyZ2V0THRzQnJhbmNoKCk6IFByb21pc2U8THRzQnJhbmNoPiB7XG4gICAgY29uc3Qge2FjdGl2ZSwgaW5hY3RpdmV9ID0gYXdhaXQgdGhpcy5sdHNCcmFuY2hlcztcbiAgICBjb25zdCBhY3RpdmVCcmFuY2hDaG9pY2VzID0gYWN0aXZlLm1hcChicmFuY2ggPT4gdGhpcy5fZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaCkpO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIGluYWN0aXZlIExUUyBicmFuY2hlcywgd2UgYWxsb3cgdGhlbSB0byBiZSBzZWxlY3RlZC4gSW4gc29tZSBzaXR1YXRpb25zLFxuICAgIC8vIHBhdGNoIHJlbGVhc2VzIGFyZSBzdGlsbCBjdXQgZm9yIGluYWN0aXZlIExUUyBicmFuY2hlcy4gZS5nLiB3aGVuIHRoZSBMVFMgZHVyYXRpb25cbiAgICAvLyBoYXMgYmVlbiBpbmNyZWFzZWQgZHVlIHRvIGV4Y2VwdGlvbmFsIGV2ZW50cyAoKVxuICAgIGlmIChpbmFjdGl2ZS5sZW5ndGggIT09IDApIHtcbiAgICAgIGFjdGl2ZUJyYW5jaENob2ljZXMucHVzaCh7bmFtZTogJ0luYWN0aXZlIExUUyB2ZXJzaW9ucyAobm90IHJlY29tbWVuZGVkKScsIHZhbHVlOiBudWxsfSk7XG4gICAgfVxuXG4gICAgY29uc3Qge2FjdGl2ZUx0c0JyYW5jaCwgaW5hY3RpdmVMdHNCcmFuY2h9ID1cbiAgICAgICAgYXdhaXQgcHJvbXB0PHthY3RpdmVMdHNCcmFuY2g6IEx0c0JyYW5jaCB8IG51bGwsIGluYWN0aXZlTHRzQnJhbmNoOiBMdHNCcmFuY2h9PihbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2FjdGl2ZUx0c0JyYW5jaCcsXG4gICAgICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhIHZlcnNpb24gZm9yIHdoaWNoIHlvdSB3YW50IHRvIGN1dCBhbiBMVFMgcGF0Y2gnLFxuICAgICAgICAgICAgY2hvaWNlczogYWN0aXZlQnJhbmNoQ2hvaWNlcyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdpbmFjdGl2ZUx0c0JyYW5jaCcsXG4gICAgICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgICAgICB3aGVuOiBvID0+IG8uYWN0aXZlTHRzQnJhbmNoID09PSBudWxsLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gaW5hY3RpdmUgTFRTIHZlcnNpb24gZm9yIHdoaWNoIHlvdSB3YW50IHRvIGN1dCBhbiBMVFMgcGF0Y2gnLFxuICAgICAgICAgICAgY2hvaWNlczogaW5hY3RpdmUubWFwKGJyYW5jaCA9PiB0aGlzLl9nZXRDaG9pY2VGb3JMdHNCcmFuY2goYnJhbmNoKSksXG4gICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICByZXR1cm4gYWN0aXZlTHRzQnJhbmNoID8/IGluYWN0aXZlTHRzQnJhbmNoO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gaW5xdWlyZXIgY2hvaWNlIGZvciB0aGUgZ2l2ZW4gTFRTIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBfZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaDogTHRzQnJhbmNoKTogTGlzdENob2ljZU9wdGlvbnMge1xuICAgIHJldHVybiB7bmFtZTogYHYke2JyYW5jaC52ZXJzaW9uLm1ham9yfSAoZnJvbSAke2JyYW5jaC5uYW1lfSlgLCB2YWx1ZTogYnJhbmNofTtcbiAgfVxuXG4gIHN0YXRpYyBvdmVycmlkZSBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBMVFMgcGF0Y2ggdmVyc2lvbnMgY2FuIGJlIG9ubHkgY3V0IGlmIHRoZXJlIGFyZSByZWxlYXNlIHRyYWlucyBpbiBMVFMgcGhhc2UuXG4gICAgLy8gVGhpcyBhY3Rpb24gaXMgYWx3YXlzIHNlbGVjdGFibGUgYXMgd2Ugc3VwcG9ydCBwdWJsaXNoaW5nIG9mIG9sZCBMVFMgYnJhbmNoZXMsXG4gICAgLy8gYW5kIGhhdmUgcHJvbXB0IGZvciBzZWxlY3RpbmcgYW4gTFRTIGJyYW5jaCB3aGVuIHRoZSBhY3Rpb24gcGVyZm9ybXMuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==