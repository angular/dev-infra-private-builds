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
        this.binaryFilePath = path_1.join(this.git.baseDir, 'node_modules/.bin/buildifier');
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
                        console_1.error(`Error running buildifier on: ${file}`);
                        console_1.error(stderr);
                        console_1.error();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUEwQjtBQUUxQixpREFBMEM7QUFFMUMscURBQTJDO0FBRTNDOztHQUVHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsMEJBQVM7SUFBekM7O1FBQ1csU0FBSSxHQUFHLFlBQVksQ0FBQztRQUVwQixtQkFBYyxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1FBRXhFLHVCQUFrQixHQUFHLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVoRixZQUFPLEdBQUc7WUFDakIsS0FBSyxFQUFFO2dCQUNMLFlBQVksRUFBRSxHQUFHLGtCQUFrQix5Q0FBeUM7Z0JBQzVFLFFBQVEsRUFBRSxDQUFDLENBQVMsRUFBRSxJQUE2QixFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUNyRSw0RkFBNEY7b0JBQzVGLE1BQU0sR0FBRyxNQUFNLElBQUksSUFBSSxDQUFDO29CQUN4QixPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBd0IsQ0FBQyxPQUFPLENBQUM7Z0JBQzNFLENBQUM7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsR0FBRyxrQkFBa0Isd0JBQXdCO2dCQUMzRCxRQUFRLEVBQUUsQ0FBQyxJQUFZLEVBQUUsSUFBNkIsRUFBRSxDQUFTLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ25GLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTt3QkFDZCxlQUFLLENBQUMsZ0NBQWdDLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQzlDLGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDZCxlQUFLLEVBQUUsQ0FBQzt3QkFDUixPQUFPLElBQUksQ0FBQztxQkFDYjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBN0JELGdDQTZCQztBQUVELHVFQUF1RTtBQUN2RSxNQUFNLGtCQUFrQixHQUN0QixzRUFBc0U7SUFDdEUsMkZBQTJGO0lBQzNGLHlGQUF5RjtJQUN6Rix1RkFBdUY7SUFDdkYsc0ZBQXNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgYnVpbGRpZmllciBhZ2FpbnN0IGJhemVsIHJlbGF0ZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCdWlsZGlmaWVyIGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgb3ZlcnJpZGUgbmFtZSA9ICdidWlsZGlmaWVyJztcblxuICBvdmVycmlkZSBiaW5hcnlGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJ25vZGVfbW9kdWxlcy8uYmluL2J1aWxkaWZpZXInKTtcblxuICBvdmVycmlkZSBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyouYnpsJywgJyoqL0JVSUxELmJhemVsJywgJyoqL1dPUktTUEFDRScsICcqKi9CVUlMRCddO1xuXG4gIG92ZXJyaWRlIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9d2FybiAtLW1vZGU9Y2hlY2sgLS1mb3JtYXQ9anNvbmAsXG4gICAgICBjYWxsYmFjazogKF86IHN0cmluZywgY29kZTogbnVtYmVyIHwgTm9kZUpTLlNpZ25hbHMsIHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIEZvciBjYXNlcyB3aGVyZSBgc3Rkb3V0YCBpcyBlbXB0eSwgd2UgaW5zdGVhZCB1c2UgYW4gZW1wdHkgb2JqZWN0IHRvIHN0aWxsIGFsbG93IHBhcnNpbmcuXG4gICAgICAgIHN0ZG91dCA9IHN0ZG91dCB8fCAne30nO1xuICAgICAgICByZXR1cm4gY29kZSAhPT0gMCB8fCAhKEpTT04ucGFyc2Uoc3Rkb3V0KSBhcyB7c3VjY2VzczogYm9vbGVhbn0pLnN1Y2Nlc3M7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAke0JBWkVMX1dBUk5JTkdfRkxBR30gLS1saW50PWZpeCAtLW1vZGU9Zml4YCxcbiAgICAgIGNhbGxiYWNrOiAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIgfCBOb2RlSlMuU2lnbmFscywgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgIGVycm9yKGBFcnJvciBydW5uaW5nIGJ1aWxkaWZpZXIgb246ICR7ZmlsZX1gKTtcbiAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuXG4vLyBUaGUgd2FybmluZyBmbGFnIGZvciBidWlsZGlmaWVyIGNvcGllZCBmcm9tIGFuZ3VsYXIvYW5ndWxhcidzIHVzYWdlLlxuY29uc3QgQkFaRUxfV0FSTklOR19GTEFHID1cbiAgYC0td2FybmluZ3M9YXR0ci1jZmcsYXR0ci1saWNlbnNlLGF0dHItbm9uLWVtcHR5LGF0dHItb3V0cHV0LWRlZmF1bHQsYCArXG4gIGBhdHRyLXNpbmdsZS1maWxlLGNvbnN0YW50LWdsb2IsY3R4LWFyZ3MsZGVwc2V0LWl0ZXJhdGlvbixkZXBzZXQtdW5pb24sZGljdC1jb25jYXRlbmF0aW9uLGAgK1xuICBgZHVwbGljYXRlZC1uYW1lLGZpbGV0eXBlLGdpdC1yZXBvc2l0b3J5LGh0dHAtYXJjaGl2ZSxpbnRlZ2VyLWRpdmlzaW9uLGxvYWQsbG9hZC1vbi10b3AsYCArXG4gIGBuYXRpdmUtYnVpbGQsbmF0aXZlLXBhY2thZ2Usb3V0cHV0LWdyb3VwLHBhY2thZ2UtbmFtZSxwYWNrYWdlLW9uLXRvcCxwb3NpdGlvbmFsLWFyZ3MsYCArXG4gIGByZWRlZmluZWQtdmFyaWFibGUscmVwb3NpdG9yeS1uYW1lLHNhbWUtb3JpZ2luLWxvYWQsc3RyaW5nLWl0ZXJhdGlvbix1bnVzZWQtdmFyaWFibGVgO1xuIl19