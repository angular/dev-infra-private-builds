/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/config", ["require", "exports", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.COMMIT_TYPES = exports.ReleaseNotesLevel = exports.ScopeRequirement = exports.getCommitMessageConfig = void 0;
    var config_1 = require("@angular/dev-infra-private/utils/config");
    /** Retrieve and validate the config as `CommitMessageConfig`. */
    function getCommitMessageConfig() {
        // List of errors encountered validating the config.
        var errors = [];
        // The non-validated config object.
        var config = config_1.getConfig();
        if (config.commitMessage === undefined) {
            errors.push("No configuration defined for \"commitMessage\"");
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
            description: 'Improvements or corrections made to the project\'s test suite',
            scope: ScopeRequirement.Optional,
            releaseNotesLevel: ReleaseNotesLevel.Hidden,
        },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBdUU7SUFVdkUsaUVBQWlFO0lBQ2pFLFNBQWdCLHNCQUFzQjtRQUNwQyxvREFBb0Q7UUFDcEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLG1DQUFtQztRQUNuQyxJQUFNLE1BQU0sR0FBK0Qsa0JBQVMsRUFBRSxDQUFDO1FBRXZGLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnREFBOEMsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQWlDLENBQUM7SUFDM0MsQ0FBQztJQVpELHdEQVlDO0lBRUQsOERBQThEO0lBQzlELElBQVksZ0JBSVg7SUFKRCxXQUFZLGdCQUFnQjtRQUMxQiwrREFBUSxDQUFBO1FBQ1IsK0RBQVEsQ0FBQTtRQUNSLGlFQUFTLENBQUE7SUFDWCxDQUFDLEVBSlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFJM0I7SUFFRCxJQUFZLGlCQUdYO0lBSEQsV0FBWSxpQkFBaUI7UUFDM0IsNkRBQU0sQ0FBQTtRQUNOLCtEQUFPLENBQUE7SUFDVCxDQUFDLEVBSFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFHNUI7SUFVRCwwREFBMEQ7SUFDN0MsUUFBQSxZQUFZLEdBQWdDO1FBQ3ZELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLHNEQUFzRDtZQUNuRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtZQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO1NBQzVDO1FBQ0QsRUFBRSxFQUFFO1lBQ0YsSUFBSSxFQUFFLElBQUk7WUFDVixXQUFXLEVBQUUscURBQXFEO1lBQ2xFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTO1lBQ2pDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07U0FDNUM7UUFDRCxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsTUFBTTtZQUNaLFdBQVcsRUFBRSxrREFBa0Q7WUFDL0QsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7WUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtTQUM1QztRQUNELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLHVCQUF1QjtZQUNwQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtZQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO1NBQzdDO1FBQ0QsR0FBRyxFQUFFO1lBQ0gsSUFBSSxFQUFFLEtBQUs7WUFDWCxXQUFXLEVBQUUsMkNBQTJDO1lBQ3hELEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1lBQ2hDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE9BQU87U0FDN0M7UUFDRCxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsTUFBTTtZQUNaLFdBQVcsRUFBRSxpRUFBaUU7WUFDOUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7WUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsT0FBTztTQUM3QztRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxVQUFVO1lBQ2hCLFdBQVcsRUFBRSw4RUFBOEU7WUFDM0YsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7WUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtTQUM1QztRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztZQUNqQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO1NBQzVDO1FBQ0QsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE1BQU07WUFDWixXQUFXLEVBQUUsK0RBQStEO1lBQzVFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1lBQ2hDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07U0FDNUM7S0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0Tm9FcnJvcnMsIGdldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBjb21taXQtbWVzc2FnZSBjb21hbmRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21taXRNZXNzYWdlQ29uZmlnIHtcbiAgbWF4TGluZUxlbmd0aDogbnVtYmVyO1xuICBtaW5Cb2R5TGVuZ3RoOiBudW1iZXI7XG4gIG1pbkJvZHlMZW5ndGhUeXBlRXhjbHVkZXM/OiBzdHJpbmdbXTtcbiAgc2NvcGVzOiBzdHJpbmdbXTtcbn1cblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBDb21taXRNZXNzYWdlQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIG5vbi12YWxpZGF0ZWQgY29uZmlnIG9iamVjdC5cbiAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPHtjb21taXRNZXNzYWdlOiBDb21taXRNZXNzYWdlQ29uZmlnfT4+ID0gZ2V0Q29uZmlnKCk7XG5cbiAgaWYgKGNvbmZpZy5jb21taXRNZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImNvbW1pdE1lc3NhZ2VcImApO1xuICB9XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBSZXF1aXJlZDx0eXBlb2YgY29uZmlnPjtcbn1cblxuLyoqIFNjb3BlIHJlcXVpcmVtZW50IGxldmVsIHRvIGJlIHNldCBmb3IgZWFjaCBjb21taXQgdHlwZS4gKi9cbmV4cG9ydCBlbnVtIFNjb3BlUmVxdWlyZW1lbnQge1xuICBSZXF1aXJlZCxcbiAgT3B0aW9uYWwsXG4gIEZvcmJpZGRlbixcbn1cblxuZXhwb3J0IGVudW0gUmVsZWFzZU5vdGVzTGV2ZWwge1xuICBIaWRkZW4sXG4gIFZpc2libGUsXG59XG5cbi8qKiBBIGNvbW1pdCB0eXBlICovXG5leHBvcnQgaW50ZXJmYWNlIENvbW1pdFR5cGUge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50O1xuICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWw7XG59XG5cbi8qKiBUaGUgdmFsaWQgY29tbWl0IHR5cGVzIGZvciBBbmd1bGFyIGNvbW1pdCBtZXNzYWdlcy4gKi9cbmV4cG9ydCBjb25zdCBDT01NSVRfVFlQRVM6IHtba2V5OiBzdHJpbmddOiBDb21taXRUeXBlfSA9IHtcbiAgYnVpbGQ6IHtcbiAgICBuYW1lOiAnYnVpbGQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlcyB0byBsb2NhbCByZXBvc2l0b3J5IGJ1aWxkIHN5c3RlbSBhbmQgdG9vbGluZycsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgY2k6IHtcbiAgICBuYW1lOiAnY2knLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlcyB0byBDSSBjb25maWd1cmF0aW9uIGFuZCBDSSBzcGVjaWZpYyB0b29saW5nJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4sXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgZG9jczoge1xuICAgIG5hbWU6ICdkb2NzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZXMgd2hpY2ggZXhjbHVzaXZlbHkgYWZmZWN0cyBkb2N1bWVudGF0aW9uLicsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgZmVhdDoge1xuICAgIG5hbWU6ICdmZWF0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZXMgYSBuZXcgZmVhdHVyZScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLlZpc2libGUsXG4gIH0sXG4gIGZpeDoge1xuICAgIG5hbWU6ICdmaXgnLFxuICAgIGRlc2NyaXB0aW9uOiAnRml4ZXMgYSBwcmV2aW91c2x5IGRpc2NvdmVyZWQgZmFpbHVyZS9idWcnLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICAgIHJlbGVhc2VOb3Rlc0xldmVsOiBSZWxlYXNlTm90ZXNMZXZlbC5WaXNpYmxlLFxuICB9LFxuICBwZXJmOiB7XG4gICAgbmFtZTogJ3BlcmYnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW1wcm92ZXMgcGVyZm9ybWFuY2Ugd2l0aG91dCBhbnkgY2hhbmdlIGluIGZ1bmN0aW9uYWxpdHkgb3IgQVBJJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuVmlzaWJsZSxcbiAgfSxcbiAgcmVmYWN0b3I6IHtcbiAgICBuYW1lOiAncmVmYWN0b3InLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVmYWN0b3Igd2l0aG91dCBhbnkgY2hhbmdlIGluIGZ1bmN0aW9uYWxpdHkgb3IgQVBJIChpbmNsdWRlcyBzdHlsZSBjaGFuZ2VzKScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgcmVsZWFzZToge1xuICAgIG5hbWU6ICdyZWxlYXNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0EgcmVsZWFzZSBwb2ludCBpbiB0aGUgcmVwb3NpdG9yeScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuRm9yYmlkZGVuLFxuICAgIHJlbGVhc2VOb3Rlc0xldmVsOiBSZWxlYXNlTm90ZXNMZXZlbC5IaWRkZW4sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBuYW1lOiAndGVzdCcsXG4gICAgZGVzY3JpcHRpb246ICdJbXByb3ZlbWVudHMgb3IgY29ycmVjdGlvbnMgbWFkZSB0byB0aGUgcHJvamVjdFxcJ3MgdGVzdCBzdWl0ZScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbn07XG4iXX0=