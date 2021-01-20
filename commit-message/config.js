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
    exports.COMMIT_TYPES = exports.ScopeRequirement = exports.getCommitMessageConfig = void 0;
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
    /** Scope requirement level to be set for each commit type.  */
    var ScopeRequirement;
    (function (ScopeRequirement) {
        ScopeRequirement[ScopeRequirement["Required"] = 0] = "Required";
        ScopeRequirement[ScopeRequirement["Optional"] = 1] = "Optional";
        ScopeRequirement[ScopeRequirement["Forbidden"] = 2] = "Forbidden";
    })(ScopeRequirement = exports.ScopeRequirement || (exports.ScopeRequirement = {}));
    /** The valid commit types for Angular commit messages. */
    exports.COMMIT_TYPES = {
        build: {
            name: 'build',
            description: 'Changes to local repository build system and tooling',
            scope: ScopeRequirement.Optional,
        },
        ci: {
            name: 'ci',
            description: 'Changes to CI configuration and CI specific tooling',
            scope: ScopeRequirement.Forbidden,
        },
        docs: {
            name: 'docs',
            description: 'Changes which exclusively affects documentation.',
            scope: ScopeRequirement.Optional,
        },
        feat: {
            name: 'feat',
            description: 'Creates a new feature',
            scope: ScopeRequirement.Required,
        },
        fix: {
            name: 'fix',
            description: 'Fixes a previously discovered failure/bug',
            scope: ScopeRequirement.Required,
        },
        perf: {
            name: 'perf',
            description: 'Improves performance without any change in functionality or API',
            scope: ScopeRequirement.Required,
        },
        refactor: {
            name: 'refactor',
            description: 'Refactor without any change in functionality or API (includes style changes)',
            scope: ScopeRequirement.Required,
        },
        release: {
            name: 'release',
            description: 'A release point in the repository',
            scope: ScopeRequirement.Forbidden,
        },
        test: {
            name: 'test',
            description: 'Improvements or corrections made to the project\'s test suite',
            scope: ScopeRequirement.Required,
        },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBdUU7SUFVdkUsaUVBQWlFO0lBQ2pFLFNBQWdCLHNCQUFzQjtRQUNwQyxvREFBb0Q7UUFDcEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLG1DQUFtQztRQUNuQyxJQUFNLE1BQU0sR0FBK0Qsa0JBQVMsRUFBRSxDQUFDO1FBRXZGLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnREFBOEMsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQWlDLENBQUM7SUFDM0MsQ0FBQztJQVpELHdEQVlDO0lBRUQsK0RBQStEO0lBQy9ELElBQVksZ0JBSVg7SUFKRCxXQUFZLGdCQUFnQjtRQUMxQiwrREFBUSxDQUFBO1FBQ1IsK0RBQVEsQ0FBQTtRQUNSLGlFQUFTLENBQUE7SUFDWCxDQUFDLEVBSlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFJM0I7SUFTRCwwREFBMEQ7SUFDN0MsUUFBQSxZQUFZLEdBQWdDO1FBQ3ZELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLHNEQUFzRDtZQUNuRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELEVBQUUsRUFBRTtZQUNGLElBQUksRUFBRSxJQUFJO1lBQ1YsV0FBVyxFQUFFLHFEQUFxRDtZQUNsRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztTQUNsQztRQUNELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLGtEQUFrRDtZQUMvRCxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLHVCQUF1QjtZQUNwQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELEdBQUcsRUFBRTtZQUNILElBQUksRUFBRSxLQUFLO1lBQ1gsV0FBVyxFQUFFLDJDQUEyQztZQUN4RCxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLGlFQUFpRTtZQUM5RSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxVQUFVO1lBQ2hCLFdBQVcsRUFBRSw4RUFBOEU7WUFDM0YsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7U0FDakM7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFNBQVM7U0FDbEM7UUFDRCxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsTUFBTTtZQUNaLFdBQVcsRUFBRSwrREFBK0Q7WUFDNUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7U0FDakM7S0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0Tm9FcnJvcnMsIGdldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBjb21taXQtbWVzc2FnZSBjb21hbmRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21taXRNZXNzYWdlQ29uZmlnIHtcbiAgbWF4TGluZUxlbmd0aDogbnVtYmVyO1xuICBtaW5Cb2R5TGVuZ3RoOiBudW1iZXI7XG4gIG1pbkJvZHlMZW5ndGhUeXBlRXhjbHVkZXM/OiBzdHJpbmdbXTtcbiAgc2NvcGVzOiBzdHJpbmdbXTtcbn1cblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBDb21taXRNZXNzYWdlQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIG5vbi12YWxpZGF0ZWQgY29uZmlnIG9iamVjdC5cbiAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPHtjb21taXRNZXNzYWdlOiBDb21taXRNZXNzYWdlQ29uZmlnfT4+ID0gZ2V0Q29uZmlnKCk7XG5cbiAgaWYgKGNvbmZpZy5jb21taXRNZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImNvbW1pdE1lc3NhZ2VcImApO1xuICB9XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBSZXF1aXJlZDx0eXBlb2YgY29uZmlnPjtcbn1cblxuLyoqIFNjb3BlIHJlcXVpcmVtZW50IGxldmVsIHRvIGJlIHNldCBmb3IgZWFjaCBjb21taXQgdHlwZS4gICovXG5leHBvcnQgZW51bSBTY29wZVJlcXVpcmVtZW50IHtcbiAgUmVxdWlyZWQsXG4gIE9wdGlvbmFsLFxuICBGb3JiaWRkZW4sXG59XG5cbi8qKiBBIGNvbW1pdCB0eXBlICovXG5leHBvcnQgaW50ZXJmYWNlIENvbW1pdFR5cGUge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50O1xufVxuXG4vKiogVGhlIHZhbGlkIGNvbW1pdCB0eXBlcyBmb3IgQW5ndWxhciBjb21taXQgbWVzc2FnZXMuICovXG5leHBvcnQgY29uc3QgQ09NTUlUX1RZUEVTOiB7W2tleTogc3RyaW5nXTogQ29tbWl0VHlwZX0gPSB7XG4gIGJ1aWxkOiB7XG4gICAgbmFtZTogJ2J1aWxkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZXMgdG8gbG9jYWwgcmVwb3NpdG9yeSBidWlsZCBzeXN0ZW0gYW5kIHRvb2xpbmcnLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50Lk9wdGlvbmFsLFxuICB9LFxuICBjaToge1xuICAgIG5hbWU6ICdjaScsXG4gICAgZGVzY3JpcHRpb246ICdDaGFuZ2VzIHRvIENJIGNvbmZpZ3VyYXRpb24gYW5kIENJIHNwZWNpZmljIHRvb2xpbmcnLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbixcbiAgfSxcbiAgZG9jczoge1xuICAgIG5hbWU6ICdkb2NzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZXMgd2hpY2ggZXhjbHVzaXZlbHkgYWZmZWN0cyBkb2N1bWVudGF0aW9uLicsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuT3B0aW9uYWwsXG4gIH0sXG4gIGZlYXQ6IHtcbiAgICBuYW1lOiAnZmVhdCcsXG4gICAgZGVzY3JpcHRpb246ICdDcmVhdGVzIGEgbmV3IGZlYXR1cmUnLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICB9LFxuICBmaXg6IHtcbiAgICBuYW1lOiAnZml4JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZpeGVzIGEgcHJldmlvdXNseSBkaXNjb3ZlcmVkIGZhaWx1cmUvYnVnJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCxcbiAgfSxcbiAgcGVyZjoge1xuICAgIG5hbWU6ICdwZXJmJyxcbiAgICBkZXNjcmlwdGlvbjogJ0ltcHJvdmVzIHBlcmZvcm1hbmNlIHdpdGhvdXQgYW55IGNoYW5nZSBpbiBmdW5jdGlvbmFsaXR5IG9yIEFQSScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gIH0sXG4gIHJlZmFjdG9yOiB7XG4gICAgbmFtZTogJ3JlZmFjdG9yJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlZmFjdG9yIHdpdGhvdXQgYW55IGNoYW5nZSBpbiBmdW5jdGlvbmFsaXR5IG9yIEFQSSAoaW5jbHVkZXMgc3R5bGUgY2hhbmdlcyknLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICB9LFxuICByZWxlYXNlOiB7XG4gICAgbmFtZTogJ3JlbGVhc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnQSByZWxlYXNlIHBvaW50IGluIHRoZSByZXBvc2l0b3J5JyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBuYW1lOiAndGVzdCcsXG4gICAgZGVzY3JpcHRpb246ICdJbXByb3ZlbWVudHMgb3IgY29ycmVjdGlvbnMgbWFkZSB0byB0aGUgcHJvamVjdFxcJ3MgdGVzdCBzdWl0ZScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gIH0sXG59O1xuIl19