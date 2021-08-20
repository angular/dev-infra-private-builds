"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMIT_TYPES = exports.ReleaseNotesLevel = exports.ScopeRequirement = exports.assertValidCommitMessageConfig = void 0;
const config_1 = require("../utils/config");
/** Assert the provided config contains a `CommitMessageConfig`. */
function assertValidCommitMessageConfig(config) {
    if (config.commitMessage === undefined) {
        throw new config_1.ConfigValidationError(`No configuration defined for "commitMessage"`);
    }
}
exports.assertValidCommitMessageConfig = assertValidCommitMessageConfig;
/** Scope requirement level to be set for each commit type. */
var ScopeRequirement;
(function (ScopeRequirement) {
    ScopeRequirement[ScopeRequirement["Required"] = 0] = "Required";
    ScopeRequirement[ScopeRequirement["Optional"] = 1] = "Optional";
    ScopeRequirement[ScopeRequirement["Forbidden"] = 2] = "Forbidden";
})(ScopeRequirement = exports.ScopeRequirement || (exports.ScopeRequirement = {}));
var ReleaseNotesLevel;
(function (ReleaseNotesLevel) {
    ReleaseNotesLevel[ReleaseNotesLevel["Hidden"] = 0] = "Hidden";
    ReleaseNotesLevel[ReleaseNotesLevel["Visible"] = 1] = "Visible";
})(ReleaseNotesLevel = exports.ReleaseNotesLevel || (exports.ReleaseNotesLevel = {}));
/** The valid commit types for Angular commit messages. */
exports.COMMIT_TYPES = {
    build: {
        name: 'build',
        description: 'Changes to local repository build system and tooling',
        scope: ScopeRequirement.Optional,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    ci: {
        name: 'ci',
        description: 'Changes to CI configuration and CI specific tooling',
        scope: ScopeRequirement.Forbidden,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    docs: {
        name: 'docs',
        description: 'Changes which exclusively affects documentation.',
        scope: ScopeRequirement.Optional,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    feat: {
        name: 'feat',
        description: 'Creates a new feature',
        scope: ScopeRequirement.Required,
        releaseNotesLevel: ReleaseNotesLevel.Visible,
    },
    fix: {
        name: 'fix',
        description: 'Fixes a previously discovered failure/bug',
        scope: ScopeRequirement.Required,
        releaseNotesLevel: ReleaseNotesLevel.Visible,
    },
    perf: {
        name: 'perf',
        description: 'Improves performance without any change in functionality or API',
        scope: ScopeRequirement.Required,
        releaseNotesLevel: ReleaseNotesLevel.Visible,
    },
    refactor: {
        name: 'refactor',
        description: 'Refactor without any change in functionality or API (includes style changes)',
        scope: ScopeRequirement.Optional,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    release: {
        name: 'release',
        description: 'A release point in the repository',
        scope: ScopeRequirement.Forbidden,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    test: {
        name: 'test',
        description: "Improvements or corrections made to the project's test suite",
        scope: ScopeRequirement.Optional,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCw0Q0FBc0Q7QUFVdEQsbUVBQW1FO0FBQ25FLFNBQWdCLDhCQUE4QixDQUM1QyxNQUF5RDtJQUV6RCxJQUFJLE1BQU0sQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO1FBQ3RDLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0tBQ2pGO0FBQ0gsQ0FBQztBQU5ELHdFQU1DO0FBRUQsOERBQThEO0FBQzlELElBQVksZ0JBSVg7QUFKRCxXQUFZLGdCQUFnQjtJQUMxQiwrREFBUSxDQUFBO0lBQ1IsK0RBQVEsQ0FBQTtJQUNSLGlFQUFTLENBQUE7QUFDWCxDQUFDLEVBSlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFJM0I7QUFFRCxJQUFZLGlCQUdYO0FBSEQsV0FBWSxpQkFBaUI7SUFDM0IsNkRBQU0sQ0FBQTtJQUNOLCtEQUFPLENBQUE7QUFDVCxDQUFDLEVBSFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFHNUI7QUFVRCwwREFBMEQ7QUFDN0MsUUFBQSxZQUFZLEdBQWdDO0lBQ3ZELEtBQUssRUFBRTtRQUNMLElBQUksRUFBRSxPQUFPO1FBQ2IsV0FBVyxFQUFFLHNEQUFzRDtRQUNuRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO0tBQzVDO0lBQ0QsRUFBRSxFQUFFO1FBQ0YsSUFBSSxFQUFFLElBQUk7UUFDVixXQUFXLEVBQUUscURBQXFEO1FBQ2xFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTO1FBQ2pDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07S0FDNUM7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsTUFBTTtRQUNaLFdBQVcsRUFBRSxrREFBa0Q7UUFDL0QsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtLQUM1QztJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxNQUFNO1FBQ1osV0FBVyxFQUFFLHVCQUF1QjtRQUNwQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO0tBQzdDO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsMkNBQTJDO1FBQ3hELEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1FBQ2hDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE9BQU87S0FDN0M7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsTUFBTTtRQUNaLFdBQVcsRUFBRSxpRUFBaUU7UUFDOUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsT0FBTztLQUM3QztJQUNELFFBQVEsRUFBRTtRQUNSLElBQUksRUFBRSxVQUFVO1FBQ2hCLFdBQVcsRUFBRSw4RUFBOEU7UUFDM0YsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtLQUM1QztJQUNELE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUFFLG1DQUFtQztRQUNoRCxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztRQUNqQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO0tBQzVDO0lBQ0QsSUFBSSxFQUFFO1FBQ0osSUFBSSxFQUFFLE1BQU07UUFDWixXQUFXLEVBQUUsOERBQThEO1FBQzNFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1FBQ2hDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07S0FDNUM7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uZmlnVmFsaWRhdGlvbkVycm9yfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgY29tbWl0LW1lc3NhZ2UgY29tYW5kcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0TWVzc2FnZUNvbmZpZyB7XG4gIG1heExpbmVMZW5ndGg6IG51bWJlcjtcbiAgbWluQm9keUxlbmd0aDogbnVtYmVyO1xuICBtaW5Cb2R5TGVuZ3RoVHlwZUV4Y2x1ZGVzPzogc3RyaW5nW107XG4gIHNjb3Blczogc3RyaW5nW107XG59XG5cbi8qKiBBc3NlcnQgdGhlIHByb3ZpZGVkIGNvbmZpZyBjb250YWlucyBhIGBDb21taXRNZXNzYWdlQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZENvbW1pdE1lc3NhZ2VDb25maWc8VD4oXG4gIGNvbmZpZzogVCAmIFBhcnRpYWw8e2NvbW1pdE1lc3NhZ2U6IENvbW1pdE1lc3NhZ2VDb25maWd9Pixcbik6IGFzc2VydHMgY29uZmlnIGlzIFQgJiB7Y29tbWl0TWVzc2FnZTogQ29tbWl0TWVzc2FnZUNvbmZpZ30ge1xuICBpZiAoY29uZmlnLmNvbW1pdE1lc3NhZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBDb25maWdWYWxpZGF0aW9uRXJyb3IoYE5vIGNvbmZpZ3VyYXRpb24gZGVmaW5lZCBmb3IgXCJjb21taXRNZXNzYWdlXCJgKTtcbiAgfVxufVxuXG4vKiogU2NvcGUgcmVxdWlyZW1lbnQgbGV2ZWwgdG8gYmUgc2V0IGZvciBlYWNoIGNvbW1pdCB0eXBlLiAqL1xuZXhwb3J0IGVudW0gU2NvcGVSZXF1aXJlbWVudCB7XG4gIFJlcXVpcmVkLFxuICBPcHRpb25hbCxcbiAgRm9yYmlkZGVuLFxufVxuXG5leHBvcnQgZW51bSBSZWxlYXNlTm90ZXNMZXZlbCB7XG4gIEhpZGRlbixcbiAgVmlzaWJsZSxcbn1cblxuLyoqIEEgY29tbWl0IHR5cGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0VHlwZSB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQ7XG4gIHJlbGVhc2VOb3Rlc0xldmVsOiBSZWxlYXNlTm90ZXNMZXZlbDtcbn1cblxuLyoqIFRoZSB2YWxpZCBjb21taXQgdHlwZXMgZm9yIEFuZ3VsYXIgY29tbWl0IG1lc3NhZ2VzLiAqL1xuZXhwb3J0IGNvbnN0IENPTU1JVF9UWVBFUzoge1trZXk6IHN0cmluZ106IENvbW1pdFR5cGV9ID0ge1xuICBidWlsZDoge1xuICAgIG5hbWU6ICdidWlsZCcsXG4gICAgZGVzY3JpcHRpb246ICdDaGFuZ2VzIHRvIGxvY2FsIHJlcG9zaXRvcnkgYnVpbGQgc3lzdGVtIGFuZCB0b29saW5nJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxuICBjaToge1xuICAgIG5hbWU6ICdjaScsXG4gICAgZGVzY3JpcHRpb246ICdDaGFuZ2VzIHRvIENJIGNvbmZpZ3VyYXRpb24gYW5kIENJIHNwZWNpZmljIHRvb2xpbmcnLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbixcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxuICBkb2NzOiB7XG4gICAgbmFtZTogJ2RvY3MnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlcyB3aGljaCBleGNsdXNpdmVseSBhZmZlY3RzIGRvY3VtZW50YXRpb24uJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxuICBmZWF0OiB7XG4gICAgbmFtZTogJ2ZlYXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlcyBhIG5ldyBmZWF0dXJlJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuVmlzaWJsZSxcbiAgfSxcbiAgZml4OiB7XG4gICAgbmFtZTogJ2ZpeCcsXG4gICAgZGVzY3JpcHRpb246ICdGaXhlcyBhIHByZXZpb3VzbHkgZGlzY292ZXJlZCBmYWlsdXJlL2J1ZycsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLlZpc2libGUsXG4gIH0sXG4gIHBlcmY6IHtcbiAgICBuYW1lOiAncGVyZicsXG4gICAgZGVzY3JpcHRpb246ICdJbXByb3ZlcyBwZXJmb3JtYW5jZSB3aXRob3V0IGFueSBjaGFuZ2UgaW4gZnVuY3Rpb25hbGl0eSBvciBBUEknLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICAgIHJlbGVhc2VOb3Rlc0xldmVsOiBSZWxlYXNlTm90ZXNMZXZlbC5WaXNpYmxlLFxuICB9LFxuICByZWZhY3Rvcjoge1xuICAgIG5hbWU6ICdyZWZhY3RvcicsXG4gICAgZGVzY3JpcHRpb246ICdSZWZhY3RvciB3aXRob3V0IGFueSBjaGFuZ2UgaW4gZnVuY3Rpb25hbGl0eSBvciBBUEkgKGluY2x1ZGVzIHN0eWxlIGNoYW5nZXMpJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxuICByZWxlYXNlOiB7XG4gICAgbmFtZTogJ3JlbGVhc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnQSByZWxlYXNlIHBvaW50IGluIHRoZSByZXBvc2l0b3J5JyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4sXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgdGVzdDoge1xuICAgIG5hbWU6ICd0ZXN0JyxcbiAgICBkZXNjcmlwdGlvbjogXCJJbXByb3ZlbWVudHMgb3IgY29ycmVjdGlvbnMgbWFkZSB0byB0aGUgcHJvamVjdCdzIHRlc3Qgc3VpdGVcIixcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxufTtcbiJdfQ==