/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as semver from 'semver';
/** Regular expression that matches version-branches. */
const versionBranchNameRegex = /^(\d+)\.(\d+)\.x$/;
/** Gets the version of a given branch by reading the `package.json` upstream. */
export function getVersionOfBranch(repo, branchName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield repo.api.repos.getContents({ owner: repo.owner, repo: repo.name, path: '/package.json', ref: branchName });
        const content = Array.isArray(data) ? '' : data.content || '';
        const { version } = JSON.parse(Buffer.from(content, 'base64').toString());
        const parsedVersion = semver.parse(version);
        if (parsedVersion === null) {
            throw Error(`Invalid version detected in following branch: ${branchName}.`);
        }
        return parsedVersion;
    });
}
/** Whether the given branch corresponds to a version branch. */
export function isVersionBranch(branchName) {
    return versionBranchNameRegex.test(branchName);
}
/**
 * Converts a given version-branch into a SemVer version that can be used with SemVer
 * utilities. e.g. to determine semantic order, extract major digit, compare.
 *
 * For example `10.0.x` will become `10.0.0` in SemVer. The patch digit is not
 * relevant but needed for parsing. SemVer does not allow `x` as patch digit.
 */
export function getVersionForVersionBranch(branchName) {
    return semver.parse(branchName.replace(versionBranchNameRegex, '$1.$2.0'));
}
/**
 * Gets the version branches for the specified major versions in descending
 * order. i.e. latest version branches first.
 */
export function getBranchesForMajorVersions(repo, majorVersions) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: branchData } = yield repo.api.repos.listBranches({ owner: repo.owner, repo: repo.name, protected: true });
        const branches = [];
        for (const { name } of branchData) {
            if (!isVersionBranch(name)) {
                continue;
            }
            // Convert the version-branch into a SemVer version that can be used with the
            // SemVer utilities. e.g. to determine semantic order, compare versions.
            const parsed = getVersionForVersionBranch(name);
            // Collect all version-branches that match the specified major versions.
            if (parsed !== null && majorVersions.includes(parsed.major)) {
                branches.push({ name, parsed });
            }
        }
        // Sort captured version-branches in descending order.
        return branches.sort((a, b) => semver.rcompare(a.parsed, b.parsed));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi1icmFuY2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFxQmpDLHdEQUF3RDtBQUN4RCxNQUFNLHNCQUFzQixHQUFHLG1CQUFtQixDQUFDO0FBRW5ELGlGQUFpRjtBQUNqRixNQUFNLFVBQWdCLGtCQUFrQixDQUNwQyxJQUF1QixFQUFFLFVBQWtCOztRQUM3QyxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzNDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztRQUNsRixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzlELE1BQU0sRUFBQyxPQUFPLEVBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUM3QixDQUFDO1FBQzFDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFO1lBQzFCLE1BQU0sS0FBSyxDQUFDLGlEQUFpRCxVQUFVLEdBQUcsQ0FBQyxDQUFDO1NBQzdFO1FBQ0QsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQztDQUFBO0FBRUQsZ0VBQWdFO0FBQ2hFLE1BQU0sVUFBVSxlQUFlLENBQUMsVUFBa0I7SUFDaEQsT0FBTyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSwwQkFBMEIsQ0FBQyxVQUFrQjtJQUMzRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzdFLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQWdCLDJCQUEyQixDQUM3QyxJQUF1QixFQUFFLGFBQXVCOztRQUNsRCxNQUFNLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyxHQUNwQixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzdGLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7UUFFckMsS0FBSyxNQUFNLEVBQUMsSUFBSSxFQUFDLElBQUksVUFBVSxFQUFFO1lBQy9CLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFCLFNBQVM7YUFDVjtZQUNELDZFQUE2RTtZQUM3RSx3RUFBd0U7WUFDeEUsTUFBTSxNQUFNLEdBQUcsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsd0VBQXdFO1lBQ3hFLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDM0QsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO2FBQy9CO1NBQ0Y7UUFFRCxzREFBc0Q7UUFDdEQsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7R2l0aHViQ2xpZW50LCBHaXRodWJSZXBvfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcblxuLyoqIFR5cGUgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5IHdpdGggY29ycmVzcG9uZGluZyBBUEkgY2xpZW50LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvV2l0aEFwaSBleHRlbmRzIEdpdGh1YlJlcG8ge1xuICAvKiogQVBJIGNsaWVudCB0aGF0IGNhbiBhY2Nlc3MgdGhlIHJlcG9zaXRvcnkuICovXG4gIGFwaTogR2l0aHViQ2xpZW50O1xufVxuXG4vKiogVHlwZSBkZXNjcmliaW5nIGEgdmVyc2lvbi1icmFuY2guICovXG5leHBvcnQgaW50ZXJmYWNlIFZlcnNpb25CcmFuY2gge1xuICAvKiogTmFtZSBvZiB0aGUgYnJhbmNoIGluIEdpdC4gZS5nLiBgMTAuMC54YC4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogUGFyc2VkIFNlbVZlciB2ZXJzaW9uIGZvciB0aGUgdmVyc2lvbi1icmFuY2guIFZlcnNpb24gYnJhbmNoZXMgdGVjaG5pY2FsbHkgZG9cbiAgICogbm90IGZvbGxvdyB0aGUgU2VtVmVyIGZvcm1hdCwgYnV0IHdlIGNhbiBoYXZlIHJlcHJlc2VudGF0aXZlIFNlbVZlciB2ZXJzaW9uc1xuICAgKiB0aGF0IGNhbiBiZSB1c2VkIGZvciBjb21wYXJpc29ucywgc29ydGluZyBhbmQgb3RoZXIgY2hlY2tzLlxuICAgKi9cbiAgcGFyc2VkOiBzZW12ZXIuU2VtVmVyO1xufVxuXG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB2ZXJzaW9uLWJyYW5jaGVzLiAqL1xuY29uc3QgdmVyc2lvbkJyYW5jaE5hbWVSZWdleCA9IC9eKFxcZCspXFwuKFxcZCspXFwueCQvO1xuXG4vKiogR2V0cyB0aGUgdmVyc2lvbiBvZiBhIGdpdmVuIGJyYW5jaCBieSByZWFkaW5nIHRoZSBgcGFja2FnZS5qc29uYCB1cHN0cmVhbS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWZXJzaW9uT2ZCcmFuY2goXG4gICAgcmVwbzogR2l0aHViUmVwb1dpdGhBcGksIGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8c2VtdmVyLlNlbVZlcj4ge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCByZXBvLmFwaS5yZXBvcy5nZXRDb250ZW50cyhcbiAgICAgIHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBwYXRoOiAnL3BhY2thZ2UuanNvbicsIHJlZjogYnJhbmNoTmFtZX0pO1xuICBjb25zdCBjb250ZW50ID0gQXJyYXkuaXNBcnJheShkYXRhKSA/ICcnIDogZGF0YS5jb250ZW50IHx8ICcnO1xuICBjb25zdCB7dmVyc2lvbn0gPSBKU09OLnBhcnNlKEJ1ZmZlci5mcm9tKGNvbnRlbnQsICdiYXNlNjQnKS50b1N0cmluZygpKSBhc1xuICAgICAge3ZlcnNpb246IHN0cmluZywgW2tleTogc3RyaW5nXTogYW55fTtcbiAgY29uc3QgcGFyc2VkVmVyc2lvbiA9IHNlbXZlci5wYXJzZSh2ZXJzaW9uKTtcbiAgaWYgKHBhcnNlZFZlcnNpb24gPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCB2ZXJzaW9uIGRldGVjdGVkIGluIGZvbGxvd2luZyBicmFuY2g6ICR7YnJhbmNoTmFtZX0uYCk7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZFZlcnNpb247XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29ycmVzcG9uZHMgdG8gYSB2ZXJzaW9uIGJyYW5jaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZlcnNpb25CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4LnRlc3QoYnJhbmNoTmFtZSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBnaXZlbiB2ZXJzaW9uLWJyYW5jaCBpbnRvIGEgU2VtVmVyIHZlcnNpb24gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIFNlbVZlclxuICogdXRpbGl0aWVzLiBlLmcuIHRvIGRldGVybWluZSBzZW1hbnRpYyBvcmRlciwgZXh0cmFjdCBtYWpvciBkaWdpdCwgY29tcGFyZS5cbiAqXG4gKiBGb3IgZXhhbXBsZSBgMTAuMC54YCB3aWxsIGJlY29tZSBgMTAuMC4wYCBpbiBTZW1WZXIuIFRoZSBwYXRjaCBkaWdpdCBpcyBub3RcbiAqIHJlbGV2YW50IGJ1dCBuZWVkZWQgZm9yIHBhcnNpbmcuIFNlbVZlciBkb2VzIG5vdCBhbGxvdyBgeGAgYXMgcGF0Y2ggZGlnaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJzaW9uRm9yVmVyc2lvbkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBzZW12ZXIuU2VtVmVyfG51bGwge1xuICByZXR1cm4gc2VtdmVyLnBhcnNlKGJyYW5jaE5hbWUucmVwbGFjZSh2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4LCAnJDEuJDIuMCcpKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB2ZXJzaW9uIGJyYW5jaGVzIGZvciB0aGUgc3BlY2lmaWVkIG1ham9yIHZlcnNpb25zIGluIGRlc2NlbmRpbmdcbiAqIG9yZGVyLiBpLmUuIGxhdGVzdCB2ZXJzaW9uIGJyYW5jaGVzIGZpcnN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QnJhbmNoZXNGb3JNYWpvclZlcnNpb25zKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCBtYWpvclZlcnNpb25zOiBudW1iZXJbXSk6IFByb21pc2U8VmVyc2lvbkJyYW5jaFtdPiB7XG4gIGNvbnN0IHtkYXRhOiBicmFuY2hEYXRhfSA9XG4gICAgICBhd2FpdCByZXBvLmFwaS5yZXBvcy5saXN0QnJhbmNoZXMoe293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIHByb3RlY3RlZDogdHJ1ZX0pO1xuICBjb25zdCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdID0gW107XG5cbiAgZm9yIChjb25zdCB7bmFtZX0gb2YgYnJhbmNoRGF0YSkge1xuICAgIGlmICghaXNWZXJzaW9uQnJhbmNoKG5hbWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gQ29udmVydCB0aGUgdmVyc2lvbi1icmFuY2ggaW50byBhIFNlbVZlciB2ZXJzaW9uIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCB0aGVcbiAgICAvLyBTZW1WZXIgdXRpbGl0aWVzLiBlLmcuIHRvIGRldGVybWluZSBzZW1hbnRpYyBvcmRlciwgY29tcGFyZSB2ZXJzaW9ucy5cbiAgICBjb25zdCBwYXJzZWQgPSBnZXRWZXJzaW9uRm9yVmVyc2lvbkJyYW5jaChuYW1lKTtcbiAgICAvLyBDb2xsZWN0IGFsbCB2ZXJzaW9uLWJyYW5jaGVzIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBtYWpvciB2ZXJzaW9ucy5cbiAgICBpZiAocGFyc2VkICE9PSBudWxsICYmIG1ham9yVmVyc2lvbnMuaW5jbHVkZXMocGFyc2VkLm1ham9yKSkge1xuICAgICAgYnJhbmNoZXMucHVzaCh7bmFtZSwgcGFyc2VkfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBjYXB0dXJlZCB2ZXJzaW9uLWJyYW5jaGVzIGluIGRlc2NlbmRpbmcgb3JkZXIuXG4gIHJldHVybiBicmFuY2hlcy5zb3J0KChhLCBiKSA9PiBzZW12ZXIucmNvbXBhcmUoYS5wYXJzZWQsIGIucGFyc2VkKSk7XG59XG4iXX0=