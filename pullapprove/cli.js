(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/cli", ["require", "exports", "@angular/dev-infra-private/pullapprove/verify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildPullapproveParser = void 0;
    var verify_1 = require("@angular/dev-infra-private/pullapprove/verify");
    /** Build the parser for the pullapprove commands. */
    function buildPullapproveParser(localYargs) {
        return localYargs.help().strict().demandCommand().command('verify', 'Verify the pullapprove config', {}, function () { return verify_1.verify(); });
    }
    exports.buildPullapproveParser = buildPullapproveParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFRQSx3RUFBZ0M7SUFFaEMscURBQXFEO0lBQ3JELFNBQWdCLHNCQUFzQixDQUFDLFVBQXNCO1FBQzNELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FDckQsUUFBUSxFQUFFLCtCQUErQixFQUFFLEVBQUUsRUFBRSxjQUFNLE9BQUEsZUFBTSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUhELHdEQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQge3ZlcmlmeX0gZnJvbSAnLi92ZXJpZnknO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIHB1bGxhcHByb3ZlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUHVsbGFwcHJvdmVQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKCkuc3RyaWN0KCkuZGVtYW5kQ29tbWFuZCgpLmNvbW1hbmQoXG4gICAgICAndmVyaWZ5JywgJ1ZlcmlmeSB0aGUgcHVsbGFwcHJvdmUgY29uZmlnJywge30sICgpID0+IHZlcmlmeSgpKTtcbn1cbiJdfQ==