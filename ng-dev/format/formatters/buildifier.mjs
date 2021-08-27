"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buildifier = void 0;
const path_1 = require("path");
const console_1 = require("../../utils/console");
const base_formatter_1 = require("./base-formatter");
/**
 * Formatter for running buildifier against bazel related files.
 */
class Buildifier extends base_formatter_1.Formatter {
    constructor() {
        super(...arguments);
        this.name = 'buildifier';
        this.binaryFilePath = (0, path_1.join)(this.git.baseDir, 'node_modules/.bin/buildifier');
        this.defaultFileMatcher = ['**/*.bzl', '**/BUILD.bazel', '**/WORKSPACE', '**/BUILD'];
        this.actions = {
            check: {
                commandFlags: `${BAZEL_WARNING_FLAG} --lint=warn --mode=check --format=json`,
                callback: (_, code, stdout) => {
                    // For cases where `stdout` is empty, we instead use an empty object to still allow parsing.
                    stdout = stdout || '{}';
                    return code !== 0 || !JSON.parse(stdout).success;
                },
            },
            format: {
                commandFlags: `${BAZEL_WARNING_FLAG} --lint=fix --mode=fix`,
                callback: (file, code, _, stderr) => {
                    if (code !== 0) {
                        (0, console_1.error)(`Error running buildifier on: ${file}`);
                        (0, console_1.error)(stderr);
                        (0, console_1.error)();
                        return true;
                    }
                    return false;
                },
            },
        };
    }
}
exports.Buildifier = Buildifier;
// The warning flag for buildifier copied from angular/angular's usage.
const BAZEL_WARNING_FLAG = `--warnings=attr-cfg,attr-license,attr-non-empty,attr-output-default,` +
    `attr-single-file,constant-glob,ctx-args,depset-iteration,depset-union,dict-concatenation,` +
    `duplicated-name,filetype,git-repository,http-archive,integer-division,load,load-on-top,` +
    `native-build,native-package,output-group,package-name,package-on-top,positional-args,` +
    `redefined-variable,repository-name,same-origin-load,string-iteration,unused-variable`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUEwQjtBQUUxQixpREFBMEM7QUFFMUMscURBQTJDO0FBRTNDOztHQUVHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsMEJBQVM7SUFBekM7O1FBQ1csU0FBSSxHQUFHLFlBQVksQ0FBQztRQUVwQixtQkFBYyxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLDhCQUE4QixDQUFDLENBQUM7UUFFeEUsdUJBQWtCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWhGLFlBQU8sR0FBRztZQUNqQixLQUFLLEVBQUU7Z0JBQ0wsWUFBWSxFQUFFLEdBQUcsa0JBQWtCLHlDQUF5QztnQkFDNUUsUUFBUSxFQUFFLENBQUMsQ0FBUyxFQUFFLElBQTZCLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ3JFLDRGQUE0RjtvQkFDNUYsTUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUM7b0JBQ3hCLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUF3QixDQUFDLE9BQU8sQ0FBQztnQkFDM0UsQ0FBQzthQUNGO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLFlBQVksRUFBRSxHQUFHLGtCQUFrQix3QkFBd0I7Z0JBQzNELFFBQVEsRUFBRSxDQUFDLElBQVksRUFBRSxJQUE2QixFQUFFLENBQVMsRUFBRSxNQUFjLEVBQUUsRUFBRTtvQkFDbkYsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO3dCQUNkLElBQUEsZUFBSyxFQUFDLGdDQUFnQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUM5QyxJQUFBLGVBQUssRUFBQyxNQUFNLENBQUMsQ0FBQzt3QkFDZCxJQUFBLGVBQUssR0FBRSxDQUFDO3dCQUNSLE9BQU8sSUFBSSxDQUFDO3FCQUNiO29CQUNELE9BQU8sS0FBSyxDQUFDO2dCQUNmLENBQUM7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO0NBQUE7QUE3QkQsZ0NBNkJDO0FBRUQsdUVBQXVFO0FBQ3ZFLE1BQU0sa0JBQWtCLEdBQ3RCLHNFQUFzRTtJQUN0RSwyRkFBMkY7SUFDM0YseUZBQXlGO0lBQ3pGLHVGQUF1RjtJQUN2RixzRkFBc0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBidWlsZGlmaWVyIGFnYWluc3QgYmF6ZWwgcmVsYXRlZCBmaWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJ1aWxkaWZpZXIgZXh0ZW5kcyBGb3JtYXR0ZXIge1xuICBvdmVycmlkZSBuYW1lID0gJ2J1aWxkaWZpZXInO1xuXG4gIG92ZXJyaWRlIGJpbmFyeUZpbGVQYXRoID0gam9pbih0aGlzLmdpdC5iYXNlRGlyLCAnbm9kZV9tb2R1bGVzLy5iaW4vYnVpbGRpZmllcicpO1xuXG4gIG92ZXJyaWRlIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi5iemwnLCAnKiovQlVJTEQuYmF6ZWwnLCAnKiovV09SS1NQQUNFJywgJyoqL0JVSUxEJ107XG5cbiAgb3ZlcnJpZGUgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgJHtCQVpFTF9XQVJOSU5HX0ZMQUd9IC0tbGludD13YXJuIC0tbW9kZT1jaGVjayAtLWZvcm1hdD1qc29uYCxcbiAgICAgIGNhbGxiYWNrOiAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIgfCBOb2RlSlMuU2lnbmFscywgc3Rkb3V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gRm9yIGNhc2VzIHdoZXJlIGBzdGRvdXRgIGlzIGVtcHR5LCB3ZSBpbnN0ZWFkIHVzZSBhbiBlbXB0eSBvYmplY3QgdG8gc3RpbGwgYWxsb3cgcGFyc2luZy5cbiAgICAgICAgc3Rkb3V0ID0gc3Rkb3V0IHx8ICd7fSc7XG4gICAgICAgIHJldHVybiBjb2RlICE9PSAwIHx8ICEoSlNPTi5wYXJzZShzdGRvdXQpIGFzIHtzdWNjZXNzOiBib29sZWFufSkuc3VjY2VzcztcbiAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9Zml4IC0tbW9kZT1maXhgLFxuICAgICAgY2FsbGJhY2s6IChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciB8IE5vZGVKUy5TaWduYWxzLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgZXJyb3IoYEVycm9yIHJ1bm5pbmcgYnVpbGRpZmllciBvbjogJHtmaWxlfWApO1xuICAgICAgICAgIGVycm9yKHN0ZGVycik7XG4gICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59XG5cbi8vIFRoZSB3YXJuaW5nIGZsYWcgZm9yIGJ1aWxkaWZpZXIgY29waWVkIGZyb20gYW5ndWxhci9hbmd1bGFyJ3MgdXNhZ2UuXG5jb25zdCBCQVpFTF9XQVJOSU5HX0ZMQUcgPVxuICBgLS13YXJuaW5ncz1hdHRyLWNmZyxhdHRyLWxpY2Vuc2UsYXR0ci1ub24tZW1wdHksYXR0ci1vdXRwdXQtZGVmYXVsdCxgICtcbiAgYGF0dHItc2luZ2xlLWZpbGUsY29uc3RhbnQtZ2xvYixjdHgtYXJncyxkZXBzZXQtaXRlcmF0aW9uLGRlcHNldC11bmlvbixkaWN0LWNvbmNhdGVuYXRpb24sYCArXG4gIGBkdXBsaWNhdGVkLW5hbWUsZmlsZXR5cGUsZ2l0LXJlcG9zaXRvcnksaHR0cC1hcmNoaXZlLGludGVnZXItZGl2aXNpb24sbG9hZCxsb2FkLW9uLXRvcCxgICtcbiAgYG5hdGl2ZS1idWlsZCxuYXRpdmUtcGFja2FnZSxvdXRwdXQtZ3JvdXAscGFja2FnZS1uYW1lLHBhY2thZ2Utb24tdG9wLHBvc2l0aW9uYWwtYXJncyxgICtcbiAgYHJlZGVmaW5lZC12YXJpYWJsZSxyZXBvc2l0b3J5LW5hbWUsc2FtZS1vcmlnaW4tbG9hZCxzdHJpbmctaXRlcmF0aW9uLHVudXNlZC12YXJpYWJsZWA7XG4iXX0=