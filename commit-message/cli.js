(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "@angular/dev-infra-private/commit-message/restore-commit-message/cli", "@angular/dev-infra-private/commit-message/validate-file/cli", "@angular/dev-infra-private/commit-message/validate-range/cli", "@angular/dev-infra-private/commit-message/wizard/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCommitMessageParser = void 0;
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFTQSw0RkFBd0U7SUFDeEUsbUZBQXVEO0lBQ3ZELG9GQUF5RDtJQUN6RCw0RUFBMEM7SUFFMUMsd0RBQXdEO0lBQ3hELFNBQWdCLHdCQUF3QixDQUFDLFVBQXNCO1FBQzdELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixPQUFPLENBQUMsZ0NBQTBCLENBQUM7YUFDbkMsT0FBTyxDQUFDLGtCQUFZLENBQUM7YUFDckIsT0FBTyxDQUFDLHdCQUFrQixDQUFDO2FBQzNCLE9BQU8sQ0FBQyx5QkFBbUIsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFQRCw0REFPQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge1Jlc3RvcmVDb21taXRNZXNzYWdlTW9kdWxlfSBmcm9tICcuL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UvY2xpJztcbmltcG9ydCB7VmFsaWRhdGVGaWxlTW9kdWxlfSBmcm9tICcuL3ZhbGlkYXRlLWZpbGUvY2xpJztcbmltcG9ydCB7VmFsaWRhdGVSYW5nZU1vZHVsZX0gZnJvbSAnLi92YWxpZGF0ZS1yYW5nZS9jbGknO1xuaW1wb3J0IHtXaXphcmRNb2R1bGV9IGZyb20gJy4vd2l6YXJkL2NsaSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgY29tbWl0LW1lc3NhZ2UgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDb21taXRNZXNzYWdlUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5jb21tYW5kKFJlc3RvcmVDb21taXRNZXNzYWdlTW9kdWxlKVxuICAgICAgLmNvbW1hbmQoV2l6YXJkTW9kdWxlKVxuICAgICAgLmNvbW1hbmQoVmFsaWRhdGVGaWxlTW9kdWxlKVxuICAgICAgLmNvbW1hbmQoVmFsaWRhdGVSYW5nZU1vZHVsZSk7XG59XG4iXX0=