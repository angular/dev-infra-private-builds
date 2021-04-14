(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "@angular/dev-infra-private/commit-message/restore-commit-message/cli", "@angular/dev-infra-private/commit-message/validate-file/cli", "@angular/dev-infra-private/commit-message/validate-range/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCommitMessageParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/commit-message/restore-commit-message/cli");
    var cli_2 = require("@angular/dev-infra-private/commit-message/validate-file/cli");
    var cli_3 = require("@angular/dev-infra-private/commit-message/validate-range/cli");
    /** Build the parser for the commit-message commands. */
    function buildCommitMessageParser(localYargs) {
        return localYargs.help()
            .strict()
            .command(cli_1.RestoreCommitMessageModule)
            .command(cli_2.ValidateFileModule)
            .command(cli_3.ValidateRangeModule);
    }
    exports.buildCommitMessageParser = buildCommitMessageParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFTQSw0RkFBd0U7SUFDeEUsbUZBQXVEO0lBQ3ZELG9GQUF5RDtJQUV6RCx3REFBd0Q7SUFDeEQsU0FBZ0Isd0JBQXdCLENBQUMsVUFBc0I7UUFDN0QsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLE9BQU8sQ0FBQyxnQ0FBMEIsQ0FBQzthQUNuQyxPQUFPLENBQUMsd0JBQWtCLENBQUM7YUFDM0IsT0FBTyxDQUFDLHlCQUFtQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQU5ELDREQU1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7UmVzdG9yZUNvbW1pdE1lc3NhZ2VNb2R1bGV9IGZyb20gJy4vcmVzdG9yZS1jb21taXQtbWVzc2FnZS9jbGknO1xuaW1wb3J0IHtWYWxpZGF0ZUZpbGVNb2R1bGV9IGZyb20gJy4vdmFsaWRhdGUtZmlsZS9jbGknO1xuaW1wb3J0IHtWYWxpZGF0ZVJhbmdlTW9kdWxlfSBmcm9tICcuL3ZhbGlkYXRlLXJhbmdlL2NsaSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgY29tbWl0LW1lc3NhZ2UgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDb21taXRNZXNzYWdlUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5jb21tYW5kKFJlc3RvcmVDb21taXRNZXNzYWdlTW9kdWxlKVxuICAgICAgLmNvbW1hbmQoVmFsaWRhdGVGaWxlTW9kdWxlKVxuICAgICAgLmNvbW1hbmQoVmFsaWRhdGVSYW5nZU1vZHVsZSk7XG59XG4iXX0=