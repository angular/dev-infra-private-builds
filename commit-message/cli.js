(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/commit-message/restore-commit-message/cli", "@angular/dev-infra-private/commit-message/validate-file/cli", "@angular/dev-infra-private/commit-message/validate-range/cli", "@angular/dev-infra-private/commit-message/wizard/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCommitMessageParser = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var cli_1 = require("@angular/dev-infra-private/commit-message/restore-commit-message/cli");
    var cli_2 = require("@angular/dev-infra-private/commit-message/validate-file/cli");
    var cli_3 = require("@angular/dev-infra-private/commit-message/validate-range/cli");
    var cli_4 = require("@angular/dev-infra-private/commit-message/wizard/cli");
    /** Build the parser for the commit-message commands. */
    function buildCommitMessageParser(localYargs) {
        return localYargs.help()
            .strict()
            .command(cli_1.RestoreCommitMessageModule)
            .command(cli_4.WizardModule)
            .command(cli_2.ValidateFileModule)
            .command(cli_3.ValidateRangeModule);
    }
    exports.buildCommitMessageParser = buildCommitMessageParser;
    if (require.main == module) {
        buildCommitMessageParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFFL0IsNEZBQXdFO0lBQ3hFLG1GQUF1RDtJQUN2RCxvRkFBeUQ7SUFDekQsNEVBQTBDO0lBRTFDLHdEQUF3RDtJQUN4RCxTQUFnQix3QkFBd0IsQ0FBQyxVQUFzQjtRQUM3RCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsT0FBTyxDQUFDLGdDQUEwQixDQUFDO2FBQ25DLE9BQU8sQ0FBQyxrQkFBWSxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyx3QkFBa0IsQ0FBQzthQUMzQixPQUFPLENBQUMseUJBQW1CLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBUEQsNERBT0M7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFO1FBQzFCLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3pDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7UmVzdG9yZUNvbW1pdE1lc3NhZ2VNb2R1bGV9IGZyb20gJy4vcmVzdG9yZS1jb21taXQtbWVzc2FnZS9jbGknO1xuaW1wb3J0IHtWYWxpZGF0ZUZpbGVNb2R1bGV9IGZyb20gJy4vdmFsaWRhdGUtZmlsZS9jbGknO1xuaW1wb3J0IHtWYWxpZGF0ZVJhbmdlTW9kdWxlfSBmcm9tICcuL3ZhbGlkYXRlLXJhbmdlL2NsaSc7XG5pbXBvcnQge1dpemFyZE1vZHVsZX0gZnJvbSAnLi93aXphcmQvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBjb21taXQtbWVzc2FnZSBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmNvbW1hbmQoUmVzdG9yZUNvbW1pdE1lc3NhZ2VNb2R1bGUpXG4gICAgICAuY29tbWFuZChXaXphcmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChWYWxpZGF0ZUZpbGVNb2R1bGUpXG4gICAgICAuY29tbWFuZChWYWxpZGF0ZVJhbmdlTW9kdWxlKTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PSBtb2R1bGUpIHtcbiAgYnVpbGRDb21taXRNZXNzYWdlUGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19