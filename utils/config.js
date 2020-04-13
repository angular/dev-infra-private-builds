(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/utils/config", ["require", "exports", "fs", "json5", "path", "shelljs"], factory);
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
    var fs_1 = require("fs");
    var json5_1 = require("json5");
    var path_1 = require("path");
    var shelljs_1 = require("shelljs");
    /**
     * Gets the path of the directory for the repository base.
     */
    function getRepoBaseDir() {
        var baseRepoDir = shelljs_1.exec("git rev-parse --show-toplevel", { silent: true });
        if (baseRepoDir.code) {
            throw Error("Unable to find the path to the base directory of the repository.\n" +
                "Was the command run from inside of the repo?\n\n" +
                ("ERROR:\n " + baseRepoDir.stderr));
        }
        return baseRepoDir.trim();
    }
    exports.getRepoBaseDir = getRepoBaseDir;
    /**
     * Retrieve the configuration from the .dev-infra.json file.
     */
    function getAngularDevConfig() {
        var configPath = path_1.join(getRepoBaseDir(), '.dev-infra.json');
        var rawConfig = '';
        try {
            rawConfig = fs_1.readFileSync(configPath, 'utf8');
        }
        catch (_a) {
            throw Error("Unable to find config file at:\n" +
                ("  " + configPath));
        }
        return json5_1.parse(rawConfig);
    }
    exports.getAngularDevConfig = getAngularDevConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFnQztJQUNoQywrQkFBNEI7SUFDNUIsNkJBQTBCO0lBQzFCLG1DQUE2QjtJQUU3Qjs7T0FFRztJQUNILFNBQWdCLGNBQWM7UUFDNUIsSUFBTSxXQUFXLEdBQUcsY0FBSSxDQUFDLCtCQUErQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFO1lBQ3BCLE1BQU0sS0FBSyxDQUNQLG9FQUFvRTtnQkFDcEUsa0RBQWtEO2lCQUNsRCxjQUFZLFdBQVcsQ0FBQyxNQUFRLENBQUEsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsT0FBTyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQVRELHdDQVNDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixtQkFBbUI7UUFDakMsSUFBTSxVQUFVLEdBQUcsV0FBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDN0QsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUk7WUFDRixTQUFTLEdBQUcsaUJBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDOUM7UUFBQyxXQUFNO1lBQ04sTUFBTSxLQUFLLENBQ1Asa0NBQWtDO2lCQUNsQyxPQUFLLFVBQVksQ0FBQSxDQUFDLENBQUM7U0FDeEI7UUFDRCxPQUFPLGFBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBWEQsa0RBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtwYXJzZX0gZnJvbSAnanNvbjUnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnc2hlbGxqcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgcGF0aCBvZiB0aGUgZGlyZWN0b3J5IGZvciB0aGUgcmVwb3NpdG9yeSBiYXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVwb0Jhc2VEaXIoKSB7XG4gIGNvbnN0IGJhc2VSZXBvRGlyID0gZXhlYyhgZ2l0IHJldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWxgLCB7c2lsZW50OiB0cnVlfSk7XG4gIGlmIChiYXNlUmVwb0Rpci5jb2RlKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgIGBXYXMgdGhlIGNvbW1hbmQgcnVuIGZyb20gaW5zaWRlIG9mIHRoZSByZXBvP1xcblxcbmAgK1xuICAgICAgICBgRVJST1I6XFxuICR7YmFzZVJlcG9EaXIuc3RkZXJyfWApO1xuICB9XG4gIHJldHVybiBiYXNlUmVwb0Rpci50cmltKCk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgLmRldi1pbmZyYS5qc29uIGZpbGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmd1bGFyRGV2Q29uZmlnPEssIFQ+KCk6IERldkluZnJhQ29uZmlnPEssIFQ+IHtcbiAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgJy5kZXYtaW5mcmEuanNvbicpO1xuICBsZXQgcmF3Q29uZmlnID0gJyc7XG4gIHRyeSB7XG4gICAgcmF3Q29uZmlnID0gcmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgsICd1dGY4Jyk7XG4gIH0gY2F0Y2gge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGZpbmQgY29uZmlnIGZpbGUgYXQ6XFxuYCArXG4gICAgICAgIGAgICR7Y29uZmlnUGF0aH1gKTtcbiAgfVxuICByZXR1cm4gcGFyc2UocmF3Q29uZmlnKTtcbn1cblxuLyoqXG4gKiBJbnRlcmZhY2UgZXhyZXNzaW5nIHRoZSBleHBlY3RlZCBzdHJ1Y3R1cmUgb2YgdGhlIERldkluZnJhQ29uZmlnLlxuICogQWxsb3dzIGZvciBwcm92aWRpbmcgYSB0eXBpbmcgZm9yIGEgcGFydCBvZiB0aGUgY29uZmlnIHRvIHJlYWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGV2SW5mcmFDb25maWc8SywgVD4ge1xuICBbSzogc3RyaW5nXTogVDtcbn1cbiJdfQ==