(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/cli", ["require", "exports", "@angular/dev-infra-private/release/build/cli", "@angular/dev-infra-private/release/publish/cli", "@angular/dev-infra-private/release/set-dist-tag/cli", "@angular/dev-infra-private/release/stamping/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReleaseParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/release/build/cli");
    var cli_2 = require("@angular/dev-infra-private/release/publish/cli");
    var cli_3 = require("@angular/dev-infra-private/release/set-dist-tag/cli");
    var cli_4 = require("@angular/dev-infra-private/release/stamping/cli");
    /** Build the parser for the release commands. */
    function buildReleaseParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command(cli_2.ReleasePublishCommandModule)
            .command(cli_1.ReleaseBuildCommandModule)
            .command(cli_3.ReleaseSetDistTagCommand)
            .command(cli_4.BuildEnvStampCommand);
    }
    exports.buildReleaseParser = buildReleaseParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVNBLG9FQUFzRDtJQUN0RCxzRUFBMEQ7SUFDMUQsMkVBQTREO0lBQzVELHVFQUFvRDtJQUVwRCxpREFBaUQ7SUFDakQsU0FBZ0Isa0JBQWtCLENBQUMsVUFBc0I7UUFDdkQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE9BQU8sQ0FBQyxpQ0FBMkIsQ0FBQzthQUNwQyxPQUFPLENBQUMsK0JBQXlCLENBQUM7YUFDbEMsT0FBTyxDQUFDLDhCQUF3QixDQUFDO2FBQ2pDLE9BQU8sQ0FBQywwQkFBb0IsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFSRCxnREFRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge1JlbGVhc2VCdWlsZENvbW1hbmRNb2R1bGV9IGZyb20gJy4vYnVpbGQvY2xpJztcbmltcG9ydCB7UmVsZWFzZVB1Ymxpc2hDb21tYW5kTW9kdWxlfSBmcm9tICcuL3B1Ymxpc2gvY2xpJztcbmltcG9ydCB7UmVsZWFzZVNldERpc3RUYWdDb21tYW5kfSBmcm9tICcuL3NldC1kaXN0LXRhZy9jbGknO1xuaW1wb3J0IHtCdWlsZEVudlN0YW1wQ29tbWFuZH0gZnJvbSAnLi9zdGFtcGluZy9jbGknO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIHJlbGVhc2UgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWxlYXNlUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5jb21tYW5kKFJlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZSlcbiAgICAgIC5jb21tYW5kKFJlbGVhc2VCdWlsZENvbW1hbmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChSZWxlYXNlU2V0RGlzdFRhZ0NvbW1hbmQpXG4gICAgICAuY29tbWFuZChCdWlsZEVudlN0YW1wQ29tbWFuZCk7XG59XG4iXX0=