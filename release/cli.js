(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/cli", ["require", "exports", "@angular/dev-infra-private/release/build/cli", "@angular/dev-infra-private/release/publish/cli", "@angular/dev-infra-private/release/set-dist-tag/cli", "@angular/dev-infra-private/release/stamping/env-stamp"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReleaseParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/release/build/cli");
    var cli_2 = require("@angular/dev-infra-private/release/publish/cli");
    var cli_3 = require("@angular/dev-infra-private/release/set-dist-tag/cli");
    var env_stamp_1 = require("@angular/dev-infra-private/release/stamping/env-stamp");
    /** Build the parser for the release commands. */
    function buildReleaseParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command(cli_2.ReleasePublishCommandModule)
            .command(cli_1.ReleaseBuildCommandModule)
            .command(cli_3.ReleaseSetDistTagCommand)
            .command('build-env-stamp', 'Build the environment stamping information', {}, function () { return env_stamp_1.buildEnvStamp(); });
    }
    exports.buildReleaseParser = buildReleaseParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVNBLG9FQUFzRDtJQUN0RCxzRUFBMEQ7SUFDMUQsMkVBQTREO0lBQzVELG1GQUFtRDtJQUVuRCxpREFBaUQ7SUFDakQsU0FBZ0Isa0JBQWtCLENBQUMsVUFBc0I7UUFDdkQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE9BQU8sQ0FBQyxpQ0FBMkIsQ0FBQzthQUNwQyxPQUFPLENBQUMsK0JBQXlCLENBQUM7YUFDbEMsT0FBTyxDQUFDLDhCQUF3QixDQUFDO2FBQ2pDLE9BQU8sQ0FDSixpQkFBaUIsRUFBRSw0Q0FBNEMsRUFBRSxFQUFFLEVBQ25FLGNBQU0sT0FBQSx5QkFBYSxFQUFFLEVBQWYsQ0FBZSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQVZELGdEQVVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7UmVsZWFzZUJ1aWxkQ29tbWFuZE1vZHVsZX0gZnJvbSAnLi9idWlsZC9jbGknO1xuaW1wb3J0IHtSZWxlYXNlUHVibGlzaENvbW1hbmRNb2R1bGV9IGZyb20gJy4vcHVibGlzaC9jbGknO1xuaW1wb3J0IHtSZWxlYXNlU2V0RGlzdFRhZ0NvbW1hbmR9IGZyb20gJy4vc2V0LWRpc3QtdGFnL2NsaSc7XG5pbXBvcnQge2J1aWxkRW52U3RhbXB9IGZyb20gJy4vc3RhbXBpbmcvZW52LXN0YW1wJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSByZWxlYXNlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVsZWFzZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAuY29tbWFuZChSZWxlYXNlUHVibGlzaENvbW1hbmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChSZWxlYXNlQnVpbGRDb21tYW5kTW9kdWxlKVxuICAgICAgLmNvbW1hbmQoUmVsZWFzZVNldERpc3RUYWdDb21tYW5kKVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2J1aWxkLWVudi1zdGFtcCcsICdCdWlsZCB0aGUgZW52aXJvbm1lbnQgc3RhbXBpbmcgaW5mb3JtYXRpb24nLCB7fSxcbiAgICAgICAgICAoKSA9PiBidWlsZEVudlN0YW1wKCkpO1xufVxuIl19