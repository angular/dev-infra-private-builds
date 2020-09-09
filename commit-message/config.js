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
            scope: ScopeRequirement.Forbidden,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBdUU7SUFTdkUsaUVBQWlFO0lBQ2pFLFNBQWdCLHNCQUFzQjtRQUNwQyxvREFBb0Q7UUFDcEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLG1DQUFtQztRQUNuQyxJQUFNLE1BQU0sR0FBK0Qsa0JBQVMsRUFBRSxDQUFDO1FBRXZGLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnREFBOEMsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQWlDLENBQUM7SUFDM0MsQ0FBQztJQVpELHdEQVlDO0lBRUQsK0RBQStEO0lBQy9ELElBQVksZ0JBSVg7SUFKRCxXQUFZLGdCQUFnQjtRQUMxQiwrREFBUSxDQUFBO1FBQ1IsK0RBQVEsQ0FBQTtRQUNSLGlFQUFTLENBQUE7SUFDWCxDQUFDLEVBSlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFJM0I7SUFTRCwwREFBMEQ7SUFDN0MsUUFBQSxZQUFZLEdBQWdDO1FBQ3ZELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLHNEQUFzRDtZQUNuRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztTQUNsQztRQUNELEVBQUUsRUFBRTtZQUNGLElBQUksRUFBRSxJQUFJO1lBQ1YsV0FBVyxFQUFFLHFEQUFxRDtZQUNsRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztTQUNsQztRQUNELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLGtEQUFrRDtZQUMvRCxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLHVCQUF1QjtZQUNwQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELEdBQUcsRUFBRTtZQUNILElBQUksRUFBRSxLQUFLO1lBQ1gsV0FBVyxFQUFFLDJDQUEyQztZQUN4RCxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLGlFQUFpRTtZQUM5RSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxVQUFVO1lBQ2hCLFdBQVcsRUFBRSw4RUFBOEU7WUFDM0YsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7U0FDakM7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFNBQVM7U0FDbEM7UUFDRCxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsTUFBTTtZQUNaLFdBQVcsRUFBRSwrREFBK0Q7WUFDNUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7U0FDakM7S0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0Tm9FcnJvcnMsIGdldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0TWVzc2FnZUNvbmZpZyB7XG4gIG1heExpbmVMZW5ndGg6IG51bWJlcjtcbiAgbWluQm9keUxlbmd0aDogbnVtYmVyO1xuICBtaW5Cb2R5TGVuZ3RoVHlwZUV4Y2x1ZGVzPzogc3RyaW5nW107XG4gIHNjb3Blczogc3RyaW5nW107XG59XG5cbi8qKiBSZXRyaWV2ZSBhbmQgdmFsaWRhdGUgdGhlIGNvbmZpZyBhcyBgQ29tbWl0TWVzc2FnZUNvbmZpZ2AuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZygpIHtcbiAgLy8gTGlzdCBvZiBlcnJvcnMgZW5jb3VudGVyZWQgdmFsaWRhdGluZyB0aGUgY29uZmlnLlxuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFRoZSBub24tdmFsaWRhdGVkIGNvbmZpZyBvYmplY3QuXG4gIGNvbnN0IGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZzx7Y29tbWl0TWVzc2FnZTogQ29tbWl0TWVzc2FnZUNvbmZpZ30+PiA9IGdldENvbmZpZygpO1xuXG4gIGlmIChjb25maWcuY29tbWl0TWVzc2FnZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE5vIGNvbmZpZ3VyYXRpb24gZGVmaW5lZCBmb3IgXCJjb21taXRNZXNzYWdlXCJgKTtcbiAgfVxuXG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgUmVxdWlyZWQ8dHlwZW9mIGNvbmZpZz47XG59XG5cbi8qKiBTY29wZSByZXF1aXJlbWVudCBsZXZlbCB0byBiZSBzZXQgZm9yIGVhY2ggY29tbWl0IHR5cGUuICAqL1xuZXhwb3J0IGVudW0gU2NvcGVSZXF1aXJlbWVudCB7XG4gIFJlcXVpcmVkLFxuICBPcHRpb25hbCxcbiAgRm9yYmlkZGVuLFxufVxuXG4vKiogQSBjb21taXQgdHlwZSAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21taXRUeXBlIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBzY29wZTogU2NvcGVSZXF1aXJlbWVudDtcbn1cblxuLyoqIFRoZSB2YWxpZCBjb21taXQgdHlwZXMgZm9yIEFuZ3VsYXIgY29tbWl0IG1lc3NhZ2VzLiAqL1xuZXhwb3J0IGNvbnN0IENPTU1JVF9UWVBFUzoge1trZXk6IHN0cmluZ106IENvbW1pdFR5cGV9ID0ge1xuICBidWlsZDoge1xuICAgIG5hbWU6ICdidWlsZCcsXG4gICAgZGVzY3JpcHRpb246ICdDaGFuZ2VzIHRvIGxvY2FsIHJlcG9zaXRvcnkgYnVpbGQgc3lzdGVtIGFuZCB0b29saW5nJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4sXG4gIH0sXG4gIGNpOiB7XG4gICAgbmFtZTogJ2NpJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZXMgdG8gQ0kgY29uZmlndXJhdGlvbiBhbmQgQ0kgc3BlY2lmaWMgdG9vbGluZycsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuRm9yYmlkZGVuLFxuICB9LFxuICBkb2NzOiB7XG4gICAgbmFtZTogJ2RvY3MnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlcyB3aGljaCBleGNsdXNpdmVseSBhZmZlY3RzIGRvY3VtZW50YXRpb24uJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgfSxcbiAgZmVhdDoge1xuICAgIG5hbWU6ICdmZWF0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZXMgYSBuZXcgZmVhdHVyZScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gIH0sXG4gIGZpeDoge1xuICAgIG5hbWU6ICdmaXgnLFxuICAgIGRlc2NyaXB0aW9uOiAnRml4ZXMgYSBwcmV2aW91c2x5IGRpc2NvdmVyZWQgZmFpbHVyZS9idWcnLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICB9LFxuICBwZXJmOiB7XG4gICAgbmFtZTogJ3BlcmYnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW1wcm92ZXMgcGVyZm9ybWFuY2Ugd2l0aG91dCBhbnkgY2hhbmdlIGluIGZ1bmN0aW9uYWxpdHkgb3IgQVBJJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCxcbiAgfSxcbiAgcmVmYWN0b3I6IHtcbiAgICBuYW1lOiAncmVmYWN0b3InLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVmYWN0b3Igd2l0aG91dCBhbnkgY2hhbmdlIGluIGZ1bmN0aW9uYWxpdHkgb3IgQVBJIChpbmNsdWRlcyBzdHlsZSBjaGFuZ2VzKScsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gIH0sXG4gIHJlbGVhc2U6IHtcbiAgICBuYW1lOiAncmVsZWFzZScsXG4gICAgZGVzY3JpcHRpb246ICdBIHJlbGVhc2UgcG9pbnQgaW4gdGhlIHJlcG9zaXRvcnknLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbixcbiAgfSxcbiAgdGVzdDoge1xuICAgIG5hbWU6ICd0ZXN0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ltcHJvdmVtZW50cyBvciBjb3JyZWN0aW9ucyBtYWRlIHRvIHRoZSBwcm9qZWN0XFwncyB0ZXN0IHN1aXRlJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCxcbiAgfSxcbn07XG4iXX0=