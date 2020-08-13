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
            scope: ScopeRequirement.Forbidden,
        },
        ci: {
            scope: ScopeRequirement.Forbidden,
        },
        docs: {
            scope: ScopeRequirement.Optional,
        },
        feat: {
            scope: ScopeRequirement.Required,
        },
        fix: {
            scope: ScopeRequirement.Required,
        },
        perf: {
            scope: ScopeRequirement.Required,
        },
        refactor: {
            scope: ScopeRequirement.Required,
        },
        release: {
            scope: ScopeRequirement.Forbidden,
        },
        test: {
            scope: ScopeRequirement.Required,
        },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBdUU7SUFTdkUsaUVBQWlFO0lBQ2pFLFNBQWdCLHNCQUFzQjtRQUNwQyxvREFBb0Q7UUFDcEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLG1DQUFtQztRQUNuQyxJQUFNLE1BQU0sR0FBK0Qsa0JBQVMsRUFBRSxDQUFDO1FBRXZGLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnREFBOEMsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQWlDLENBQUM7SUFDM0MsQ0FBQztJQVpELHdEQVlDO0lBRUQsK0RBQStEO0lBQy9ELElBQVksZ0JBSVg7SUFKRCxXQUFZLGdCQUFnQjtRQUMxQiwrREFBUSxDQUFBO1FBQ1IsK0RBQVEsQ0FBQTtRQUNSLGlFQUFTLENBQUE7SUFDWCxDQUFDLEVBSlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFJM0I7SUFPRCwwREFBMEQ7SUFDN0MsUUFBQSxZQUFZLEdBQWdDO1FBQ3ZELEtBQUssRUFBRTtZQUNMLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTO1NBQ2xDO1FBQ0QsRUFBRSxFQUFFO1lBQ0YsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFNBQVM7U0FDbEM7UUFDRCxJQUFJLEVBQUU7WUFDSixLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELElBQUksRUFBRTtZQUNKLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1NBQ2pDO1FBQ0QsR0FBRyxFQUFFO1lBQ0gsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7U0FDakM7UUFDRCxJQUFJLEVBQUU7WUFDSixLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztRQUNELFFBQVEsRUFBRTtZQUNSLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1NBQ2pDO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFNBQVM7U0FDbEM7UUFDRCxJQUFJLEVBQUU7WUFDSixLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQztLQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuZXhwb3J0IGludGVyZmFjZSBDb21taXRNZXNzYWdlQ29uZmlnIHtcbiAgbWF4TGluZUxlbmd0aDogbnVtYmVyO1xuICBtaW5Cb2R5TGVuZ3RoOiBudW1iZXI7XG4gIG1pbkJvZHlMZW5ndGhUeXBlRXhjbHVkZXM/OiBzdHJpbmdbXTtcbiAgc2NvcGVzOiBzdHJpbmdbXTtcbn1cblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBDb21taXRNZXNzYWdlQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIG5vbi12YWxpZGF0ZWQgY29uZmlnIG9iamVjdC5cbiAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPHtjb21taXRNZXNzYWdlOiBDb21taXRNZXNzYWdlQ29uZmlnfT4+ID0gZ2V0Q29uZmlnKCk7XG5cbiAgaWYgKGNvbmZpZy5jb21taXRNZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImNvbW1pdE1lc3NhZ2VcImApO1xuICB9XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBSZXF1aXJlZDx0eXBlb2YgY29uZmlnPjtcbn1cblxuLyoqIFNjb3BlIHJlcXVpcmVtZW50IGxldmVsIHRvIGJlIHNldCBmb3IgZWFjaCBjb21taXQgdHlwZS4gICovXG5leHBvcnQgZW51bSBTY29wZVJlcXVpcmVtZW50IHtcbiAgUmVxdWlyZWQsXG4gIE9wdGlvbmFsLFxuICBGb3JiaWRkZW4sXG59XG5cbi8qKiBBIGNvbW1pdCB0eXBlICovXG5leHBvcnQgaW50ZXJmYWNlIENvbW1pdFR5cGUge1xuICBzY29wZTogU2NvcGVSZXF1aXJlbWVudDtcbn1cblxuLyoqIFRoZSB2YWxpZCBjb21taXQgdHlwZXMgZm9yIEFuZ3VsYXIgY29tbWl0IG1lc3NhZ2VzLiAqL1xuZXhwb3J0IGNvbnN0IENPTU1JVF9UWVBFUzoge1trZXk6IHN0cmluZ106IENvbW1pdFR5cGV9ID0ge1xuICBidWlsZDoge1xuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbixcbiAgfSxcbiAgY2k6IHtcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4sXG4gIH0sXG4gIGRvY3M6IHtcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgfSxcbiAgZmVhdDoge1xuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICB9LFxuICBmaXg6IHtcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCxcbiAgfSxcbiAgcGVyZjoge1xuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICB9LFxuICByZWZhY3Rvcjoge1xuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICB9LFxuICByZWxlYXNlOiB7XG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuRm9yYmlkZGVuLFxuICB9LFxuICB0ZXN0OiB7XG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gIH0sXG59O1xuIl19