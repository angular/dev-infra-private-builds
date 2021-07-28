(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/cli", ["require", "exports", "@angular/dev-infra-private/release/build/cli", "@angular/dev-infra-private/release/info/cli", "@angular/dev-infra-private/release/notes/cli", "@angular/dev-infra-private/release/publish/cli", "@angular/dev-infra-private/release/set-dist-tag/cli", "@angular/dev-infra-private/release/stamping/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReleaseParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/release/build/cli");
    var cli_2 = require("@angular/dev-infra-private/release/info/cli");
    var cli_3 = require("@angular/dev-infra-private/release/notes/cli");
    var cli_4 = require("@angular/dev-infra-private/release/publish/cli");
    var cli_5 = require("@angular/dev-infra-private/release/set-dist-tag/cli");
    var cli_6 = require("@angular/dev-infra-private/release/stamping/cli");
    /** Build the parser for the release commands. */
    function buildReleaseParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command(cli_4.ReleasePublishCommandModule)
            .command(cli_1.ReleaseBuildCommandModule)
            .command(cli_2.ReleaseInfoCommandModule)
            .command(cli_5.ReleaseSetDistTagCommand)
            .command(cli_6.BuildEnvStampCommand)
            .command(cli_3.ReleaseNotesCommandModule);
    }
    exports.buildReleaseParser = buildReleaseParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVNBLG9FQUFzRDtJQUN0RCxtRUFBb0Q7SUFDcEQsb0VBQXNEO0lBQ3RELHNFQUEwRDtJQUMxRCwyRUFBNEQ7SUFDNUQsdUVBQW9EO0lBRXBELGlEQUFpRDtJQUNqRCxTQUFnQixrQkFBa0IsQ0FBQyxVQUFzQjtRQUN2RCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFO2FBQ2YsT0FBTyxDQUFDLGlDQUEyQixDQUFDO2FBQ3BDLE9BQU8sQ0FBQywrQkFBeUIsQ0FBQzthQUNsQyxPQUFPLENBQUMsOEJBQXdCLENBQUM7YUFDakMsT0FBTyxDQUFDLDhCQUF3QixDQUFDO2FBQ2pDLE9BQU8sQ0FBQywwQkFBb0IsQ0FBQzthQUM3QixPQUFPLENBQUMsK0JBQXlCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBVkQsZ0RBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtSZWxlYXNlQnVpbGRDb21tYW5kTW9kdWxlfSBmcm9tICcuL2J1aWxkL2NsaSc7XG5pbXBvcnQge1JlbGVhc2VJbmZvQ29tbWFuZE1vZHVsZX0gZnJvbSAnLi9pbmZvL2NsaSc7XG5pbXBvcnQge1JlbGVhc2VOb3Rlc0NvbW1hbmRNb2R1bGV9IGZyb20gJy4vbm90ZXMvY2xpJztcbmltcG9ydCB7UmVsZWFzZVB1Ymxpc2hDb21tYW5kTW9kdWxlfSBmcm9tICcuL3B1Ymxpc2gvY2xpJztcbmltcG9ydCB7UmVsZWFzZVNldERpc3RUYWdDb21tYW5kfSBmcm9tICcuL3NldC1kaXN0LXRhZy9jbGknO1xuaW1wb3J0IHtCdWlsZEVudlN0YW1wQ29tbWFuZH0gZnJvbSAnLi9zdGFtcGluZy9jbGknO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIHJlbGVhc2UgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWxlYXNlUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5jb21tYW5kKFJlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZSlcbiAgICAgIC5jb21tYW5kKFJlbGVhc2VCdWlsZENvbW1hbmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChSZWxlYXNlSW5mb0NvbW1hbmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChSZWxlYXNlU2V0RGlzdFRhZ0NvbW1hbmQpXG4gICAgICAuY29tbWFuZChCdWlsZEVudlN0YW1wQ29tbWFuZClcbiAgICAgIC5jb21tYW5kKFJlbGVhc2VOb3Rlc0NvbW1hbmRNb2R1bGUpO1xufVxuIl19