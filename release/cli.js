(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/cli", ["require", "exports", "@angular/dev-infra-private/release/build/cli", "@angular/dev-infra-private/release/notes/cli", "@angular/dev-infra-private/release/publish/cli", "@angular/dev-infra-private/release/set-dist-tag/cli", "@angular/dev-infra-private/release/stamping/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReleaseParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/release/build/cli");
    var cli_2 = require("@angular/dev-infra-private/release/notes/cli");
    var cli_3 = require("@angular/dev-infra-private/release/publish/cli");
    var cli_4 = require("@angular/dev-infra-private/release/set-dist-tag/cli");
    var cli_5 = require("@angular/dev-infra-private/release/stamping/cli");
    /** Build the parser for the release commands. */
    function buildReleaseParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command(cli_3.ReleasePublishCommandModule)
            .command(cli_1.ReleaseBuildCommandModule)
            .command(cli_4.ReleaseSetDistTagCommand)
            .command(cli_5.BuildEnvStampCommand)
            .command(cli_2.ReleaseNotesCommandModule);
    }
    exports.buildReleaseParser = buildReleaseParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVNBLG9FQUFzRDtJQUN0RCxvRUFBc0Q7SUFDdEQsc0VBQTBEO0lBQzFELDJFQUE0RDtJQUM1RCx1RUFBb0Q7SUFFcEQsaURBQWlEO0lBQ2pELFNBQWdCLGtCQUFrQixDQUFDLFVBQXNCO1FBQ3ZELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixPQUFPLENBQUMsaUNBQTJCLENBQUM7YUFDcEMsT0FBTyxDQUFDLCtCQUF5QixDQUFDO2FBQ2xDLE9BQU8sQ0FBQyw4QkFBd0IsQ0FBQzthQUNqQyxPQUFPLENBQUMsMEJBQW9CLENBQUM7YUFDN0IsT0FBTyxDQUFDLCtCQUF5QixDQUFDLENBQUM7SUFDMUMsQ0FBQztJQVRELGdEQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7UmVsZWFzZUJ1aWxkQ29tbWFuZE1vZHVsZX0gZnJvbSAnLi9idWlsZC9jbGknO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXNDb21tYW5kTW9kdWxlfSBmcm9tICcuL25vdGVzL2NsaSc7XG5pbXBvcnQge1JlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZX0gZnJvbSAnLi9wdWJsaXNoL2NsaSc7XG5pbXBvcnQge1JlbGVhc2VTZXREaXN0VGFnQ29tbWFuZH0gZnJvbSAnLi9zZXQtZGlzdC10YWcvY2xpJztcbmltcG9ydCB7QnVpbGRFbnZTdGFtcENvbW1hbmR9IGZyb20gJy4vc3RhbXBpbmcvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSByZWxlYXNlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVsZWFzZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAuY29tbWFuZChSZWxlYXNlUHVibGlzaENvbW1hbmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChSZWxlYXNlQnVpbGRDb21tYW5kTW9kdWxlKVxuICAgICAgLmNvbW1hbmQoUmVsZWFzZVNldERpc3RUYWdDb21tYW5kKVxuICAgICAgLmNvbW1hbmQoQnVpbGRFbnZTdGFtcENvbW1hbmQpXG4gICAgICAuY29tbWFuZChSZWxlYXNlTm90ZXNDb21tYW5kTW9kdWxlKTtcbn1cbiJdfQ==