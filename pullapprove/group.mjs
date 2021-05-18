/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { error } from '../utils/console';
import { convertConditionToFunction } from './condition_evaluator';
import { PullApproveGroupStateDependencyError } from './pullapprove_arrays';
// Regular expression that matches conditions for the global approval.
const GLOBAL_APPROVAL_CONDITION_REGEX = /^"global-(docs-)?approvers" not in groups.approved$/;
// Name of the PullApprove group that serves as fallback. This group should never capture
// any conditions as it would always match specified files. This is not desired as we want
// to figure out as part of this tool, whether there actually are unmatched files.
const FALLBACK_GROUP_NAME = 'fallback';
/** A PullApprove group to be able to test files against. */
export class PullApproveGroup {
    constructor(groupName, config, precedingGroups = []) {
        this.groupName = groupName;
        this.precedingGroups = precedingGroups;
        /** List of conditions for the group. */
        this.conditions = [];
        this._captureConditions(config);
    }
    _captureConditions(config) {
        if (config.conditions && this.groupName !== FALLBACK_GROUP_NAME) {
            return config.conditions.forEach(condition => {
                const expression = condition.trim();
                if (expression.match(GLOBAL_APPROVAL_CONDITION_REGEX)) {
                    // Currently a noop as we don't take any action for global approval conditions.
                    return;
                }
                try {
                    this.conditions.push({
                        expression,
                        checkFn: convertConditionToFunction(expression),
                        matchedFiles: new Set(),
                        unverifiable: false,
                    });
                }
                catch (e) {
                    error(`Could not parse condition in group: ${this.groupName}`);
                    error(` - ${expression}`);
                    error(`Error:`);
                    error(e.message);
                    error(e.stack);
                    process.exit(1);
                }
            });
        }
    }
    /**
     * Tests a provided file path to determine if it would be considered matched by
     * the pull approve group's conditions.
     */
    testFile(filePath) {
        return this.conditions.every((condition) => {
            const { matchedFiles, checkFn, expression } = condition;
            try {
                const matchesFile = checkFn([filePath], this.precedingGroups);
                if (matchesFile) {
                    matchedFiles.add(filePath);
                }
                return matchesFile;
            }
            catch (e) {
                // In the case of a condition that depends on the state of groups we want to
                // ignore that the verification can't accurately evaluate the condition and then
                // continue processing. Other types of errors fail the verification, as conditions
                // should otherwise be able to execute without throwing.
                if (e instanceof PullApproveGroupStateDependencyError) {
                    condition.unverifiable = true;
                    // Return true so that `this.conditions.every` can continue evaluating.
                    return true;
                }
                else {
                    const errMessage = `Condition could not be evaluated: \n\n` +
                        `From the [${this.groupName}] group:\n` +
                        ` - ${expression}` +
                        `\n\n${e.message} ${e.stack}\n\n`;
                    error(errMessage);
                    process.exit(1);
                }
            }
        });
    }
    /** Retrieve the results for the Group, all matched and unmatched conditions. */
    getResults() {
        const matchedConditions = this.conditions.filter(c => c.matchedFiles.size > 0);
        const unmatchedConditions = this.conditions.filter(c => c.matchedFiles.size === 0 && !c.unverifiable);
        const unverifiableConditions = this.conditions.filter(c => c.unverifiable);
        return {
            matchedConditions,
            matchedCount: matchedConditions.length,
            unmatchedConditions,
            unmatchedCount: unmatchedConditions.length,
            unverifiableConditions,
            groupName: this.groupName,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3ZDLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRWpFLE9BQU8sRUFBQyxvQ0FBb0MsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBb0IxRSxzRUFBc0U7QUFDdEUsTUFBTSwrQkFBK0IsR0FBRyxxREFBcUQsQ0FBQztBQUU5Rix5RkFBeUY7QUFDekYsMEZBQTBGO0FBQzFGLGtGQUFrRjtBQUNsRixNQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQztBQUV2Qyw0REFBNEQ7QUFDNUQsTUFBTSxPQUFPLGdCQUFnQjtJQUkzQixZQUNXLFNBQWlCLEVBQUUsTUFBOEIsRUFDL0Msa0JBQXNDLEVBQUU7UUFEMUMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUNmLG9CQUFlLEdBQWYsZUFBZSxDQUF5QjtRQUxyRCx3Q0FBd0M7UUFDeEMsZUFBVSxHQUFxQixFQUFFLENBQUM7UUFLaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxNQUE4QjtRQUN2RCxJQUFJLE1BQU0sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxtQkFBbUIsRUFBRTtZQUMvRCxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMzQyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXBDLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxFQUFFO29CQUNyRCwrRUFBK0U7b0JBQy9FLE9BQU87aUJBQ1I7Z0JB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UztTQUMxQixDQUFDO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtjb252ZXJ0Q29uZGl0aW9uVG9GdW5jdGlvbn0gZnJvbSAnLi9jb25kaXRpb25fZXZhbHVhdG9yJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cENvbmZpZ30gZnJvbSAnLi9wYXJzZS15YW1sJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yfSBmcm9tICcuL3B1bGxhcHByb3ZlX2FycmF5cyc7XG5cbi8qKiBBIGNvbmRpdGlvbiBmb3IgYSBncm91cC4gKi9cbmludGVyZmFjZSBHcm91cENvbmRpdGlvbiB7XG4gIGV4cHJlc3Npb246IHN0cmluZztcbiAgY2hlY2tGbjogKGZpbGVzOiBzdHJpbmdbXSwgZ3JvdXBzOiBQdWxsQXBwcm92ZUdyb3VwW10pID0+IGJvb2xlYW47XG4gIG1hdGNoZWRGaWxlczogU2V0PHN0cmluZz47XG4gIHVudmVyaWZpYWJsZTogYm9vbGVhbjtcbn1cblxuLyoqIFJlc3VsdCBvZiB0ZXN0aW5nIGZpbGVzIGFnYWluc3QgdGhlIGdyb3VwLiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgZ3JvdXBOYW1lOiBzdHJpbmc7XG4gIG1hdGNoZWRDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xuICBtYXRjaGVkQ291bnQ6IG51bWJlcjtcbiAgdW5tYXRjaGVkQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbiAgdW5tYXRjaGVkQ291bnQ6IG51bWJlcjtcbiAgdW52ZXJpZmlhYmxlQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbn1cblxuLy8gUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyBjb25kaXRpb25zIGZvciB0aGUgZ2xvYmFsIGFwcHJvdmFsLlxuY29uc3QgR0xPQkFMX0FQUFJPVkFMX0NPTkRJVElPTl9SRUdFWCA9IC9eXCJnbG9iYWwtKGRvY3MtKT9hcHByb3ZlcnNcIiBub3QgaW4gZ3JvdXBzLmFwcHJvdmVkJC87XG5cbi8vIE5hbWUgb2YgdGhlIFB1bGxBcHByb3ZlIGdyb3VwIHRoYXQgc2VydmVzIGFzIGZhbGxiYWNrLiBUaGlzIGdyb3VwIHNob3VsZCBuZXZlciBjYXB0dXJlXG4vLyBhbnkgY29uZGl0aW9ucyBhcyBpdCB3b3VsZCBhbHdheXMgbWF0Y2ggc3BlY2lmaWVkIGZpbGVzLiBUaGlzIGlzIG5vdCBkZXNpcmVkIGFzIHdlIHdhbnRcbi8vIHRvIGZpZ3VyZSBvdXQgYXMgcGFydCBvZiB0aGlzIHRvb2wsIHdoZXRoZXIgdGhlcmUgYWN0dWFsbHkgYXJlIHVubWF0Y2hlZCBmaWxlcy5cbmNvbnN0IEZBTExCQUNLX0dST1VQX05BTUUgPSAnZmFsbGJhY2snO1xuXG4vKiogQSBQdWxsQXBwcm92ZSBncm91cCB0byBiZSBhYmxlIHRvIHRlc3QgZmlsZXMgYWdhaW5zdC4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwIHtcbiAgLyoqIExpc3Qgb2YgY29uZGl0aW9ucyBmb3IgdGhlIGdyb3VwLiAqL1xuICBjb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZ3JvdXBOYW1lOiBzdHJpbmcsIGNvbmZpZzogUHVsbEFwcHJvdmVHcm91cENvbmZpZyxcbiAgICAgIHJlYWRvbmx5IHByZWNlZGluZ0dyb3VwczogUHVsbEFwcHJvdmVHcm91cFtdID0gW10pIHtcbiAgICB0aGlzLl9jYXB0dXJlQ29uZGl0aW9ucyhjb25maWcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FwdHVyZUNvbmRpdGlvbnMoY29uZmlnOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnKSB7XG4gICAgaWYgKGNvbmZpZy5jb25kaXRpb25zICYmIHRoaXMuZ3JvdXBOYW1lICE9PSBGQUxMQkFDS19HUk9VUF9OQU1FKSB7XG4gICAgICByZXR1cm4gY29uZmlnLmNvbmRpdGlvbnMuZm9yRWFjaChjb25kaXRpb24gPT4ge1xuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gY29uZGl0aW9uLnRyaW0oKTtcblxuICAgICAgICBpZiAoZXhwcmVzc2lvbi5tYXRjaChHTE9CQUxfQVBQUk9WQUxfQ09ORElUSU9OX1JFR0VYKSkge1xuICAgICAgICAgIC8vIEN1cnJlbnRseSBhIG5vb3AgYXMgd2UgZG9uJ3QgdGFrZSBhbnkgYWN0aW9uIGZvciBnbG9iYWwgYXBwcm92YWwgY29uZGl0aW9ucy5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY29uZGl0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGV4cHJlc3Npb24sXG4gICAgICAgICAgICBjaGVja0ZuOiBjb252ZXJ0Q29uZGl0aW9uVG9GdW5jdGlvbihleHByZXNzaW9uKSxcbiAgICAgICAgICAgIG1hdGNoZWRGaWxlczogbmV3IFNldCgpLFxuICAgICAgICAgICAgdW52ZXJpZmlhYmxlOiBmYWxzZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGVycm9yKGBDb3VsZCBub3QgcGFyc2UgY29uZGl0aW9uIGluIGdyb3VwOiAke3RoaXMuZ3JvdXBOYW1lfWApO1xuICAgICAgICAgIGVycm9yKGAgLSAke2V4cHJlc3Npb259YCk7XG4gICAgICAgICAgZXJyb3IoYEVycm9yOmApO1xuICAgICAgICAgIGVycm9yKGUubWVzc2FnZSk7XG4gICAgICAgICAgZXJyb3IoZS5zdGFjayk7XG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgYSBwcm92aWRlZCBmaWxlIHBhdGggdG8gZGV0ZXJtaW5lIGlmIGl0IHdvdWxkIGJlIGNvbnNpZGVyZWQgbWF0Y2hlZCBieVxuICAgKiB0aGUgcHVsbCBhcHByb3ZlIGdyb3VwJ3MgY29uZGl0aW9ucy5cbiAgICovXG4gIHRlc3RGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zLmV2ZXJ5KChjb25kaXRpb24pID0+IHtcbiAgICAgIGNvbnN0IHttYXRjaGVkRmlsZXMsIGNoZWNrRm4sIGV4cHJlc3Npb259ID0gY29uZGl0aW9uO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWF0Y2hlc0ZpbGUgPSBjaGVja0ZuKFtmaWxlUGF0aF0sIHRoaXMucHJlY2VkaW5nR3JvdXBzKTtcbiAgICAgICAgaWYgKG1hdGNoZXNGaWxlKSB7XG4gICAgICAgICAgbWF0Y2hlZEZpbGVzLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdGNoZXNGaWxlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiBhIGNvbmRpdGlvbiB0aGF0IGRlcGVuZHMgb24gdGhlIHN0YXRlIG9mIGdyb3VwcyB3ZSB3YW50IHRvXG4gICAgICAgIC8vIGlnbm9yZSB0aGF0IHRoZSB2ZXJpZmljYXRpb24gY2FuJ3QgYWNjdXJhdGVseSBldmFsdWF0ZSB0aGUgY29uZGl0aW9uIGFuZCB0aGVuXG4gICAgICAgIC8vIGNvbnRpbnVlIHByb2Nlc3NpbmcuIE90aGVyIHR5cGVzIG9mIGVycm9ycyBmYWlsIHRoZSB2ZXJpZmljYXRpb24sIGFzIGNvbmRpdGlvbnNcbiAgICAgICAgLy8gc2hvdWxkIG90aGVyd2lzZSBiZSBhYmxlIHRvIGV4ZWN1dGUgd2l0aG91dCB0aHJvd2luZy5cbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3IpIHtcbiAgICAgICAgICBjb25kaXRpb24udW52ZXJpZmlhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBzbyB0aGF0IGB0aGlzLmNvbmRpdGlvbnMuZXZlcnlgIGNhbiBjb250aW51ZSBldmFsdWF0aW5nLlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGVyck1lc3NhZ2UgPSBgQ29uZGl0aW9uIGNvdWxkIG5vdCBiZSBldmFsdWF0ZWQ6IFxcblxcbmAgK1xuICAgICAgICAgICAgICBgRnJvbSB0aGUgWyR7dGhpcy5ncm91cE5hbWV9XSBncm91cDpcXG5gICtcbiAgICAgICAgICAgICAgYCAtICR7ZXhwcmVzc2lvbn1gICtcbiAgICAgICAgICAgICAgYFxcblxcbiR7ZS5tZXNzYWdlfSAke2Uuc3RhY2t9XFxuXFxuYDtcbiAgICAgICAgICBlcnJvcihlcnJNZXNzYWdlKTtcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVzdWx0cyBmb3IgdGhlIEdyb3VwLCBhbGwgbWF0Y2hlZCBhbmQgdW5tYXRjaGVkIGNvbmRpdGlvbnMuICovXG4gIGdldFJlc3VsdHMoKTogUHVsbEFwcHJvdmVHcm91cFJlc3VsdCB7XG4gICAgY29uc3QgbWF0Y2hlZENvbmRpdGlvbnMgPSB0aGlzLmNvbmRpdGlvbnMuZmlsdGVyKGMgPT4gYy5tYXRjaGVkRmlsZXMuc2l6ZSA+IDApO1xuICAgIGNvbnN0IHVubWF0Y2hlZENvbmRpdGlvbnMgPVxuICAgICAgICB0aGlzLmNvbmRpdGlvbnMuZmlsdGVyKGMgPT4gYy5tYXRjaGVkRmlsZXMuc2l6ZSA9PT0gMCAmJiAhYy51bnZlcmlmaWFibGUpO1xuICAgIGNvbnN0IHVudmVyaWZpYWJsZUNvbmRpdGlvbnMgPSB0aGlzLmNvbmRpdGlvbnMuZmlsdGVyKGMgPT4gYy51bnZlcmlmaWFibGUpO1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVkQ29uZGl0aW9ucyxcbiAgICAgIG1hdGNoZWRDb3VudDogbWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW5tYXRjaGVkQ29uZGl0aW9ucyxcbiAgICAgIHVubWF0Y2hlZENvdW50OiB1bm1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCxcbiAgICAgIHVudmVyaWZpYWJsZUNvbmRpdGlvbnMsXG4gICAgICBncm91cE5hbWU6IHRoaXMuZ3JvdXBOYW1lLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==