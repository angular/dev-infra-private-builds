/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/versioning/npm-publish", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/child-process"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setNpmTagForPackage = exports.runNpmPublish = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("@angular/dev-infra-private/utils/child-process");
    /**
     * Runs NPM publish within a specified package directory.
     * @throws With the process log output if the publish failed.
     */
    function runNpmPublish(packagePath, distTag, registryUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['publish', '--access', 'public', '--tag', distTag];
                        // If a custom registry URL has been specified, add the `--registry` flag.
                        if (registryUrl !== undefined) {
                            args.push('--registry', registryUrl);
                        }
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('npm', args, { cwd: packagePath, mode: 'silent' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.runNpmPublish = runNpmPublish;
    /**
     * Sets the NPM tag to the specified version for the given package.
     * @throws With the process log output if the tagging failed.
     */
    function setNpmTagForPackage(packageName, distTag, version, registryUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['dist-tag', 'add', packageName + "@" + version, distTag];
                        // If a custom registry URL has been specified, add the `--registry` flag.
                        if (registryUrl !== undefined) {
                            args.push('--registry', registryUrl);
                        }
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('npm', args, { mode: 'silent' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.setNpmTagForPackage = setNpmTagForPackage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXB1Ymxpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25wbS1wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxnRkFBK0Q7SUFFL0Q7OztPQUdHO0lBQ0gsU0FBc0IsYUFBYSxDQUMvQixXQUFtQixFQUFFLE9BQWUsRUFBRSxXQUE2Qjs7Ozs7O3dCQUMvRCxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ2pFLDBFQUEwRTt3QkFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFOzRCQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQzt5QkFDdEM7d0JBQ0QscUJBQU0sb0NBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUE7O3dCQUEzRSxTQUEyRSxDQUFDOzs7OztLQUM3RTtJQVJELHNDQVFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0IsbUJBQW1CLENBQ3JDLFdBQW1CLEVBQUUsT0FBZSxFQUFFLE9BQXNCLEVBQUUsV0FBNkI7Ozs7Ozt3QkFDdkYsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBSyxXQUFXLFNBQUksT0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUN2RSwwRUFBMEU7d0JBQzFFLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTs0QkFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7eUJBQ3RDO3dCQUNELHFCQUFNLG9DQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBQTs7d0JBQXpELFNBQXlELENBQUM7Ozs7O0tBQzNEO0lBUkQsa0RBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge3NwYXduV2l0aERlYnVnT3V0cHV0fSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcblxuLyoqXG4gKiBSdW5zIE5QTSBwdWJsaXNoIHdpdGhpbiBhIHNwZWNpZmllZCBwYWNrYWdlIGRpcmVjdG9yeS5cbiAqIEB0aHJvd3MgV2l0aCB0aGUgcHJvY2VzcyBsb2cgb3V0cHV0IGlmIHRoZSBwdWJsaXNoIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bk5wbVB1Ymxpc2goXG4gICAgcGFja2FnZVBhdGg6IHN0cmluZywgZGlzdFRhZzogc3RyaW5nLCByZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCkge1xuICBjb25zdCBhcmdzID0gWydwdWJsaXNoJywgJy0tYWNjZXNzJywgJ3B1YmxpYycsICctLXRhZycsIGRpc3RUYWddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3MucHVzaCgnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnbnBtJywgYXJncywge2N3ZDogcGFja2FnZVBhdGgsIG1vZGU6ICdzaWxlbnQnfSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgTlBNIHRhZyB0byB0aGUgc3BlY2lmaWVkIHZlcnNpb24gZm9yIHRoZSBnaXZlbiBwYWNrYWdlLlxuICogQHRocm93cyBXaXRoIHRoZSBwcm9jZXNzIGxvZyBvdXRwdXQgaWYgdGhlIHRhZ2dpbmcgZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0TnBtVGFnRm9yUGFja2FnZShcbiAgICBwYWNrYWdlTmFtZTogc3RyaW5nLCBkaXN0VGFnOiBzdHJpbmcsIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2Rpc3QtdGFnJywgJ2FkZCcsIGAke3BhY2thZ2VOYW1lfUAke3ZlcnNpb259YCwgZGlzdFRhZ107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5wdXNoKCctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7bW9kZTogJ3NpbGVudCd9KTtcbn1cbiJdfQ==