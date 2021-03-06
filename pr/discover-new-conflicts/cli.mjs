/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { error } from '../../utils/console';
import { addGithubTokenOption } from '../../utils/git/github-yargs';
import { discoverNewConflictsForPr } from './index';
/** Builds the discover-new-conflicts pull request command. */
export function buildDiscoverNewConflictsCommand(yargs) {
    return addGithubTokenOption(yargs)
        .option('date', {
        description: 'Only consider PRs updated since provided date',
        defaultDescription: '30 days ago',
        coerce: (date) => typeof date === 'number' ? date : Date.parse(date),
        default: getThirtyDaysAgoDate(),
    })
        .positional('pr-number', { demandOption: true, type: 'number' });
}
/** Handles the discover-new-conflicts pull request command. */
export function handleDiscoverNewConflictsCommand({ 'pr-number': prNumber, date }) {
    return __awaiter(this, void 0, void 0, function* () {
        // If a provided date is not able to be parsed, yargs provides it as NaN.
        if (isNaN(date)) {
            error('Unable to parse the value provided via --date flag');
            process.exit(1);
        }
        yield discoverNewConflictsForPr(prNumber, date);
    });
}
/** Gets a date object 30 days ago from today. */
function getThirtyDaysAgoDate() {
    const date = new Date();
    // Set the hours, minutes and seconds to 0 to only consider date.
    date.setHours(0, 0, 0, 0);
    // Set the date to 30 days in the past.
    date.setDate(date.getDate() - 30);
    return date.getTime();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSCxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDMUMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFbEUsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBUWxELDhEQUE4RDtBQUM5RCxNQUFNLFVBQVUsZ0NBQWdDLENBQUMsS0FBVztJQUUxRCxPQUFPLG9CQUFvQixDQUFDLEtBQUssQ0FBQztTQUM3QixNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsV0FBVyxFQUFFLCtDQUErQztRQUM1RCxrQkFBa0IsRUFBRSxhQUFhO1FBQ2pDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3BFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRTtLQUNoQyxDQUFDO1NBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVELCtEQUErRDtBQUMvRCxNQUFNLFVBQWdCLGlDQUFpQyxDQUNuRCxFQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFnRDs7UUFDOUUseUVBQXlFO1FBQ3pFLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2YsS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7WUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUNELE1BQU0seUJBQXlCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FBQTtBQUVELGlEQUFpRDtBQUNqRCxTQUFTLG9CQUFvQjtJQUMzQixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3hCLGlFQUFpRTtJQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFCLHVDQUF1QztJQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNsQyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2fSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHthZGRHaXRodWJUb2tlbk9wdGlvbn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi15YXJncyc7XG5cbmltcG9ydCB7ZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcn0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgdG8gdGhlIGRpc2NvdmVyLW5ldy1jb25mbGljdHMgY29tbWFuZCB2aWEgQ0xJLiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmRPcHRpb25zIHtcbiAgZGF0ZTogbnVtYmVyO1xuICAncHItbnVtYmVyJzogbnVtYmVyO1xufVxuXG4vKiogQnVpbGRzIHRoZSBkaXNjb3Zlci1uZXctY29uZmxpY3RzIHB1bGwgcmVxdWVzdCBjb21tYW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kKHlhcmdzOiBBcmd2KTpcbiAgICBBcmd2PERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzKVxuICAgICAgLm9wdGlvbignZGF0ZScsIHtcbiAgICAgICAgZGVzY3JpcHRpb246ICdPbmx5IGNvbnNpZGVyIFBScyB1cGRhdGVkIHNpbmNlIHByb3ZpZGVkIGRhdGUnLFxuICAgICAgICBkZWZhdWx0RGVzY3JpcHRpb246ICczMCBkYXlzIGFnbycsXG4gICAgICAgIGNvZXJjZTogKGRhdGUpID0+IHR5cGVvZiBkYXRlID09PSAnbnVtYmVyJyA/IGRhdGUgOiBEYXRlLnBhcnNlKGRhdGUpLFxuICAgICAgICBkZWZhdWx0OiBnZXRUaGlydHlEYXlzQWdvRGF0ZSgpLFxuICAgICAgfSlcbiAgICAgIC5wb3NpdGlvbmFsKCdwci1udW1iZXInLCB7ZGVtYW5kT3B0aW9uOiB0cnVlLCB0eXBlOiAnbnVtYmVyJ30pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQoXG4gICAgeydwci1udW1iZXInOiBwck51bWJlciwgZGF0ZX06IEFyZ3VtZW50czxEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmRPcHRpb25zPikge1xuICAvLyBJZiBhIHByb3ZpZGVkIGRhdGUgaXMgbm90IGFibGUgdG8gYmUgcGFyc2VkLCB5YXJncyBwcm92aWRlcyBpdCBhcyBOYU4uXG4gIGlmIChpc05hTihkYXRlKSkge1xuICAgIGVycm9yKCdVbmFibGUgdG8gcGFyc2UgdGhlIHZhbHVlIHByb3ZpZGVkIHZpYSAtLWRhdGUgZmxhZycpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBhd2FpdCBkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByKHByTnVtYmVyLCBkYXRlKTtcbn1cblxuLyoqIEdldHMgYSBkYXRlIG9iamVjdCAzMCBkYXlzIGFnbyBmcm9tIHRvZGF5LiAqL1xuZnVuY3Rpb24gZ2V0VGhpcnR5RGF5c0Fnb0RhdGUoKSB7XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAvLyBTZXQgdGhlIGhvdXJzLCBtaW51dGVzIGFuZCBzZWNvbmRzIHRvIDAgdG8gb25seSBjb25zaWRlciBkYXRlLlxuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICAvLyBTZXQgdGhlIGRhdGUgdG8gMzAgZGF5cyBpbiB0aGUgcGFzdC5cbiAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gMzApO1xuICByZXR1cm4gZGF0ZS5nZXRUaW1lKCk7XG59XG4iXX0=