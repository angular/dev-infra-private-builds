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
                        checkFn: condition_evaluator_1.convertConditionToFunction(expression),
                        matchedFiles: new Set(),
                        unverifiable: false,
                    });
                }
                catch (e) {
                    console_1.error(`Could not parse condition in group: ${this.groupName}`);
                    console_1.error(` - ${expression}`);
                    console_1.error(`Error:`);
                    console_1.error(e.message);
                    console_1.error(e.stack);
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
                        ` - ${expression}` +
                        `\n\n${e.message} ${e.stack}\n\n`;
                    console_1.error(errMessage);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsOENBQXVDO0FBQ3ZDLCtEQUFpRTtBQUVqRSw2REFBMEU7QUF5QjFFLHNFQUFzRTtBQUN0RSxNQUFNLCtCQUErQixHQUFHLHFEQUFxRCxDQUFDO0FBRTlGLDREQUE0RDtBQUM1RCxNQUFhLGdCQUFnQjtJQU0zQixZQUNTLFNBQWlCLEVBQ3hCLE1BQThCLEVBQ3JCLGtCQUFzQyxFQUFFO1FBRjFDLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFFZixvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7UUFSbkQsd0NBQXdDO1FBQy9CLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1FBU3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsTUFBOEI7UUFDdkQsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3JCLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVwQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsRUFBRTtvQkFDckQsK0VBQStFO29CQUMvRSxPQUFPO2lCQUNSO2dCQUVELElBQUk7b0JBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQ25CLFVBQVU7d0JBQ1YsT0FBTyxFQUFFLGdEQUEwQixDQUFDLFVBQVUsQ0FBQzt3QkFDL0MsWUFBWSxFQUFFLElBQUksR0FBRyxFQUFFO3dCQUN2QixZQUFZLEVBQUUsS0FBSztxQkFDcEIsQ0FBQyxDQUFDO2lCQUNKO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNWLGVBQUssQ0FBQyx1Q0FBdUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7b0JBQy9ELGVBQUssQ0FBQyxNQUFNLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQzFCLGVBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDaEIsZUFBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDakIsZUFBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqQjtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUSxDQUFDLFFBQWdCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUN6QyxNQUFNLEVBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUMsR0FBRyxTQUFTLENBQUM7WUFDdEQsSUFBSTtnQkFDRixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzlELElBQUksV0FBVyxFQUFFO29CQUNmLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzVCO2dCQUNELE9BQU8sV0FBVyxDQUFDO2FBQ3BCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsNEVBQTRFO2dCQUM1RSxnRkFBZ0Y7Z0JBQ2hGLGtGQUFrRjtnQkFDbEYsd0RBQXdEO2dCQUN4RCxJQUFJLENBQUMsWUFBWSx5REFBb0MsRUFBRTtvQkFDckQsU0FBUyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7b0JBQzlCLHVFQUF1RTtvQkFDdkUsT0FBTyxJQUFJLENBQUM7aUJBQ2I7cUJBQU07b0JBQ0wsTUFBTSxVQUFVLEdBQ2Qsd0NBQXdDO3dCQUN4QyxhQUFhLElBQUksQ0FBQyxTQUFTLFlBQVk7d0JBQ3ZDLE1BQU0sVUFBVSxFQUFFO3dCQUNsQixPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDO29CQUNwQyxlQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxnRkFBZ0Y7SUFDaEYsVUFBVTtRQUNSLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQ2hELENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUNwRCxDQUFDO1FBQ0YsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzdFLE9BQU87WUFDTCxpQkFBaUI7WUFDakIsWUFBWSxFQUFFLGlCQUFpQixDQUFDLE1BQU07WUFDdEMsbUJBQW1CO1lBQ25CLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNO1lBQzFDLHNCQUFzQjtZQUN0QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7U0FDMUIsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQS9GRCw0Q0ErRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2NvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9ufSBmcm9tICcuL2NvbmRpdGlvbl9ldmFsdWF0b3InO1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwQ29uZmlnfSBmcm9tICcuL3BhcnNlLXlhbWwnO1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3J9IGZyb20gJy4vcHVsbGFwcHJvdmVfYXJyYXlzJztcblxuLyoqIEEgY29uZGl0aW9uIGZvciBhIGdyb3VwLiAqL1xuaW50ZXJmYWNlIEdyb3VwQ29uZGl0aW9uIHtcbiAgZXhwcmVzc2lvbjogc3RyaW5nO1xuICBjaGVja0ZuOiAoZmlsZXM6IHN0cmluZ1tdLCBncm91cHM6IFB1bGxBcHByb3ZlR3JvdXBbXSkgPT4gYm9vbGVhbjtcbiAgbWF0Y2hlZEZpbGVzOiBTZXQ8c3RyaW5nPjtcbiAgdW52ZXJpZmlhYmxlOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgR3JvdXBSZXZpZXdlcnMge1xuICB1c2Vycz86IHN0cmluZ1tdO1xuICB0ZWFtcz86IHN0cmluZ1tdO1xufVxuXG4vKiogUmVzdWx0IG9mIHRlc3RpbmcgZmlsZXMgYWdhaW5zdCB0aGUgZ3JvdXAuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICBncm91cE5hbWU6IHN0cmluZztcbiAgbWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIG1hdGNoZWRDb3VudDogbnVtYmVyO1xuICB1bm1hdGNoZWRDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xuICB1bm1hdGNoZWRDb3VudDogbnVtYmVyO1xuICB1bnZlcmlmaWFibGVDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xufVxuXG4vLyBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIGNvbmRpdGlvbnMgZm9yIHRoZSBnbG9iYWwgYXBwcm92YWwuXG5jb25zdCBHTE9CQUxfQVBQUk9WQUxfQ09ORElUSU9OX1JFR0VYID0gL15cImdsb2JhbC0oZG9jcy0pP2FwcHJvdmVyc1wiIG5vdCBpbiBncm91cHMuYXBwcm92ZWQkLztcblxuLyoqIEEgUHVsbEFwcHJvdmUgZ3JvdXAgdG8gYmUgYWJsZSB0byB0ZXN0IGZpbGVzIGFnYWluc3QuICovXG5leHBvcnQgY2xhc3MgUHVsbEFwcHJvdmVHcm91cCB7XG4gIC8qKiBMaXN0IG9mIGNvbmRpdGlvbnMgZm9yIHRoZSBncm91cC4gKi9cbiAgcmVhZG9ubHkgY29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuICAvKiogTGlzdCBvZiByZXZpZXdlcnMgZm9yIHRoZSBncm91cC4gKi9cbiAgcmVhZG9ubHkgcmV2aWV3ZXJzOiBHcm91cFJldmlld2VycztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZ3JvdXBOYW1lOiBzdHJpbmcsXG4gICAgY29uZmlnOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnLFxuICAgIHJlYWRvbmx5IHByZWNlZGluZ0dyb3VwczogUHVsbEFwcHJvdmVHcm91cFtdID0gW10sXG4gICkge1xuICAgIHRoaXMuX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZyk7XG4gICAgdGhpcy5yZXZpZXdlcnMgPSBjb25maWcucmV2aWV3ZXJzID8/IHt1c2VyczogW10sIHRlYW1zOiBbXX07XG4gIH1cblxuICBwcml2YXRlIF9jYXB0dXJlQ29uZGl0aW9ucyhjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcpIHtcbiAgICBpZiAoY29uZmlnLmNvbmRpdGlvbnMpIHtcbiAgICAgIHJldHVybiBjb25maWcuY29uZGl0aW9ucy5mb3JFYWNoKChjb25kaXRpb24pID0+IHtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IGNvbmRpdGlvbi50cmltKCk7XG5cbiAgICAgICAgaWYgKGV4cHJlc3Npb24ubWF0Y2goR0xPQkFMX0FQUFJPVkFMX0NPTkRJVElPTl9SRUdFWCkpIHtcbiAgICAgICAgICAvLyBDdXJyZW50bHkgYSBub29wIGFzIHdlIGRvbid0IHRha2UgYW55IGFjdGlvbiBmb3IgZ2xvYmFsIGFwcHJvdmFsIGNvbmRpdGlvbnMuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICAgICAgY2hlY2tGbjogY29udmVydENvbmRpdGlvblRvRnVuY3Rpb24oZXhwcmVzc2lvbiksXG4gICAgICAgICAgICBtYXRjaGVkRmlsZXM6IG5ldyBTZXQoKSxcbiAgICAgICAgICAgIHVudmVyaWZpYWJsZTogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBlcnJvcihgQ291bGQgbm90IHBhcnNlIGNvbmRpdGlvbiBpbiBncm91cDogJHt0aGlzLmdyb3VwTmFtZX1gKTtcbiAgICAgICAgICBlcnJvcihgIC0gJHtleHByZXNzaW9ufWApO1xuICAgICAgICAgIGVycm9yKGBFcnJvcjpgKTtcbiAgICAgICAgICBlcnJvcihlLm1lc3NhZ2UpO1xuICAgICAgICAgIGVycm9yKGUuc3RhY2spO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgcHJvdmlkZWQgZmlsZSBwYXRoIHRvIGRldGVybWluZSBpZiBpdCB3b3VsZCBiZSBjb25zaWRlcmVkIG1hdGNoZWQgYnlcbiAgICogdGhlIHB1bGwgYXBwcm92ZSBncm91cCdzIGNvbmRpdGlvbnMuXG4gICAqL1xuICB0ZXN0RmlsZShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZGl0aW9ucy5ldmVyeSgoY29uZGl0aW9uKSA9PiB7XG4gICAgICBjb25zdCB7bWF0Y2hlZEZpbGVzLCBjaGVja0ZuLCBleHByZXNzaW9ufSA9IGNvbmRpdGlvbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXNGaWxlID0gY2hlY2tGbihbZmlsZVBhdGhdLCB0aGlzLnByZWNlZGluZ0dyb3Vwcyk7XG4gICAgICAgIGlmIChtYXRjaGVzRmlsZSkge1xuICAgICAgICAgIG1hdGNoZWRGaWxlcy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRjaGVzRmlsZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYSBjb25kaXRpb24gdGhhdCBkZXBlbmRzIG9uIHRoZSBzdGF0ZSBvZiBncm91cHMgd2Ugd2FudCB0b1xuICAgICAgICAvLyBpZ25vcmUgdGhhdCB0aGUgdmVyaWZpY2F0aW9uIGNhbid0IGFjY3VyYXRlbHkgZXZhbHVhdGUgdGhlIGNvbmRpdGlvbiBhbmQgdGhlblxuICAgICAgICAvLyBjb250aW51ZSBwcm9jZXNzaW5nLiBPdGhlciB0eXBlcyBvZiBlcnJvcnMgZmFpbCB0aGUgdmVyaWZpY2F0aW9uLCBhcyBjb25kaXRpb25zXG4gICAgICAgIC8vIHNob3VsZCBvdGhlcndpc2UgYmUgYWJsZSB0byBleGVjdXRlIHdpdGhvdXQgdGhyb3dpbmcuXG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yKSB7XG4gICAgICAgICAgY29uZGl0aW9uLnVudmVyaWZpYWJsZSA9IHRydWU7XG4gICAgICAgICAgLy8gUmV0dXJuIHRydWUgc28gdGhhdCBgdGhpcy5jb25kaXRpb25zLmV2ZXJ5YCBjYW4gY29udGludWUgZXZhbHVhdGluZy5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJNZXNzYWdlID1cbiAgICAgICAgICAgIGBDb25kaXRpb24gY291bGQgbm90IGJlIGV2YWx1YXRlZDogXFxuXFxuYCArXG4gICAgICAgICAgICBgRnJvbSB0aGUgWyR7dGhpcy5ncm91cE5hbWV9XSBncm91cDpcXG5gICtcbiAgICAgICAgICAgIGAgLSAke2V4cHJlc3Npb259YCArXG4gICAgICAgICAgICBgXFxuXFxuJHtlLm1lc3NhZ2V9ICR7ZS5zdGFja31cXG5cXG5gO1xuICAgICAgICAgIGVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoKGMpID0+IGMubWF0Y2hlZEZpbGVzLnNpemUgPiAwKTtcbiAgICBjb25zdCB1bm1hdGNoZWRDb25kaXRpb25zID0gdGhpcy5jb25kaXRpb25zLmZpbHRlcihcbiAgICAgIChjKSA9PiBjLm1hdGNoZWRGaWxlcy5zaXplID09PSAwICYmICFjLnVudmVyaWZpYWJsZSxcbiAgICApO1xuICAgIGNvbnN0IHVudmVyaWZpYWJsZUNvbmRpdGlvbnMgPSB0aGlzLmNvbmRpdGlvbnMuZmlsdGVyKChjKSA9PiBjLnVudmVyaWZpYWJsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgbWF0Y2hlZENvdW50OiBtYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGgsXG4gICAgICB1bm1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgdW5tYXRjaGVkQ291bnQ6IHVubWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW52ZXJpZmlhYmxlQ29uZGl0aW9ucyxcbiAgICAgIGdyb3VwTmFtZTogdGhpcy5ncm91cE5hbWUsXG4gICAgfTtcbiAgfVxufVxuIl19