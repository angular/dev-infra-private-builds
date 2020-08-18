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
        define("@angular/dev-infra-private/pr/checkout/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "angular/dev-infra/pr/common/checkout-pr"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckoutCommandModule = exports.GITHUB_TOKEN_GENERATE_URL = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var checkout_pr_1 = require("angular/dev-infra/pr/common/checkout-pr");
    /** URL to the Github page where personal access tokens can be generated. */
    exports.GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens";
    /** Builds the checkout pull request command. */
    function builder(yargs) {
        return yargs.positional('prNumber', { type: 'number', demandOption: true }).option('github-token', {
            type: 'string',
            description: 'Github token. If not set, token is retrieved from the environment variables.'
        });
    }
    /** Handles the checkout pull request command. */
    function handler(_a) {
        var prNumber = _a.prNumber, token = _a["github-token"];
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var githubToken, prCheckoutOptions;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
                        if (!githubToken) {
                            console_1.error('No Github token set. Please set the `GITHUB_TOKEN` environment variable.');
                            console_1.error('Alternatively, pass the `--github-token` command line flag.');
                            console_1.error("You can generate a token here: " + exports.GITHUB_TOKEN_GENERATE_URL);
                            process.exitCode = 1;
                            return [2 /*return*/];
                        }
                        prCheckoutOptions = { allowIfMaintainerCannotModify: true, branchName: "pr-" + prNumber };
                        return [4 /*yield*/, checkout_pr_1.checkOutPullRequestLocally(prNumber, githubToken, prCheckoutOptions)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** yargs command module for checking out a PR  */
    exports.CheckoutCommandModule = {
        handler: handler,
        builder: builder,
        command: 'checkout <pr-number>',
        describe: 'Checkout a PR from the upstream repo',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrb3V0L2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsb0VBQTBDO0lBQzFDLHVFQUFpRTtJQU9qRSw0RUFBNEU7SUFDL0QsUUFBQSx5QkFBeUIsR0FBRyxvQ0FBb0MsQ0FBQztJQUU5RSxnREFBZ0Q7SUFDaEQsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQy9GLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLDhFQUE4RTtTQUM1RixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsaURBQWlEO0lBQ2pELFNBQWUsT0FBTyxDQUFDLEVBQTZEO1lBQTVELFFBQVEsY0FBQSxFQUFrQixLQUFLLHFCQUFBOzs7Ozs7d0JBQy9DLFdBQVcsR0FBRyxLQUFLLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7d0JBQzNFLElBQUksQ0FBQyxXQUFXLEVBQUU7NEJBQ2hCLGVBQUssQ0FBQywwRUFBMEUsQ0FBQyxDQUFDOzRCQUNsRixlQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQzs0QkFDckUsZUFBSyxDQUFDLG9DQUFrQyxpQ0FBMkIsQ0FBQyxDQUFDOzRCQUNyRSxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQzs0QkFDckIsc0JBQU87eUJBQ1I7d0JBQ0ssaUJBQWlCLEdBQUcsRUFBQyw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQU0sUUFBVSxFQUFDLENBQUM7d0JBQzlGLHFCQUFNLHdDQUEwQixDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLENBQUMsRUFBQTs7d0JBQTFFLFNBQTBFLENBQUM7Ozs7O0tBQzVFO0lBRUQsa0RBQWtEO0lBQ3JDLFFBQUEscUJBQXFCLEdBQXVDO1FBQ3ZFLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxzQkFBc0I7UUFDL0IsUUFBUSxFQUFFLHNDQUFzQztLQUNqRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtjaGVja091dFB1bGxSZXF1ZXN0TG9jYWxseX0gZnJvbSAnLi4vY29tbW9uL2NoZWNrb3V0LXByJztcblxuZXhwb3J0IGludGVyZmFjZSBDaGVja291dE9wdGlvbnMge1xuICBwck51bWJlcjogbnVtYmVyO1xuICAnZ2l0aHViLXRva2VuJz86IHN0cmluZztcbn1cblxuLyoqIFVSTCB0byB0aGUgR2l0aHViIHBhZ2Ugd2hlcmUgcGVyc29uYWwgYWNjZXNzIHRva2VucyBjYW4gYmUgZ2VuZXJhdGVkLiAqL1xuZXhwb3J0IGNvbnN0IEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwgPSBgaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vuc2A7XG5cbi8qKiBCdWlsZHMgdGhlIGNoZWNrb3V0IHB1bGwgcmVxdWVzdCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3MucG9zaXRpb25hbCgncHJOdW1iZXInLCB7dHlwZTogJ251bWJlcicsIGRlbWFuZE9wdGlvbjogdHJ1ZX0pLm9wdGlvbignZ2l0aHViLXRva2VuJywge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2l0aHViIHRva2VuLiBJZiBub3Qgc2V0LCB0b2tlbiBpcyByZXRyaWV2ZWQgZnJvbSB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLidcbiAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjaGVja291dCBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3ByTnVtYmVyLCAnZ2l0aHViLXRva2VuJzogdG9rZW59OiBBcmd1bWVudHM8Q2hlY2tvdXRPcHRpb25zPikge1xuICBjb25zdCBnaXRodWJUb2tlbiA9IHRva2VuIHx8IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTiB8fCBwcm9jZXNzLmVudi5UT0tFTjtcbiAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgIGVycm9yKCdObyBHaXRodWIgdG9rZW4gc2V0LiBQbGVhc2Ugc2V0IHRoZSBgR0lUSFVCX1RPS0VOYCBlbnZpcm9ubWVudCB2YXJpYWJsZS4nKTtcbiAgICBlcnJvcignQWx0ZXJuYXRpdmVseSwgcGFzcyB0aGUgYC0tZ2l0aHViLXRva2VuYCBjb21tYW5kIGxpbmUgZmxhZy4nKTtcbiAgICBlcnJvcihgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKTtcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcHJDaGVja291dE9wdGlvbnMgPSB7YWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnk6IHRydWUsIGJyYW5jaE5hbWU6IGBwci0ke3ByTnVtYmVyfWB9O1xuICBhd2FpdCBjaGVja091dFB1bGxSZXF1ZXN0TG9jYWxseShwck51bWJlciwgZ2l0aHViVG9rZW4sIHByQ2hlY2tvdXRPcHRpb25zKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGZvciBjaGVja2luZyBvdXQgYSBQUiAgKi9cbmV4cG9ydCBjb25zdCBDaGVja291dENvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIENoZWNrb3V0T3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdjaGVja291dCA8cHItbnVtYmVyPicsXG4gIGRlc2NyaWJlOiAnQ2hlY2tvdXQgYSBQUiBmcm9tIHRoZSB1cHN0cmVhbSByZXBvJyxcbn07XG4iXX0=