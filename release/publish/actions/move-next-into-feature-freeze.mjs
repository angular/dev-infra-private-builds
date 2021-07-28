/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { BranchOffNextBranchBaseAction } from './branch-off-next-branch';
/**
 * Release action that moves the next release-train into the feature-freeze phase. This means
 * that a new version branch is created from the next branch, and a new next pre-release is
 * cut indicating the started feature-freeze.
 */
export class MoveNextIntoFeatureFreezeAction extends BranchOffNextBranchBaseAction {
    constructor() {
        super(...arguments);
        this.newPhaseName = 'feature-freeze';
    }
    static isActive(active) {
        return __awaiter(this, void 0, void 0, function* () {
            // A new feature-freeze branch can only be created if there is no active
            // release-train in feature-freeze/release-candidate phase and the version
            // currently in the `next` branch is for a major. The feature-freeze phase
            // is not foreseen for minor versions.
            return active.releaseCandidate === null && active.next.isMajor;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvbW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUlILE9BQU8sRUFBQyw2QkFBNkIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBRXZFOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sK0JBQWdDLFNBQVEsNkJBQTZCO0lBQWxGOztRQUNXLGlCQUFZLEdBQUcsZ0JBQXlCLENBQUM7SUFTcEQsQ0FBQztJQVBDLE1BQU0sQ0FBZ0IsUUFBUSxDQUFDLE1BQTJCOztZQUN4RCx3RUFBd0U7WUFDeEUsMEVBQTBFO1lBQzFFLDBFQUEwRTtZQUMxRSxzQ0FBc0M7WUFDdEMsT0FBTyxNQUFNLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2pFLENBQUM7S0FBQTtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZyc7XG5cbmltcG9ydCB7QnJhbmNoT2ZmTmV4dEJyYW5jaEJhc2VBY3Rpb259IGZyb20gJy4vYnJhbmNoLW9mZi1uZXh0LWJyYW5jaCc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBtb3ZlcyB0aGUgbmV4dCByZWxlYXNlLXRyYWluIGludG8gdGhlIGZlYXR1cmUtZnJlZXplIHBoYXNlLiBUaGlzIG1lYW5zXG4gKiB0aGF0IGEgbmV3IHZlcnNpb24gYnJhbmNoIGlzIGNyZWF0ZWQgZnJvbSB0aGUgbmV4dCBicmFuY2gsIGFuZCBhIG5ldyBuZXh0IHByZS1yZWxlYXNlIGlzXG4gKiBjdXQgaW5kaWNhdGluZyB0aGUgc3RhcnRlZCBmZWF0dXJlLWZyZWV6ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdmVOZXh0SW50b0ZlYXR1cmVGcmVlemVBY3Rpb24gZXh0ZW5kcyBCcmFuY2hPZmZOZXh0QnJhbmNoQmFzZUFjdGlvbiB7XG4gIG92ZXJyaWRlIG5ld1BoYXNlTmFtZSA9ICdmZWF0dXJlLWZyZWV6ZScgYXMgY29uc3Q7XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgbmV3IGZlYXR1cmUtZnJlZXplIGJyYW5jaCBjYW4gb25seSBiZSBjcmVhdGVkIGlmIHRoZXJlIGlzIG5vIGFjdGl2ZVxuICAgIC8vIHJlbGVhc2UtdHJhaW4gaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UgYW5kIHRoZSB2ZXJzaW9uXG4gICAgLy8gY3VycmVudGx5IGluIHRoZSBgbmV4dGAgYnJhbmNoIGlzIGZvciBhIG1ham9yLiBUaGUgZmVhdHVyZS1mcmVlemUgcGhhc2VcbiAgICAvLyBpcyBub3QgZm9yZXNlZW4gZm9yIG1pbm9yIHZlcnNpb25zLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbCAmJiBhY3RpdmUubmV4dC5pc01ham9yO1xuICB9XG59XG4iXX0=