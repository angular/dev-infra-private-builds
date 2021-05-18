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
            const { pullRequest: { id }, releaseNotes } = yield this.checkoutBranchAndStageVersion(newVersion, ltsBranch.name);
            yield this.waitForPullRequestToBeMerged(id);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LWx0cy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbHRzLXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQW9CLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUduRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEQsT0FBTyxFQUFDLG1DQUFtQyxFQUFZLE1BQU0sb0NBQW9DLENBQUM7QUFDbEcsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV6Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLDZCQUE4QixTQUFRLGFBQWE7SUFBaEU7O1FBQ0UseUVBQXlFO1FBQ3pFLGdCQUFXLEdBQUcsbUNBQW1DLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBNERqRSxDQUFDO0lBMURPLGNBQWM7O1lBQ2xCLE1BQU0sRUFBQyxNQUFNLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDeEMsT0FBTywrQ0FBK0MsTUFBTSxDQUFDLE1BQU0sV0FBVyxDQUFDO1FBQ2pGLENBQUM7S0FBQTtJQUVLLE9BQU87O1lBQ1gsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUN6RCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6RCxNQUFNLEVBQUMsV0FBVyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsWUFBWSxFQUFDLEdBQ25DLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFekUsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvRSxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdFLENBQUM7S0FBQTtJQUVELGlGQUFpRjtJQUNuRSx5QkFBeUI7O1lBQ3JDLE1BQU0sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2xELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXRGLHdGQUF3RjtZQUN4RixxRkFBcUY7WUFDckYsa0RBQWtEO1lBQ2xELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSx5Q0FBeUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzthQUMxRjtZQUVELE1BQU0sRUFBQyxlQUFlLEVBQUUsaUJBQWlCLEVBQUMsR0FDdEMsTUFBTSxNQUFNLENBQW9FO2dCQUM5RTtvQkFDRSxJQUFJLEVBQUUsaUJBQWlCO29CQUN2QixJQUFJLEVBQUUsTUFBTTtvQkFDWixPQUFPLEVBQUUsZ0VBQWdFO29CQUN6RSxPQUFPLEVBQUUsbUJBQW1CO2lCQUM3QjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsbUJBQW1CO29CQUN6QixJQUFJLEVBQUUsTUFBTTtvQkFDWixJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBZSxLQUFLLElBQUk7b0JBQ3JDLE9BQU8sRUFBRSw4RUFBOEU7b0JBQ3ZGLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNyRTthQUNGLENBQUMsQ0FBQztZQUNQLE9BQU8sZUFBZSxhQUFmLGVBQWUsY0FBZixlQUFlLEdBQUksaUJBQWlCLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUQsd0RBQXdEO0lBQ2hELHNCQUFzQixDQUFDLE1BQWlCO1FBQzlDLE9BQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxNQUFNLENBQU8sUUFBUSxDQUFDLE1BQTJCOztZQUMvQywrRUFBK0U7WUFDL0UsaUZBQWlGO1lBQ2pGLHdFQUF3RTtZQUN4RSxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7S0FBQTtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2luYy1zZW12ZXInO1xuaW1wb3J0IHtmZXRjaExvbmdUZXJtU3VwcG9ydEJyYW5jaGVzRnJvbU5wbSwgTHRzQnJhbmNofSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2xvbmctdGVybS1zdXBwb3J0JztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgbmV3IHBhdGNoIHJlbGVhc2UgZm9yIGFuIGFjdGl2ZSByZWxlYXNlLXRyYWluIGluIHRoZSBsb25nLXRlcm1cbiAqIHN1cHBvcnQgcGhhc2UuIFRoZSBwYXRjaCBzZWdtZW50IGlzIGluY3JlbWVudGVkLiBUaGUgY2hhbmdlbG9nIGlzIGdlbmVyYXRlZCBmb3IgdGhlIG5ld1xuICogcGF0Y2ggdmVyc2lvbiwgYnV0IGFsc28gbmVlZHMgdG8gYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSBuZXh0IGRldmVsb3BtZW50IGJyYW5jaC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dExvbmdUZXJtU3VwcG9ydFBhdGNoQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIC8qKiBQcm9taXNlIHJlc29sdmluZyBhbiBvYmplY3QgZGVzY3JpYmluZyBsb25nLXRlcm0gc3VwcG9ydCBicmFuY2hlcy4gKi9cbiAgbHRzQnJhbmNoZXMgPSBmZXRjaExvbmdUZXJtU3VwcG9ydEJyYW5jaGVzRnJvbU5wbSh0aGlzLmNvbmZpZyk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2FjdGl2ZX0gPSBhd2FpdCB0aGlzLmx0c0JyYW5jaGVzO1xuICAgIHJldHVybiBgQ3V0IGEgbmV3IHJlbGVhc2UgZm9yIGFuIGFjdGl2ZSBMVFMgYnJhbmNoICgke2FjdGl2ZS5sZW5ndGh9IGFjdGl2ZSkuYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3QgbHRzQnJhbmNoID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yVGFyZ2V0THRzQnJhbmNoKCk7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHNlbXZlckluYyhsdHNCcmFuY2gudmVyc2lvbiwgJ3BhdGNoJyk7XG4gICAgY29uc3Qge3B1bGxSZXF1ZXN0OiB7aWR9LCByZWxlYXNlTm90ZXN9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5jaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uLCBsdHNCcmFuY2gubmFtZSk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKHJlbGVhc2VOb3RlcywgbHRzQnJhbmNoLm5hbWUsIGx0c0JyYW5jaC5ucG1EaXN0VGFnKTtcbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChyZWxlYXNlTm90ZXMsIGx0c0JyYW5jaC5uYW1lKTtcbiAgfVxuXG4gIC8qKiBQcm9tcHRzIHRoZSB1c2VyIHRvIHNlbGVjdCBhbiBMVFMgYnJhbmNoIGZvciB3aGljaCBhIHBhdGNoIHNob3VsZCBidXQgY3V0LiAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRGb3JUYXJnZXRMdHNCcmFuY2goKTogUHJvbWlzZTxMdHNCcmFuY2g+IHtcbiAgICBjb25zdCB7YWN0aXZlLCBpbmFjdGl2ZX0gPSBhd2FpdCB0aGlzLmx0c0JyYW5jaGVzO1xuICAgIGNvbnN0IGFjdGl2ZUJyYW5jaENob2ljZXMgPSBhY3RpdmUubWFwKGJyYW5jaCA9PiB0aGlzLl9nZXRDaG9pY2VGb3JMdHNCcmFuY2goYnJhbmNoKSk7XG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgaW5hY3RpdmUgTFRTIGJyYW5jaGVzLCB3ZSBhbGxvdyB0aGVtIHRvIGJlIHNlbGVjdGVkLiBJbiBzb21lIHNpdHVhdGlvbnMsXG4gICAgLy8gcGF0Y2ggcmVsZWFzZXMgYXJlIHN0aWxsIGN1dCBmb3IgaW5hY3RpdmUgTFRTIGJyYW5jaGVzLiBlLmcuIHdoZW4gdGhlIExUUyBkdXJhdGlvblxuICAgIC8vIGhhcyBiZWVuIGluY3JlYXNlZCBkdWUgdG8gZXhjZXB0aW9uYWwgZXZlbnRzICgpXG4gICAgaWYgKGluYWN0aXZlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgYWN0aXZlQnJhbmNoQ2hvaWNlcy5wdXNoKHtuYW1lOiAnSW5hY3RpdmUgTFRTIHZlcnNpb25zIChub3QgcmVjb21tZW5kZWQpJywgdmFsdWU6IG51bGx9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7YWN0aXZlTHRzQnJhbmNoLCBpbmFjdGl2ZUx0c0JyYW5jaH0gPVxuICAgICAgICBhd2FpdCBwcm9tcHQ8e2FjdGl2ZUx0c0JyYW5jaDogTHRzQnJhbmNoIHwgbnVsbCwgaW5hY3RpdmVMdHNCcmFuY2g6IEx0c0JyYW5jaH0+KFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnYWN0aXZlTHRzQnJhbmNoJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGEgdmVyc2lvbiBmb3Igd2hpY2ggeW91IHdhbnQgdG8gY3V0IGFuIExUUyBwYXRjaCcsXG4gICAgICAgICAgICBjaG9pY2VzOiBhY3RpdmVCcmFuY2hDaG9pY2VzLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2luYWN0aXZlTHRzQnJhbmNoJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgICAgICAgIHdoZW46IG8gPT4gby5hY3RpdmVMdHNCcmFuY2ggPT09IG51bGwsXG4gICAgICAgICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhbiBpbmFjdGl2ZSBMVFMgdmVyc2lvbiBmb3Igd2hpY2ggeW91IHdhbnQgdG8gY3V0IGFuIExUUyBwYXRjaCcsXG4gICAgICAgICAgICBjaG9pY2VzOiBpbmFjdGl2ZS5tYXAoYnJhbmNoID0+IHRoaXMuX2dldENob2ljZUZvckx0c0JyYW5jaChicmFuY2gpKSxcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIHJldHVybiBhY3RpdmVMdHNCcmFuY2ggPz8gaW5hY3RpdmVMdHNCcmFuY2g7XG4gIH1cblxuICAvKiogR2V0cyBhbiBpbnF1aXJlciBjaG9pY2UgZm9yIHRoZSBnaXZlbiBMVFMgYnJhbmNoLiAqL1xuICBwcml2YXRlIF9nZXRDaG9pY2VGb3JMdHNCcmFuY2goYnJhbmNoOiBMdHNCcmFuY2gpOiBMaXN0Q2hvaWNlT3B0aW9ucyB7XG4gICAgcmV0dXJuIHtuYW1lOiBgdiR7YnJhbmNoLnZlcnNpb24ubWFqb3J9IChmcm9tICR7YnJhbmNoLm5hbWV9KWAsIHZhbHVlOiBicmFuY2h9O1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIExUUyBwYXRjaCB2ZXJzaW9ucyBjYW4gYmUgb25seSBjdXQgaWYgdGhlcmUgYXJlIHJlbGVhc2UgdHJhaW5zIGluIExUUyBwaGFzZS5cbiAgICAvLyBUaGlzIGFjdGlvbiBpcyBhbHdheXMgc2VsZWN0YWJsZSBhcyB3ZSBzdXBwb3J0IHB1Ymxpc2hpbmcgb2Ygb2xkIExUUyBicmFuY2hlcyxcbiAgICAvLyBhbmQgaGF2ZSBwcm9tcHQgZm9yIHNlbGVjdGluZyBhbiBMVFMgYnJhbmNoIHdoZW4gdGhlIGFjdGlvbiBwZXJmb3Jtcy5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19