(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/ngbot/cli", ["require", "exports", "@angular/dev-infra-private/ngbot/verify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildNgbotParser = void 0;
    var verify_1 = require("@angular/dev-infra-private/ngbot/verify");
    /** Build the parser for the NgBot commands. */
    function buildNgbotParser(localYargs) {
        return localYargs.help().strict().demandCommand().command('verify', 'Verify the NgBot config', {}, function () { return verify_1.verify(); });
    }
    exports.buildNgbotParser = buildNgbotParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL25nYm90L2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFRQSxrRUFBZ0M7SUFFaEMsK0NBQStDO0lBQy9DLFNBQWdCLGdCQUFnQixDQUFDLFVBQXNCO1FBQ3JELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FDckQsUUFBUSxFQUFFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxjQUFNLE9BQUEsZUFBTSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUhELDRDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQge3ZlcmlmeX0gZnJvbSAnLi92ZXJpZnknO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIE5nQm90IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTmdib3RQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKCkuc3RyaWN0KCkuZGVtYW5kQ29tbWFuZCgpLmNvbW1hbmQoXG4gICAgICAndmVyaWZ5JywgJ1ZlcmlmeSB0aGUgTmdCb3QgY29uZmlnJywge30sICgpID0+IHZlcmlmeSgpKTtcbn1cbiJdfQ==