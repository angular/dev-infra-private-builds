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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUEwQjtBQUUxQixpREFBMEM7QUFFMUMscURBQTJDO0FBRTNDOztHQUVHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsMEJBQVM7SUFBekM7O1FBQ1csU0FBSSxHQUFHLFlBQVksQ0FBQztRQUVwQixtQkFBYyxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1FBRXhFLHVCQUFrQixHQUFHLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVoRixZQUFPLEdBQUc7WUFDakIsS0FBSyxFQUFFO2dCQUNMLFlBQVksRUFBRSxHQUFHLGtCQUFrQix5Q0FBeUM7Z0JBQzVFLFFBQVEsRUFBRSxDQUFDLENBQVMsRUFBRSxJQUE2QixFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUNyRSxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBdUIsQ0FBQyxPQUFPLENBQUM7Z0JBQzFFLENBQUM7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsR0FBRyxrQkFBa0Isd0JBQXdCO2dCQUMzRCxRQUFRLEVBQUUsQ0FBQyxJQUFZLEVBQUUsSUFBNkIsRUFBRSxDQUFTLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ25GLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTt3QkFDZCxlQUFLLENBQUMsZ0NBQWdDLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQzlDLGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDZCxlQUFLLEVBQUUsQ0FBQzt3QkFDUixPQUFPLElBQUksQ0FBQztxQkFDYjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBM0JELGdDQTJCQztBQUVELHVFQUF1RTtBQUN2RSxNQUFNLGtCQUFrQixHQUN0QixzRUFBc0U7SUFDdEUsMkZBQTJGO0lBQzNGLHlGQUF5RjtJQUN6Rix1RkFBdUY7SUFDdkYsc0ZBQXNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgYnVpbGRpZmllciBhZ2FpbnN0IGJhemVsIHJlbGF0ZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCdWlsZGlmaWVyIGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgb3ZlcnJpZGUgbmFtZSA9ICdidWlsZGlmaWVyJztcblxuICBvdmVycmlkZSBiaW5hcnlGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJ25vZGVfbW9kdWxlcy8uYmluL2J1aWxkaWZpZXInKTtcblxuICBvdmVycmlkZSBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyouYnpsJywgJyoqL0JVSUxELmJhemVsJywgJyoqL1dPUktTUEFDRScsICcqKi9CVUlMRCddO1xuXG4gIG92ZXJyaWRlIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9d2FybiAtLW1vZGU9Y2hlY2sgLS1mb3JtYXQ9anNvbmAsXG4gICAgICBjYWxsYmFjazogKF86IHN0cmluZywgY29kZTogbnVtYmVyIHwgTm9kZUpTLlNpZ25hbHMsIHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBjb2RlICE9PSAwIHx8ICEoSlNPTi5wYXJzZShzdGRvdXQpIGFzIHtzdWNjZXNzOiBzdHJpbmd9KS5zdWNjZXNzO1xuICAgICAgfSxcbiAgICB9LFxuICAgIGZvcm1hdDoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgJHtCQVpFTF9XQVJOSU5HX0ZMQUd9IC0tbGludD1maXggLS1tb2RlPWZpeGAsXG4gICAgICBjYWxsYmFjazogKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyIHwgTm9kZUpTLlNpZ25hbHMsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICBlcnJvcihgRXJyb3IgcnVubmluZyBidWlsZGlmaWVyIG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgZXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn1cblxuLy8gVGhlIHdhcm5pbmcgZmxhZyBmb3IgYnVpbGRpZmllciBjb3BpZWQgZnJvbSBhbmd1bGFyL2FuZ3VsYXIncyB1c2FnZS5cbmNvbnN0IEJBWkVMX1dBUk5JTkdfRkxBRyA9XG4gIGAtLXdhcm5pbmdzPWF0dHItY2ZnLGF0dHItbGljZW5zZSxhdHRyLW5vbi1lbXB0eSxhdHRyLW91dHB1dC1kZWZhdWx0LGAgK1xuICBgYXR0ci1zaW5nbGUtZmlsZSxjb25zdGFudC1nbG9iLGN0eC1hcmdzLGRlcHNldC1pdGVyYXRpb24sZGVwc2V0LXVuaW9uLGRpY3QtY29uY2F0ZW5hdGlvbixgICtcbiAgYGR1cGxpY2F0ZWQtbmFtZSxmaWxldHlwZSxnaXQtcmVwb3NpdG9yeSxodHRwLWFyY2hpdmUsaW50ZWdlci1kaXZpc2lvbixsb2FkLGxvYWQtb24tdG9wLGAgK1xuICBgbmF0aXZlLWJ1aWxkLG5hdGl2ZS1wYWNrYWdlLG91dHB1dC1ncm91cCxwYWNrYWdlLW5hbWUscGFja2FnZS1vbi10b3AscG9zaXRpb25hbC1hcmdzLGAgK1xuICBgcmVkZWZpbmVkLXZhcmlhYmxlLHJlcG9zaXRvcnktbmFtZSxzYW1lLW9yaWdpbi1sb2FkLHN0cmluZy1pdGVyYXRpb24sdW51c2VkLXZhcmlhYmxlYDtcbiJdfQ==