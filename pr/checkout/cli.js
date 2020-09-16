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
        define("@angular/dev-infra-private/pr/checkout/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/yargs", "@angular/dev-infra-private/pr/common/checkout-pr"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckoutCommandModule = void 0;
    var tslib_1 = require("tslib");
    var yargs_1 = require("@angular/dev-infra-private/utils/yargs");
    var checkout_pr_1 = require("@angular/dev-infra-private/pr/common/checkout-pr");
    /** Builds the checkout pull request command. */
    function builder(yargs) {
        return yargs_1.addGithubTokenFlag(yargs).positional('prNumber', { type: 'number', demandOption: true });
    }
    /** Handles the checkout pull request command. */
    function handler(_a) {
        var prNumber = _a.prNumber, githubToken = _a.githubToken;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prCheckoutOptions;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrb3V0L2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsZ0VBQXFEO0lBQ3JELGdGQUFpRTtJQU9qRSxnREFBZ0Q7SUFDaEQsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLDBCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxpREFBaUQ7SUFDakQsU0FBZSxPQUFPLENBQUMsRUFBbUQ7WUFBbEQsUUFBUSxjQUFBLEVBQUUsV0FBVyxpQkFBQTs7Ozs7O3dCQUNyQyxpQkFBaUIsR0FBRyxFQUFDLDZCQUE2QixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBTSxRQUFVLEVBQUMsQ0FBQzt3QkFDOUYscUJBQU0sd0NBQTBCLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxFQUFBOzt3QkFBMUUsU0FBMEUsQ0FBQzs7Ozs7S0FDNUU7SUFFRCxrREFBa0Q7SUFDckMsUUFBQSxxQkFBcUIsR0FBdUM7UUFDdkUsT0FBTyxTQUFBO1FBQ1AsT0FBTyxTQUFBO1FBQ1AsT0FBTyxFQUFFLHNCQUFzQjtRQUMvQixRQUFRLEVBQUUsc0NBQXNDO0tBQ2pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthZGRHaXRodWJUb2tlbkZsYWd9IGZyb20gJy4uLy4uL3V0aWxzL3lhcmdzJztcbmltcG9ydCB7Y2hlY2tPdXRQdWxsUmVxdWVzdExvY2FsbHl9IGZyb20gJy4uL2NvbW1vbi9jaGVja291dC1wcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hlY2tvdXRPcHRpb25zIHtcbiAgcHJOdW1iZXI6IG51bWJlcjtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY2hlY2tvdXQgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiBhZGRHaXRodWJUb2tlbkZsYWcoeWFyZ3MpLnBvc2l0aW9uYWwoJ3ByTnVtYmVyJywge3R5cGU6ICdudW1iZXInLCBkZW1hbmRPcHRpb246IHRydWV9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNoZWNrb3V0IHB1bGwgcmVxdWVzdCBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cHJOdW1iZXIsIGdpdGh1YlRva2VufTogQXJndW1lbnRzPENoZWNrb3V0T3B0aW9ucz4pIHtcbiAgY29uc3QgcHJDaGVja291dE9wdGlvbnMgPSB7YWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnk6IHRydWUsIGJyYW5jaE5hbWU6IGBwci0ke3ByTnVtYmVyfWB9O1xuICBhd2FpdCBjaGVja091dFB1bGxSZXF1ZXN0TG9jYWxseShwck51bWJlciwgZ2l0aHViVG9rZW4sIHByQ2hlY2tvdXRPcHRpb25zKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGZvciBjaGVja2luZyBvdXQgYSBQUiAgKi9cbmV4cG9ydCBjb25zdCBDaGVja291dENvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIENoZWNrb3V0T3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdjaGVja291dCA8cHItbnVtYmVyPicsXG4gIGRlc2NyaWJlOiAnQ2hlY2tvdXQgYSBQUiBmcm9tIHRoZSB1cHN0cmVhbSByZXBvJyxcbn07XG4iXX0=