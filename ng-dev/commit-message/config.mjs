"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMIT_TYPES = exports.ReleaseNotesLevel = exports.ScopeRequirement = exports.getCommitMessageConfig = void 0;
const config_1 = require("../utils/config");
/** Retrieve and validate the config as `CommitMessageConfig`. */
function getCommitMessageConfig() {
    // List of errors encountered validating the config.
    const errors = [];
    // The non-validated config object.
    const config = config_1.getConfig();
    if (config.commitMessage === undefined) {
        errors.push(`No configuration defined for "commitMessage"`);
    }
    config_1.assertNoErrors(errors);
    return config;
}
exports.getCommitMessageConfig = getCommitMessageConfig;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCw0Q0FBdUU7QUFVdkUsaUVBQWlFO0FBQ2pFLFNBQWdCLHNCQUFzQjtJQUNwQyxvREFBb0Q7SUFDcEQsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBQzVCLG1DQUFtQztJQUNuQyxNQUFNLE1BQU0sR0FBK0Qsa0JBQVMsRUFBRSxDQUFDO0lBRXZGLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7UUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0tBQzdEO0lBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixPQUFPLE1BQWlDLENBQUM7QUFDM0MsQ0FBQztBQVpELHdEQVlDO0FBRUQsOERBQThEO0FBQzlELElBQVksZ0JBSVg7QUFKRCxXQUFZLGdCQUFnQjtJQUMxQiwrREFBUSxDQUFBO0lBQ1IsK0RBQVEsQ0FBQTtJQUNSLGlFQUFTLENBQUE7QUFDWCxDQUFDLEVBSlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFJM0I7QUFFRCxJQUFZLGlCQUdYO0FBSEQsV0FBWSxpQkFBaUI7SUFDM0IsNkRBQU0sQ0FBQTtJQUNOLCtEQUFPLENBQUE7QUFDVCxDQUFDLEVBSFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFHNUI7QUFVRCwwREFBMEQ7QUFDN0MsUUFBQSxZQUFZLEdBQWdDO0lBQ3ZELEtBQUssRUFBRTtRQUNMLElBQUksRUFBRSxPQUFPO1FBQ2IsV0FBVyxFQUFFLHNEQUFzRDtRQUNuRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO0tBQzVDO0lBQ0QsRUFBRSxFQUFFO1FBQ0YsSUFBSSxFQUFFLElBQUk7UUFDVixXQUFXLEVBQUUscURBQXFEO1FBQ2xFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTO1FBQ2pDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07S0FDNUM7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsTUFBTTtRQUNaLFdBQVcsRUFBRSxrREFBa0Q7UUFDL0QsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtLQUM1QztJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxNQUFNO1FBQ1osV0FBVyxFQUFFLHVCQUF1QjtRQUNwQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO0tBQzdDO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsMkNBQTJDO1FBQ3hELEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1FBQ2hDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE9BQU87S0FDN0M7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsTUFBTTtRQUNaLFdBQVcsRUFBRSxpRUFBaUU7UUFDOUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsT0FBTztLQUM3QztJQUNELFFBQVEsRUFBRTtRQUNSLElBQUksRUFBRSxVQUFVO1FBQ2hCLFdBQVcsRUFBRSw4RUFBOEU7UUFDM0YsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtLQUM1QztJQUNELE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUFFLG1DQUFtQztRQUNoRCxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztRQUNqQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO0tBQzVDO0lBQ0QsSUFBSSxFQUFFO1FBQ0osSUFBSSxFQUFFLE1BQU07UUFDWixXQUFXLEVBQUUsOERBQThEO1FBQzNFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1FBQ2hDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07S0FDNUM7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0Tm9FcnJvcnMsIGdldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBjb21taXQtbWVzc2FnZSBjb21hbmRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21taXRNZXNzYWdlQ29uZmlnIHtcbiAgbWF4TGluZUxlbmd0aDogbnVtYmVyO1xuICBtaW5Cb2R5TGVuZ3RoOiBudW1iZXI7XG4gIG1pbkJvZHlMZW5ndGhUeXBlRXhjbHVkZXM/OiBzdHJpbmdbXTtcbiAgc2NvcGVzOiBzdHJpbmdbXTtcbn1cblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBDb21taXRNZXNzYWdlQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIG5vbi12YWxpZGF0ZWQgY29uZmlnIG9iamVjdC5cbiAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPHtjb21taXRNZXNzYWdlOiBDb21taXRNZXNzYWdlQ29uZmlnfT4+ID0gZ2V0Q29uZmlnKCk7XG5cbiAgaWYgKGNvbmZpZy5jb21taXRNZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImNvbW1pdE1lc3NhZ2VcImApO1xuICB9XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBSZXF1aXJlZDx0eXBlb2YgY29uZmlnPjtcbn1cblxuLyoqIFNjb3BlIHJlcXVpcmVtZW50IGxldmVsIHRvIGJlIHNldCBmb3IgZWFjaCBjb21taXQgdHlwZS4gKi9cbmV4cG9ydCBlbnVtIFNjb3BlUmVxdWlyZW1lbnQge1xuICBSZXF1aXJlZCxcbiAgT3B0aW9uYWwsXG4gIEZvcmJpZGRlbixcbn1cblxuZXhwb3J0IGVudW0gUmVsZWFzZU5vdGVzTGV2ZWwge1xuICBIaWRkZW4sXG4gIFZpc2libGUsXG59XG5cbi8qKiBBIGNvbW1pdCB0eXBlICovXG5leHBvcnQgaW50ZXJmYWNlIENvbW1pdFR5cGUge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50O1xuICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWw7XG59XG5cbi8qKiBUaGUgdmFsaWQgY29tbWl0IHR5cGVzIGZvciBBbmd1bGFyIGNvbW1pdCBtZXNzYWdlcy4gKi9cbmV4cG9ydCBjb25zdCBDT01NSVRfVFlQRVM6IHtba2V5OiBzdHJpbmddOiBDb21taXRUeXBlfSA9IHtcbiAgYnVpbGQ6IHtcbiAgICBuYW1lOiAnYnVpbGQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlcyB0byBsb2NhbCByZXBvc2l0b3J5IGJ1aWxkIHN5c3RlbSBhbmQgdG9vbGluZycsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgY2k6IHtcbiAgICBuYW1lOiAnY2knLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlcyB0byBDSSBjb25maWd1cmF0aW9uIGFuZCBDSSBzcGVjaWZpYyB0b29saW5nJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4sXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgZG9jczoge1xuICAgIG5hbWU6ICdkb2NzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZXMgd2hpY2ggZXhjbHVzaXZlbHkgYWZmZWN0cyBkb2N1bWVudGF0aW9uLicsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgZmVhdDoge1xuICAgIG5hbWU6ICdmZWF0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZXMgYSBuZXcgZmVhdHVyZScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLlZpc2libGUsXG4gIH0sXG4gIGZpeDoge1xuICAgIG5hbWU6ICdmaXgnLFxuICAgIGRlc2NyaXB0aW9uOiAnRml4ZXMgYSBwcmV2aW91c2x5IGRpc2NvdmVyZWQgZmFpbHVyZS9idWcnLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICAgIHJlbGVhc2VOb3Rlc0xldmVsOiBSZWxlYXNlTm90ZXNMZXZlbC5WaXNpYmxlLFxuICB9LFxuICBwZXJmOiB7XG4gICAgbmFtZTogJ3BlcmYnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW1wcm92ZXMgcGVyZm9ybWFuY2Ugd2l0aG91dCBhbnkgY2hhbmdlIGluIGZ1bmN0aW9uYWxpdHkgb3IgQVBJJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuVmlzaWJsZSxcbiAgfSxcbiAgcmVmYWN0b3I6IHtcbiAgICBuYW1lOiAncmVmYWN0b3InLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVmYWN0b3Igd2l0aG91dCBhbnkgY2hhbmdlIGluIGZ1bmN0aW9uYWxpdHkgb3IgQVBJIChpbmNsdWRlcyBzdHlsZSBjaGFuZ2VzKScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgcmVsZWFzZToge1xuICAgIG5hbWU6ICdyZWxlYXNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0EgcmVsZWFzZSBwb2ludCBpbiB0aGUgcmVwb3NpdG9yeScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuRm9yYmlkZGVuLFxuICAgIHJlbGVhc2VOb3Rlc0xldmVsOiBSZWxlYXNlTm90ZXNMZXZlbC5IaWRkZW4sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBuYW1lOiAndGVzdCcsXG4gICAgZGVzY3JpcHRpb246IFwiSW1wcm92ZW1lbnRzIG9yIGNvcnJlY3Rpb25zIG1hZGUgdG8gdGhlIHByb2plY3QncyB0ZXN0IHN1aXRlXCIsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbn07XG4iXX0=