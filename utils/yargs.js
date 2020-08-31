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
        define("@angular/dev-infra-private/utils/yargs", ["require", "exports", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GITHUB_TOKEN_GENERATE_URL = exports.addGithubTokenFlag = void 0;
    var console_1 = require("@angular/dev-infra-private/utils/console");
    function addGithubTokenFlag(yargs) {
        return yargs
            // 'github-token' is casted to 'githubToken' to properly set up typings to reflect the key in
            // the Argv object being camelCase rather than kebob case due to the `camel-case-expansion`
            // config: https://github.com/yargs/yargs-parser#camel-case-expansion
            .option('github-token', {
            type: 'string',
            description: 'Github token. If not set, token is retrieved from the environment variables.',
            coerce: function (token) {
                var githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
                if (!githubToken) {
                    console_1.error(console_1.red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
                    console_1.error(console_1.red('Alternatively, pass the `--github-token` command line flag.'));
                    console_1.error(console_1.yellow("You can generate a token here: " + exports.GITHUB_TOKEN_GENERATE_URL));
                    process.exit(1);
                }
                return githubToken;
            },
        })
            .default('github-token', '', '<LOCAL TOKEN>');
    }
    exports.addGithubTokenFlag = addGithubTokenFlag;
    /** URL to the Github page where personal access tokens can be generated. */
    exports.GITHUB_TOKEN_GENERATE_URL = 'https://github.com/settings/tokens/new';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFyZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMveWFyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBR0gsb0VBQTZDO0lBSTdDLFNBQWdCLGtCQUFrQixDQUFDLEtBQVc7UUFDNUMsT0FBTyxLQUFLO1lBQ1IsNkZBQTZGO1lBQzdGLDJGQUEyRjtZQUMzRixxRUFBcUU7YUFDcEUsTUFBTSxDQUFDLGNBQStCLEVBQUU7WUFDdkMsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsOEVBQThFO1lBQzNGLE1BQU0sRUFBRSxVQUFDLEtBQWE7Z0JBQ3BCLElBQU0sV0FBVyxHQUFHLEtBQUssSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztnQkFDM0UsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDaEIsZUFBSyxDQUFDLGFBQUcsQ0FBQywwRUFBMEUsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZGLGVBQUssQ0FBQyxhQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQyxDQUFDO29CQUMxRSxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxvQ0FBa0MsaUNBQTJCLENBQUMsQ0FBQyxDQUFDO29CQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqQjtnQkFDRCxPQUFPLFdBQVcsQ0FBQztZQUNyQixDQUFDO1NBQ0YsQ0FBQzthQUNELE9BQU8sQ0FBQyxjQUErQixFQUFFLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBcEJELGdEQW9CQztJQUVELDRFQUE0RTtJQUMvRCxRQUFBLHlCQUF5QixHQUFHLHdDQUF3QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndn0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtlcnJvciwgcmVkLCB5ZWxsb3d9IGZyb20gJy4vY29uc29sZSc7XG5cbmV4cG9ydCB0eXBlIEFyZ3ZXaXRoR2l0aHViVG9rZW4gPSBBcmd2PHtnaXRodWJUb2tlbjogc3RyaW5nfT47XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRHaXRodWJUb2tlbkZsYWcoeWFyZ3M6IEFyZ3YpOiBBcmd2V2l0aEdpdGh1YlRva2VuIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgICAvLyAnZ2l0aHViLXRva2VuJyBpcyBjYXN0ZWQgdG8gJ2dpdGh1YlRva2VuJyB0byBwcm9wZXJseSBzZXQgdXAgdHlwaW5ncyB0byByZWZsZWN0IHRoZSBrZXkgaW5cbiAgICAgIC8vIHRoZSBBcmd2IG9iamVjdCBiZWluZyBjYW1lbENhc2UgcmF0aGVyIHRoYW4ga2Vib2IgY2FzZSBkdWUgdG8gdGhlIGBjYW1lbC1jYXNlLWV4cGFuc2lvbmBcbiAgICAgIC8vIGNvbmZpZzogaHR0cHM6Ly9naXRodWIuY29tL3lhcmdzL3lhcmdzLXBhcnNlciNjYW1lbC1jYXNlLWV4cGFuc2lvblxuICAgICAgLm9wdGlvbignZ2l0aHViLXRva2VuJyBhcyAnZ2l0aHViVG9rZW4nLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0dpdGh1YiB0b2tlbi4gSWYgbm90IHNldCwgdG9rZW4gaXMgcmV0cmlldmVkIGZyb20gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy4nLFxuICAgICAgICBjb2VyY2U6ICh0b2tlbjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgY29uc3QgZ2l0aHViVG9rZW4gPSB0b2tlbiB8fCBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gfHwgcHJvY2Vzcy5lbnYuVE9LRU47XG4gICAgICAgICAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgICAgICAgICAgZXJyb3IocmVkKCdObyBHaXRodWIgdG9rZW4gc2V0LiBQbGVhc2Ugc2V0IHRoZSBgR0lUSFVCX1RPS0VOYCBlbnZpcm9ubWVudCB2YXJpYWJsZS4nKSk7XG4gICAgICAgICAgICBlcnJvcihyZWQoJ0FsdGVybmF0aXZlbHksIHBhc3MgdGhlIGAtLWdpdGh1Yi10b2tlbmAgY29tbWFuZCBsaW5lIGZsYWcuJykpO1xuICAgICAgICAgICAgZXJyb3IoeWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGdpdGh1YlRva2VuO1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIC5kZWZhdWx0KCdnaXRodWItdG9rZW4nIGFzICdnaXRodWJUb2tlbicsICcnLCAnPExPQ0FMIFRPS0VOPicpO1xufVxuXG4vKiogVVJMIHRvIHRoZSBHaXRodWIgcGFnZSB3aGVyZSBwZXJzb25hbCBhY2Nlc3MgdG9rZW5zIGNhbiBiZSBnZW5lcmF0ZWQuICovXG5leHBvcnQgY29uc3QgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCA9ICdodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zL25ldyc7XG4iXX0=