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
        var _a;
        this.groupName = groupName;
        this.precedingGroups = precedingGroups;
        /** List of conditions for the group. */
        this.conditions = [];
        this._captureConditions(config);
        this.reviewers = (_a = config.reviewers) !== null && _a !== void 0 ? _a : { users: [], teams: [] };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3ZDLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRWpFLE9BQU8sRUFBQyxvQ0FBb0MsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBeUIxRSxzRUFBc0U7QUFDdEUsTUFBTSwrQkFBK0IsR0FBRyxxREFBcUQsQ0FBQztBQUU5Rix5RkFBeUY7QUFDekYsMEZBQTBGO0FBQzFGLGtGQUFrRjtBQUNsRixNQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQztBQUV2Qyw0REFBNEQ7QUFDNUQsTUFBTSxPQUFPLGdCQUFnQjtJQU0zQixZQUNXLFNBQWlCLEVBQUUsTUFBOEIsRUFDL0Msa0JBQXNDLEVBQUU7O1FBRDFDLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDZixvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7UUFQckQsd0NBQXdDO1FBQy9CLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1FBT3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQUEsTUFBTSxDQUFDLFNBQVMsbUNBQUksRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsTUFBOEI7UUFDdkQsSUFBSSxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssbUJBQW1CLEVBQUU7WUFDL0QsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDM0MsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVwQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsRUFBRTtvQkFDckQsK0VBQStFO29CQUMvRSxPQUFPO2lCQUNSO2dCQUVELElBQUk7b0JBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQ25CLFVBQVU7d0JBQ1YsT0FBTyxFQUFFLDBCQUEwQixDQUFDLFVBQVUsQ0FBQzt3QkFDL0MsWUFBWSxFQUFFLElBQUksR0FBRyxFQUFFO3dCQUN2QixZQUFZLEVBQUUsS0FBSztxQkFDcEIsQ0FBQyxDQUFDO2lCQUNKO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNWLEtBQUssQ0FBQyx1Q0FBdUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7b0JBQy9ELEtBQUssQ0FBQyxNQUFNLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQzFCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDaEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDakIsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqQjtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUSxDQUFDLFFBQWdCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUN6QyxNQUFNLEVBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUMsR0FBRyxTQUFTLENBQUM7WUFDdEQsSUFBSTtnQkFDRixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzlELElBQUksV0FBVyxFQUFFO29CQUNmLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzVCO2dCQUNELE9BQU8sV0FBVyxDQUFDO2FBQ3BCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsNEVBQTRFO2dCQUM1RSxnRkFBZ0Y7Z0JBQ2hGLGtGQUFrRjtnQkFDbEYsd0RBQXdEO2dCQUN4RCxJQUFJLENBQUMsWUFBWSxvQ0FBb0MsRUFBRTtvQkFDckQsU0FBUyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7b0JBQzlCLHVFQUF1RTtvQkFDdkUsT0FBTyxJQUFJLENBQUM7aUJBQ2I7cUJBQU07b0JBQ0wsTUFBTSxVQUFVLEdBQUcsd0NBQXdDO3dCQUN2RCxhQUFhLElBQUksQ0FBQyxTQUFTLFlBQVk7d0JBQ3ZDLE1BQU0sVUFBVSxFQUFFO3dCQUNsQixPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDO29CQUN0QyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxnRkFBZ0Y7SUFDaEYsVUFBVTtRQUNSLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvRSxNQUFNLG1CQUFtQixHQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM5RSxNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNFLE9BQU87WUFDTCxpQkFBaUI7WUFDakIsWUFBWSxFQUFFLGlCQUFpQixDQUFDLE1BQU07WUFDdEMsbUJBQW1CO1lBQ25CLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNO1lBQzFDLHNCQUFzQjtZQUN0QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7U0FDMUIsQ0FBQztJQUNKLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Y29udmVydENvbmRpdGlvblRvRnVuY3Rpb259IGZyb20gJy4vY29uZGl0aW9uX2V2YWx1YXRvcic7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBDb25maWd9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcn0gZnJvbSAnLi9wdWxsYXBwcm92ZV9hcnJheXMnO1xuXG4vKiogQSBjb25kaXRpb24gZm9yIGEgZ3JvdXAuICovXG5pbnRlcmZhY2UgR3JvdXBDb25kaXRpb24ge1xuICBleHByZXNzaW9uOiBzdHJpbmc7XG4gIGNoZWNrRm46IChmaWxlczogc3RyaW5nW10sIGdyb3VwczogUHVsbEFwcHJvdmVHcm91cFtdKSA9PiBib29sZWFuO1xuICBtYXRjaGVkRmlsZXM6IFNldDxzdHJpbmc+O1xuICB1bnZlcmlmaWFibGU6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBHcm91cFJldmlld2VycyB7XG4gIHVzZXJzPzogc3RyaW5nW107XG4gIHRlYW1zPzogc3RyaW5nW107XG59XG5cbi8qKiBSZXN1bHQgb2YgdGVzdGluZyBmaWxlcyBhZ2FpbnN0IHRoZSBncm91cC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbEFwcHJvdmVHcm91cFJlc3VsdCB7XG4gIGdyb3VwTmFtZTogc3RyaW5nO1xuICBtYXRjaGVkQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbiAgbWF0Y2hlZENvdW50OiBudW1iZXI7XG4gIHVubWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZENvdW50OiBudW1iZXI7XG4gIHVudmVyaWZpYWJsZUNvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG59XG5cbi8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgY29uZGl0aW9ucyBmb3IgdGhlIGdsb2JhbCBhcHByb3ZhbC5cbmNvbnN0IEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVggPSAvXlwiZ2xvYmFsLShkb2NzLSk/YXBwcm92ZXJzXCIgbm90IGluIGdyb3Vwcy5hcHByb3ZlZCQvO1xuXG4vLyBOYW1lIG9mIHRoZSBQdWxsQXBwcm92ZSBncm91cCB0aGF0IHNlcnZlcyBhcyBmYWxsYmFjay4gVGhpcyBncm91cCBzaG91bGQgbmV2ZXIgY2FwdHVyZVxuLy8gYW55IGNvbmRpdGlvbnMgYXMgaXQgd291bGQgYWx3YXlzIG1hdGNoIHNwZWNpZmllZCBmaWxlcy4gVGhpcyBpcyBub3QgZGVzaXJlZCBhcyB3ZSB3YW50XG4vLyB0byBmaWd1cmUgb3V0IGFzIHBhcnQgb2YgdGhpcyB0b29sLCB3aGV0aGVyIHRoZXJlIGFjdHVhbGx5IGFyZSB1bm1hdGNoZWQgZmlsZXMuXG5jb25zdCBGQUxMQkFDS19HUk9VUF9OQU1FID0gJ2ZhbGxiYWNrJztcblxuLyoqIEEgUHVsbEFwcHJvdmUgZ3JvdXAgdG8gYmUgYWJsZSB0byB0ZXN0IGZpbGVzIGFnYWluc3QuICovXG5leHBvcnQgY2xhc3MgUHVsbEFwcHJvdmVHcm91cCB7XG4gIC8qKiBMaXN0IG9mIGNvbmRpdGlvbnMgZm9yIHRoZSBncm91cC4gKi9cbiAgcmVhZG9ubHkgY29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuICAvKiogTGlzdCBvZiByZXZpZXdlcnMgZm9yIHRoZSBncm91cC4gKi9cbiAgcmVhZG9ubHkgcmV2aWV3ZXJzOiBHcm91cFJldmlld2VycztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBncm91cE5hbWU6IHN0cmluZywgY29uZmlnOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnLFxuICAgICAgcmVhZG9ubHkgcHJlY2VkaW5nR3JvdXBzOiBQdWxsQXBwcm92ZUdyb3VwW10gPSBbXSkge1xuICAgIHRoaXMuX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZyk7XG4gICAgdGhpcy5yZXZpZXdlcnMgPSBjb25maWcucmV2aWV3ZXJzID8/IHt1c2VyczogW10sIHRlYW1zOiBbXX07XG4gIH1cblxuICBwcml2YXRlIF9jYXB0dXJlQ29uZGl0aW9ucyhjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcpIHtcbiAgICBpZiAoY29uZmlnLmNvbmRpdGlvbnMgJiYgdGhpcy5ncm91cE5hbWUgIT09IEZBTExCQUNLX0dST1VQX05BTUUpIHtcbiAgICAgIHJldHVybiBjb25maWcuY29uZGl0aW9ucy5mb3JFYWNoKGNvbmRpdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBjb25kaXRpb24udHJpbSgpO1xuXG4gICAgICAgIGlmIChleHByZXNzaW9uLm1hdGNoKEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVgpKSB7XG4gICAgICAgICAgLy8gQ3VycmVudGx5IGEgbm9vcCBhcyB3ZSBkb24ndCB0YWtlIGFueSBhY3Rpb24gZm9yIGdsb2JhbCBhcHByb3ZhbCBjb25kaXRpb25zLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgICAgIGNoZWNrRm46IGNvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9uKGV4cHJlc3Npb24pLFxuICAgICAgICAgICAgbWF0Y2hlZEZpbGVzOiBuZXcgU2V0KCksXG4gICAgICAgICAgICB1bnZlcmlmaWFibGU6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZXJyb3IoYENvdWxkIG5vdCBwYXJzZSBjb25kaXRpb24gaW4gZ3JvdXA6ICR7dGhpcy5ncm91cE5hbWV9YCk7XG4gICAgICAgICAgZXJyb3IoYCAtICR7ZXhwcmVzc2lvbn1gKTtcbiAgICAgICAgICBlcnJvcihgRXJyb3I6YCk7XG4gICAgICAgICAgZXJyb3IoZS5tZXNzYWdlKTtcbiAgICAgICAgICBlcnJvcihlLnN0YWNrKTtcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0cyBhIHByb3ZpZGVkIGZpbGUgcGF0aCB0byBkZXRlcm1pbmUgaWYgaXQgd291bGQgYmUgY29uc2lkZXJlZCBtYXRjaGVkIGJ5XG4gICAqIHRoZSBwdWxsIGFwcHJvdmUgZ3JvdXAncyBjb25kaXRpb25zLlxuICAgKi9cbiAgdGVzdEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnMuZXZlcnkoKGNvbmRpdGlvbikgPT4ge1xuICAgICAgY29uc3Qge21hdGNoZWRGaWxlcywgY2hlY2tGbiwgZXhwcmVzc2lvbn0gPSBjb25kaXRpb247XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBtYXRjaGVzRmlsZSA9IGNoZWNrRm4oW2ZpbGVQYXRoXSwgdGhpcy5wcmVjZWRpbmdHcm91cHMpO1xuICAgICAgICBpZiAobWF0Y2hlc0ZpbGUpIHtcbiAgICAgICAgICBtYXRjaGVkRmlsZXMuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0Y2hlc0ZpbGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIGEgY29uZGl0aW9uIHRoYXQgZGVwZW5kcyBvbiB0aGUgc3RhdGUgb2YgZ3JvdXBzIHdlIHdhbnQgdG9cbiAgICAgICAgLy8gaWdub3JlIHRoYXQgdGhlIHZlcmlmaWNhdGlvbiBjYW4ndCBhY2N1cmF0ZWx5IGV2YWx1YXRlIHRoZSBjb25kaXRpb24gYW5kIHRoZW5cbiAgICAgICAgLy8gY29udGludWUgcHJvY2Vzc2luZy4gT3RoZXIgdHlwZXMgb2YgZXJyb3JzIGZhaWwgdGhlIHZlcmlmaWNhdGlvbiwgYXMgY29uZGl0aW9uc1xuICAgICAgICAvLyBzaG91bGQgb3RoZXJ3aXNlIGJlIGFibGUgdG8gZXhlY3V0ZSB3aXRob3V0IHRocm93aW5nLlxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFB1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcikge1xuICAgICAgICAgIGNvbmRpdGlvbi51bnZlcmlmaWFibGUgPSB0cnVlO1xuICAgICAgICAgIC8vIFJldHVybiB0cnVlIHNvIHRoYXQgYHRoaXMuY29uZGl0aW9ucy5ldmVyeWAgY2FuIGNvbnRpbnVlIGV2YWx1YXRpbmcuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyTWVzc2FnZSA9IGBDb25kaXRpb24gY291bGQgbm90IGJlIGV2YWx1YXRlZDogXFxuXFxuYCArXG4gICAgICAgICAgICAgIGBGcm9tIHRoZSBbJHt0aGlzLmdyb3VwTmFtZX1dIGdyb3VwOlxcbmAgK1xuICAgICAgICAgICAgICBgIC0gJHtleHByZXNzaW9ufWAgK1xuICAgICAgICAgICAgICBgXFxuXFxuJHtlLm1lc3NhZ2V9ICR7ZS5zdGFja31cXG5cXG5gO1xuICAgICAgICAgIGVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLm1hdGNoZWRGaWxlcy5zaXplID4gMCk7XG4gICAgY29uc3QgdW5tYXRjaGVkQ29uZGl0aW9ucyA9XG4gICAgICAgIHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLm1hdGNoZWRGaWxlcy5zaXplID09PSAwICYmICFjLnVudmVyaWZpYWJsZSk7XG4gICAgY29uc3QgdW52ZXJpZmlhYmxlQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLnVudmVyaWZpYWJsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgbWF0Y2hlZENvdW50OiBtYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGgsXG4gICAgICB1bm1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgdW5tYXRjaGVkQ291bnQ6IHVubWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW52ZXJpZmlhYmxlQ29uZGl0aW9ucyxcbiAgICAgIGdyb3VwTmFtZTogdGhpcy5ncm91cE5hbWUsXG4gICAgfTtcbiAgfVxufVxuIl19