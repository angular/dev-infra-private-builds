(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/commit-message/validate-file"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var validate_file_1 = require("@angular/dev-infra-private/commit-message/validate-file");
    /** Build the parser for the commit-message commands. */
    function buildCommitMessageParser(localYargs) {
        return localYargs.help().strict().command('pre-commit-validate', 'Validate the most recent commit message', {}, function () {
            validate_file_1.validateFile('.git/COMMIT_EDITMSG');
        });
    }
    exports.buildCommitMessageParser = buildCommitMessageParser;
    if (require.main == module) {
        buildCommitMessageParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDZCQUErQjtJQUMvQix5RkFBNkM7SUFFN0Msd0RBQXdEO0lBQ3hELFNBQWdCLHdCQUF3QixDQUFDLFVBQXNCO1FBQzdELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FDckMscUJBQXFCLEVBQUUseUNBQXlDLEVBQUUsRUFBRSxFQUFFO1lBQ3BFLDRCQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUFMRCw0REFLQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUU7UUFDMUIsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDekMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQge3ZhbGlkYXRlRmlsZX0gZnJvbSAnLi92YWxpZGF0ZS1maWxlJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBjb21taXQtbWVzc2FnZSBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKCkuc3RyaWN0KCkuY29tbWFuZChcbiAgICAgICdwcmUtY29tbWl0LXZhbGlkYXRlJywgJ1ZhbGlkYXRlIHRoZSBtb3N0IHJlY2VudCBjb21taXQgbWVzc2FnZScsIHt9LCAoKSA9PiB7XG4gICAgICAgIHZhbGlkYXRlRmlsZSgnLmdpdC9DT01NSVRfRURJVE1TRycpO1xuICAgICAgfSk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT0gbW9kdWxlKSB7XG4gIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==