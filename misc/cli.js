(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/misc/cli", ["require", "exports", "@angular/dev-infra-private/misc/build-and-link/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildMiscParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/misc/build-and-link/cli");
    /** Build the parser for the misc commands. */
    function buildMiscParser(localYargs) {
        return localYargs.help().strict().command(cli_1.BuildAndLinkCommandModule);
    }
    exports.buildMiscParser = buildMiscParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL21pc2MvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVNBLDBFQUErRDtJQUUvRCw4Q0FBOEM7SUFDOUMsU0FBZ0IsZUFBZSxDQUFDLFVBQXNCO1FBQ3BELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQywrQkFBeUIsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFGRCwwQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge0J1aWxkQW5kTGlua0NvbW1hbmRNb2R1bGV9IGZyb20gJy4vYnVpbGQtYW5kLWxpbmsvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBtaXNjIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTWlzY1BhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKS5zdHJpY3QoKS5jb21tYW5kKEJ1aWxkQW5kTGlua0NvbW1hbmRNb2R1bGUpO1xufVxuIl19