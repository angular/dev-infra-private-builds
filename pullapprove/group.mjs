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
/** A PullApprove group to be able to test files against. */
export class PullApproveGroup {
    constructor(groupName, config, precedingGroups = []) {
        var _a;
        this.groupName = groupName;
        this.precedingGroups = precedingGroups;
        /** List of conditions for the group. */
        this.conditions = [];
        this._captureConditions(config);
        this.reviewers = (_a = config.reviewers) !== null && _a !== void 0 ? _a : { users: [], teams: [] };
    }
    _captureConditions(config) {
        if (config.conditions) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3ZDLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRWpFLE9BQU8sRUFBQyxvQ0FBb0MsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBeUIxRSxzRUFBc0U7QUFDdEUsTUFBTSwrQkFBK0IsR0FBRyxxREFBcUQsQ0FBQztBQUU5Riw0REFBNEQ7QUFDNUQsTUFBTSxPQUFPLGdCQUFnQjtJQU0zQixZQUNXLFNBQWlCLEVBQUUsTUFBOEIsRUFDL0Msa0JBQXNDLEVBQUU7O1FBRDFDLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDZixvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7UUFQckQsd0NBQXdDO1FBQy9CLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1FBT3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQUEsTUFBTSxDQUFDLFNBQVMsbUNBQUksRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsTUFBOEI7UUFDdkQsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3JCLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzNDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFcEMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLEVBQUU7b0JBQ3JELCtFQUErRTtvQkFDL0UsT0FBTztpQkFDUjtnQkFF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O1NBQzFCLENBQUM7SUFDSixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2NvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9ufSBmcm9tICcuL2NvbmRpdGlvbl9ldmFsdWF0b3InO1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwQ29uZmlnfSBmcm9tICcuL3BhcnNlLXlhbWwnO1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3J9IGZyb20gJy4vcHVsbGFwcHJvdmVfYXJyYXlzJztcblxuLyoqIEEgY29uZGl0aW9uIGZvciBhIGdyb3VwLiAqL1xuaW50ZXJmYWNlIEdyb3VwQ29uZGl0aW9uIHtcbiAgZXhwcmVzc2lvbjogc3RyaW5nO1xuICBjaGVja0ZuOiAoZmlsZXM6IHN0cmluZ1tdLCBncm91cHM6IFB1bGxBcHByb3ZlR3JvdXBbXSkgPT4gYm9vbGVhbjtcbiAgbWF0Y2hlZEZpbGVzOiBTZXQ8c3RyaW5nPjtcbiAgdW52ZXJpZmlhYmxlOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgR3JvdXBSZXZpZXdlcnMge1xuICB1c2Vycz86IHN0cmluZ1tdO1xuICB0ZWFtcz86IHN0cmluZ1tdO1xufVxuXG4vKiogUmVzdWx0IG9mIHRlc3RpbmcgZmlsZXMgYWdhaW5zdCB0aGUgZ3JvdXAuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICBncm91cE5hbWU6IHN0cmluZztcbiAgbWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIG1hdGNoZWRDb3VudDogbnVtYmVyO1xuICB1bm1hdGNoZWRDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xuICB1bm1hdGNoZWRDb3VudDogbnVtYmVyO1xuICB1bnZlcmlmaWFibGVDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xufVxuXG4vLyBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIGNvbmRpdGlvbnMgZm9yIHRoZSBnbG9iYWwgYXBwcm92YWwuXG5jb25zdCBHTE9CQUxfQVBQUk9WQUxfQ09ORElUSU9OX1JFR0VYID0gL15cImdsb2JhbC0oZG9jcy0pP2FwcHJvdmVyc1wiIG5vdCBpbiBncm91cHMuYXBwcm92ZWQkLztcblxuLyoqIEEgUHVsbEFwcHJvdmUgZ3JvdXAgdG8gYmUgYWJsZSB0byB0ZXN0IGZpbGVzIGFnYWluc3QuICovXG5leHBvcnQgY2xhc3MgUHVsbEFwcHJvdmVHcm91cCB7XG4gIC8qKiBMaXN0IG9mIGNvbmRpdGlvbnMgZm9yIHRoZSBncm91cC4gKi9cbiAgcmVhZG9ubHkgY29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuICAvKiogTGlzdCBvZiByZXZpZXdlcnMgZm9yIHRoZSBncm91cC4gKi9cbiAgcmVhZG9ubHkgcmV2aWV3ZXJzOiBHcm91cFJldmlld2VycztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBncm91cE5hbWU6IHN0cmluZywgY29uZmlnOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnLFxuICAgICAgcmVhZG9ubHkgcHJlY2VkaW5nR3JvdXBzOiBQdWxsQXBwcm92ZUdyb3VwW10gPSBbXSkge1xuICAgIHRoaXMuX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZyk7XG4gICAgdGhpcy5yZXZpZXdlcnMgPSBjb25maWcucmV2aWV3ZXJzID8/IHt1c2VyczogW10sIHRlYW1zOiBbXX07XG4gIH1cblxuICBwcml2YXRlIF9jYXB0dXJlQ29uZGl0aW9ucyhjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcpIHtcbiAgICBpZiAoY29uZmlnLmNvbmRpdGlvbnMpIHtcbiAgICAgIHJldHVybiBjb25maWcuY29uZGl0aW9ucy5mb3JFYWNoKGNvbmRpdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBjb25kaXRpb24udHJpbSgpO1xuXG4gICAgICAgIGlmIChleHByZXNzaW9uLm1hdGNoKEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVgpKSB7XG4gICAgICAgICAgLy8gQ3VycmVudGx5IGEgbm9vcCBhcyB3ZSBkb24ndCB0YWtlIGFueSBhY3Rpb24gZm9yIGdsb2JhbCBhcHByb3ZhbCBjb25kaXRpb25zLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgICAgIGNoZWNrRm46IGNvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9uKGV4cHJlc3Npb24pLFxuICAgICAgICAgICAgbWF0Y2hlZEZpbGVzOiBuZXcgU2V0KCksXG4gICAgICAgICAgICB1bnZlcmlmaWFibGU6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZXJyb3IoYENvdWxkIG5vdCBwYXJzZSBjb25kaXRpb24gaW4gZ3JvdXA6ICR7dGhpcy5ncm91cE5hbWV9YCk7XG4gICAgICAgICAgZXJyb3IoYCAtICR7ZXhwcmVzc2lvbn1gKTtcbiAgICAgICAgICBlcnJvcihgRXJyb3I6YCk7XG4gICAgICAgICAgZXJyb3IoZS5tZXNzYWdlKTtcbiAgICAgICAgICBlcnJvcihlLnN0YWNrKTtcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0cyBhIHByb3ZpZGVkIGZpbGUgcGF0aCB0byBkZXRlcm1pbmUgaWYgaXQgd291bGQgYmUgY29uc2lkZXJlZCBtYXRjaGVkIGJ5XG4gICAqIHRoZSBwdWxsIGFwcHJvdmUgZ3JvdXAncyBjb25kaXRpb25zLlxuICAgKi9cbiAgdGVzdEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnMuZXZlcnkoKGNvbmRpdGlvbikgPT4ge1xuICAgICAgY29uc3Qge21hdGNoZWRGaWxlcywgY2hlY2tGbiwgZXhwcmVzc2lvbn0gPSBjb25kaXRpb247XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBtYXRjaGVzRmlsZSA9IGNoZWNrRm4oW2ZpbGVQYXRoXSwgdGhpcy5wcmVjZWRpbmdHcm91cHMpO1xuICAgICAgICBpZiAobWF0Y2hlc0ZpbGUpIHtcbiAgICAgICAgICBtYXRjaGVkRmlsZXMuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0Y2hlc0ZpbGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIGEgY29uZGl0aW9uIHRoYXQgZGVwZW5kcyBvbiB0aGUgc3RhdGUgb2YgZ3JvdXBzIHdlIHdhbnQgdG9cbiAgICAgICAgLy8gaWdub3JlIHRoYXQgdGhlIHZlcmlmaWNhdGlvbiBjYW4ndCBhY2N1cmF0ZWx5IGV2YWx1YXRlIHRoZSBjb25kaXRpb24gYW5kIHRoZW5cbiAgICAgICAgLy8gY29udGludWUgcHJvY2Vzc2luZy4gT3RoZXIgdHlwZXMgb2YgZXJyb3JzIGZhaWwgdGhlIHZlcmlmaWNhdGlvbiwgYXMgY29uZGl0aW9uc1xuICAgICAgICAvLyBzaG91bGQgb3RoZXJ3aXNlIGJlIGFibGUgdG8gZXhlY3V0ZSB3aXRob3V0IHRocm93aW5nLlxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFB1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcikge1xuICAgICAgICAgIGNvbmRpdGlvbi51bnZlcmlmaWFibGUgPSB0cnVlO1xuICAgICAgICAgIC8vIFJldHVybiB0cnVlIHNvIHRoYXQgYHRoaXMuY29uZGl0aW9ucy5ldmVyeWAgY2FuIGNvbnRpbnVlIGV2YWx1YXRpbmcuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyTWVzc2FnZSA9IGBDb25kaXRpb24gY291bGQgbm90IGJlIGV2YWx1YXRlZDogXFxuXFxuYCArXG4gICAgICAgICAgICAgIGBGcm9tIHRoZSBbJHt0aGlzLmdyb3VwTmFtZX1dIGdyb3VwOlxcbmAgK1xuICAgICAgICAgICAgICBgIC0gJHtleHByZXNzaW9ufWAgK1xuICAgICAgICAgICAgICBgXFxuXFxuJHtlLm1lc3NhZ2V9ICR7ZS5zdGFja31cXG5cXG5gO1xuICAgICAgICAgIGVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLm1hdGNoZWRGaWxlcy5zaXplID4gMCk7XG4gICAgY29uc3QgdW5tYXRjaGVkQ29uZGl0aW9ucyA9XG4gICAgICAgIHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLm1hdGNoZWRGaWxlcy5zaXplID09PSAwICYmICFjLnVudmVyaWZpYWJsZSk7XG4gICAgY29uc3QgdW52ZXJpZmlhYmxlQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLnVudmVyaWZpYWJsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgbWF0Y2hlZENvdW50OiBtYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGgsXG4gICAgICB1bm1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgdW5tYXRjaGVkQ291bnQ6IHVubWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW52ZXJpZmlhYmxlQ29uZGl0aW9ucyxcbiAgICAgIGdyb3VwTmFtZTogdGhpcy5ncm91cE5hbWUsXG4gICAgfTtcbiAgfVxufVxuIl19