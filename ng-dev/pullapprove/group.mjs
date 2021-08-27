"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullApproveGroup = void 0;
const console_1 = require("../utils/console");
const condition_evaluator_1 = require("./condition_evaluator");
const pullapprove_arrays_1 = require("./pullapprove_arrays");
// Regular expression that matches conditions for the global approval.
const GLOBAL_APPROVAL_CONDITION_REGEX = /^"global-(docs-)?approvers" not in groups.approved$/;
/** A PullApprove group to be able to test files against. */
class PullApproveGroup {
    constructor(groupName, config, precedingGroups = []) {
        this.groupName = groupName;
        this.precedingGroups = precedingGroups;
        /** List of conditions for the group. */
        this.conditions = [];
        this._captureConditions(config);
        this.reviewers = config.reviewers ?? { users: [], teams: [] };
    }
    _captureConditions(config) {
        if (config.conditions) {
            return config.conditions.forEach((condition) => {
                const expression = condition.trim();
                if (expression.match(GLOBAL_APPROVAL_CONDITION_REGEX)) {
                    // Currently a noop as we don't take any action for global approval conditions.
                    return;
                }
                try {
                    this.conditions.push({
                        expression,
                        checkFn: (0, condition_evaluator_1.convertConditionToFunction)(expression),
                        matchedFiles: new Set(),
                        unverifiable: false,
                    });
                }
                catch (e) {
                    (0, console_1.error)(`Could not parse condition in group: ${this.groupName}`);
                    (0, console_1.error)(` - ${expression}`);
                    (0, console_1.error)(`Error:`, e);
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
                if (e instanceof pullapprove_arrays_1.PullApproveGroupStateDependencyError) {
                    condition.unverifiable = true;
                    // Return true so that `this.conditions.every` can continue evaluating.
                    return true;
                }
                else {
                    const errMessage = `Condition could not be evaluated: \n\n` +
                        `From the [${this.groupName}] group:\n` +
                        ` - ${expression}`;
                    (0, console_1.error)(errMessage, '\n\n', e, '\n\n');
                    process.exit(1);
                }
            }
        });
    }
    /** Retrieve the results for the Group, all matched and unmatched conditions. */
    getResults() {
        const matchedConditions = this.conditions.filter((c) => c.matchedFiles.size > 0);
        const unmatchedConditions = this.conditions.filter((c) => c.matchedFiles.size === 0 && !c.unverifiable);
        const unverifiableConditions = this.conditions.filter((c) => c.unverifiable);
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
exports.PullApproveGroup = PullApproveGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsOENBQXVDO0FBQ3ZDLCtEQUFpRTtBQUVqRSw2REFBMEU7QUF5QjFFLHNFQUFzRTtBQUN0RSxNQUFNLCtCQUErQixHQUFHLHFEQUFxRCxDQUFDO0FBRTlGLDREQUE0RDtBQUM1RCxNQUFhLGdCQUFnQjtJQU0zQixZQUNTLFNBQWlCLEVBQ3hCLE1BQThCLEVBQ3JCLGtCQUFzQyxFQUFFO1FBRjFDLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFFZixvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7UUFSbkQsd0NBQXdDO1FBQy9CLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1FBU3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsTUFBOEI7UUFDdkQsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3JCLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVwQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsRUFBRTtvQkFDckQsK0VBQStFO29CQUMvRSxPQUFPO2lCQUNSO2dCQUVELElBQUk7b0JBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQ25CLFVBQVU7d0JBQ1YsT0FBTyxFQUFFLElBQUEsZ0RBQTBCLEVBQUMsVUFBVSxDQUFDO3dCQUMvQyxZQUFZLEVBQUUsSUFBSSxHQUFHLEVBQUU7d0JBQ3ZCLFlBQVksRUFBRSxLQUFLO3FCQUNwQixDQUFDLENBQUM7aUJBQ0o7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsSUFBQSxlQUFLLEVBQUMsdUNBQXVDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUMvRCxJQUFBLGVBQUssRUFBQyxNQUFNLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQzFCLElBQUEsZUFBSyxFQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDakI7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxRQUFnQjtRQUN2QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDekMsTUFBTSxFQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFDLEdBQUcsU0FBUyxDQUFDO1lBQ3RELElBQUk7Z0JBQ0YsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLFdBQVcsRUFBRTtvQkFDZixZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUM1QjtnQkFDRCxPQUFPLFdBQVcsQ0FBQzthQUNwQjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLDRFQUE0RTtnQkFDNUUsZ0ZBQWdGO2dCQUNoRixrRkFBa0Y7Z0JBQ2xGLHdEQUF3RDtnQkFDeEQsSUFBSSxDQUFDLFlBQVkseURBQW9DLEVBQUU7b0JBQ3JELFNBQVMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO29CQUM5Qix1RUFBdUU7b0JBQ3ZFLE9BQU8sSUFBSSxDQUFDO2lCQUNiO3FCQUFNO29CQUNMLE1BQU0sVUFBVSxHQUNkLHdDQUF3Qzt3QkFDeEMsYUFBYSxJQUFJLENBQUMsU0FBUyxZQUFZO3dCQUN2QyxNQUFNLFVBQVUsRUFBRSxDQUFDO29CQUNyQixJQUFBLGVBQUssRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDakI7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGdGQUFnRjtJQUNoRixVQUFVO1FBQ1IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakYsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FDaEQsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQ3BELENBQUM7UUFDRixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0UsT0FBTztZQUNMLGlCQUFpQjtZQUNqQixZQUFZLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtZQUN0QyxtQkFBbUI7WUFDbkIsY0FBYyxFQUFFLG1CQUFtQixDQUFDLE1BQU07WUFDMUMsc0JBQXNCO1lBQ3RCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztTQUMxQixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBNUZELDRDQTRGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Y29udmVydENvbmRpdGlvblRvRnVuY3Rpb259IGZyb20gJy4vY29uZGl0aW9uX2V2YWx1YXRvcic7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBDb25maWd9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcn0gZnJvbSAnLi9wdWxsYXBwcm92ZV9hcnJheXMnO1xuXG4vKiogQSBjb25kaXRpb24gZm9yIGEgZ3JvdXAuICovXG5pbnRlcmZhY2UgR3JvdXBDb25kaXRpb24ge1xuICBleHByZXNzaW9uOiBzdHJpbmc7XG4gIGNoZWNrRm46IChmaWxlczogc3RyaW5nW10sIGdyb3VwczogUHVsbEFwcHJvdmVHcm91cFtdKSA9PiBib29sZWFuO1xuICBtYXRjaGVkRmlsZXM6IFNldDxzdHJpbmc+O1xuICB1bnZlcmlmaWFibGU6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBHcm91cFJldmlld2VycyB7XG4gIHVzZXJzPzogc3RyaW5nW107XG4gIHRlYW1zPzogc3RyaW5nW107XG59XG5cbi8qKiBSZXN1bHQgb2YgdGVzdGluZyBmaWxlcyBhZ2FpbnN0IHRoZSBncm91cC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbEFwcHJvdmVHcm91cFJlc3VsdCB7XG4gIGdyb3VwTmFtZTogc3RyaW5nO1xuICBtYXRjaGVkQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbiAgbWF0Y2hlZENvdW50OiBudW1iZXI7XG4gIHVubWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZENvdW50OiBudW1iZXI7XG4gIHVudmVyaWZpYWJsZUNvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG59XG5cbi8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgY29uZGl0aW9ucyBmb3IgdGhlIGdsb2JhbCBhcHByb3ZhbC5cbmNvbnN0IEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVggPSAvXlwiZ2xvYmFsLShkb2NzLSk/YXBwcm92ZXJzXCIgbm90IGluIGdyb3Vwcy5hcHByb3ZlZCQvO1xuXG4vKiogQSBQdWxsQXBwcm92ZSBncm91cCB0byBiZSBhYmxlIHRvIHRlc3QgZmlsZXMgYWdhaW5zdC4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwIHtcbiAgLyoqIExpc3Qgb2YgY29uZGl0aW9ucyBmb3IgdGhlIGdyb3VwLiAqL1xuICByZWFkb25seSBjb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdID0gW107XG4gIC8qKiBMaXN0IG9mIHJldmlld2VycyBmb3IgdGhlIGdyb3VwLiAqL1xuICByZWFkb25seSByZXZpZXdlcnM6IEdyb3VwUmV2aWV3ZXJzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBncm91cE5hbWU6IHN0cmluZyxcbiAgICBjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcsXG4gICAgcmVhZG9ubHkgcHJlY2VkaW5nR3JvdXBzOiBQdWxsQXBwcm92ZUdyb3VwW10gPSBbXSxcbiAgKSB7XG4gICAgdGhpcy5fY2FwdHVyZUNvbmRpdGlvbnMoY29uZmlnKTtcbiAgICB0aGlzLnJldmlld2VycyA9IGNvbmZpZy5yZXZpZXdlcnMgPz8ge3VzZXJzOiBbXSwgdGVhbXM6IFtdfTtcbiAgfVxuXG4gIHByaXZhdGUgX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZzogUHVsbEFwcHJvdmVHcm91cENvbmZpZykge1xuICAgIGlmIChjb25maWcuY29uZGl0aW9ucykge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb25kaXRpb25zLmZvckVhY2goKGNvbmRpdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gY29uZGl0aW9uLnRyaW0oKTtcblxuICAgICAgICBpZiAoZXhwcmVzc2lvbi5tYXRjaChHTE9CQUxfQVBQUk9WQUxfQ09ORElUSU9OX1JFR0VYKSkge1xuICAgICAgICAgIC8vIEN1cnJlbnRseSBhIG5vb3AgYXMgd2UgZG9uJ3QgdGFrZSBhbnkgYWN0aW9uIGZvciBnbG9iYWwgYXBwcm92YWwgY29uZGl0aW9ucy5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY29uZGl0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGV4cHJlc3Npb24sXG4gICAgICAgICAgICBjaGVja0ZuOiBjb252ZXJ0Q29uZGl0aW9uVG9GdW5jdGlvbihleHByZXNzaW9uKSxcbiAgICAgICAgICAgIG1hdGNoZWRGaWxlczogbmV3IFNldCgpLFxuICAgICAgICAgICAgdW52ZXJpZmlhYmxlOiBmYWxzZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGVycm9yKGBDb3VsZCBub3QgcGFyc2UgY29uZGl0aW9uIGluIGdyb3VwOiAke3RoaXMuZ3JvdXBOYW1lfWApO1xuICAgICAgICAgIGVycm9yKGAgLSAke2V4cHJlc3Npb259YCk7XG4gICAgICAgICAgZXJyb3IoYEVycm9yOmAsIGUpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgcHJvdmlkZWQgZmlsZSBwYXRoIHRvIGRldGVybWluZSBpZiBpdCB3b3VsZCBiZSBjb25zaWRlcmVkIG1hdGNoZWQgYnlcbiAgICogdGhlIHB1bGwgYXBwcm92ZSBncm91cCdzIGNvbmRpdGlvbnMuXG4gICAqL1xuICB0ZXN0RmlsZShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZGl0aW9ucy5ldmVyeSgoY29uZGl0aW9uKSA9PiB7XG4gICAgICBjb25zdCB7bWF0Y2hlZEZpbGVzLCBjaGVja0ZuLCBleHByZXNzaW9ufSA9IGNvbmRpdGlvbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXNGaWxlID0gY2hlY2tGbihbZmlsZVBhdGhdLCB0aGlzLnByZWNlZGluZ0dyb3Vwcyk7XG4gICAgICAgIGlmIChtYXRjaGVzRmlsZSkge1xuICAgICAgICAgIG1hdGNoZWRGaWxlcy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRjaGVzRmlsZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYSBjb25kaXRpb24gdGhhdCBkZXBlbmRzIG9uIHRoZSBzdGF0ZSBvZiBncm91cHMgd2Ugd2FudCB0b1xuICAgICAgICAvLyBpZ25vcmUgdGhhdCB0aGUgdmVyaWZpY2F0aW9uIGNhbid0IGFjY3VyYXRlbHkgZXZhbHVhdGUgdGhlIGNvbmRpdGlvbiBhbmQgdGhlblxuICAgICAgICAvLyBjb250aW51ZSBwcm9jZXNzaW5nLiBPdGhlciB0eXBlcyBvZiBlcnJvcnMgZmFpbCB0aGUgdmVyaWZpY2F0aW9uLCBhcyBjb25kaXRpb25zXG4gICAgICAgIC8vIHNob3VsZCBvdGhlcndpc2UgYmUgYWJsZSB0byBleGVjdXRlIHdpdGhvdXQgdGhyb3dpbmcuXG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yKSB7XG4gICAgICAgICAgY29uZGl0aW9uLnVudmVyaWZpYWJsZSA9IHRydWU7XG4gICAgICAgICAgLy8gUmV0dXJuIHRydWUgc28gdGhhdCBgdGhpcy5jb25kaXRpb25zLmV2ZXJ5YCBjYW4gY29udGludWUgZXZhbHVhdGluZy5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJNZXNzYWdlID1cbiAgICAgICAgICAgIGBDb25kaXRpb24gY291bGQgbm90IGJlIGV2YWx1YXRlZDogXFxuXFxuYCArXG4gICAgICAgICAgICBgRnJvbSB0aGUgWyR7dGhpcy5ncm91cE5hbWV9XSBncm91cDpcXG5gICtcbiAgICAgICAgICAgIGAgLSAke2V4cHJlc3Npb259YDtcbiAgICAgICAgICBlcnJvcihlcnJNZXNzYWdlLCAnXFxuXFxuJywgZSwgJ1xcblxcbicpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoKGMpID0+IGMubWF0Y2hlZEZpbGVzLnNpemUgPiAwKTtcbiAgICBjb25zdCB1bm1hdGNoZWRDb25kaXRpb25zID0gdGhpcy5jb25kaXRpb25zLmZpbHRlcihcbiAgICAgIChjKSA9PiBjLm1hdGNoZWRGaWxlcy5zaXplID09PSAwICYmICFjLnVudmVyaWZpYWJsZSxcbiAgICApO1xuICAgIGNvbnN0IHVudmVyaWZpYWJsZUNvbmRpdGlvbnMgPSB0aGlzLmNvbmRpdGlvbnMuZmlsdGVyKChjKSA9PiBjLnVudmVyaWZpYWJsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgbWF0Y2hlZENvdW50OiBtYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGgsXG4gICAgICB1bm1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgdW5tYXRjaGVkQ291bnQ6IHVubWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW52ZXJpZmlhYmxlQ29uZGl0aW9ucyxcbiAgICAgIGdyb3VwTmFtZTogdGhpcy5ncm91cE5hbWUsXG4gICAgfTtcbiAgfVxufVxuIl19