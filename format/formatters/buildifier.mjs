/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { join } from 'path';
import { error } from '../../utils/console';
import { Formatter } from './base-formatter';
/**
 * Formatter for running buildifier against bazel related files.
 */
export class Buildifier extends Formatter {
    constructor() {
        super(...arguments);
        this.name = 'buildifier';
        this.binaryFilePath = join(this.git.baseDir, 'node_modules/.bin/buildifier');
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
                        error(`Error running buildifier on: ${file}`);
                        error(stderr);
                        error();
                        return true;
                    }
                    return false;
                }
            }
        };
    }
}
// The warning flag for buildifier copied from angular/angular's usage.
const BAZEL_WARNING_FLAG = `--warnings=attr-cfg,attr-license,attr-non-empty,attr-output-default,` +
    `attr-single-file,constant-glob,ctx-args,depset-iteration,depset-union,dict-concatenation,` +
    `duplicated-name,filetype,git-repository,http-archive,integer-division,load,load-on-top,` +
    `native-build,native-package,output-group,package-name,package-on-top,positional-args,` +
    `redefined-variable,repository-name,same-origin-load,string-iteration,unused-variable`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFMUIsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRTFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUzQzs7R0FFRztBQUNILE1BQU0sT0FBTyxVQUFXLFNBQVEsU0FBUztJQUF6Qzs7UUFDVyxTQUFJLEdBQUcsWUFBWSxDQUFDO1FBRXBCLG1CQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLDhCQUE4QixDQUFDLENBQUM7UUFFeEUsdUJBQWtCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWhGLFlBQU8sR0FBRztZQUNqQixLQUFLLEVBQUU7Z0JBQ0wsWUFBWSxFQUFFLEdBQUcsa0JBQWtCLHlDQUF5QztnQkFDNUUsUUFBUSxFQUNKLENBQUMsQ0FBUyxFQUFFLElBQVksRUFBRSxNQUFjLEVBQUUsRUFBRTtvQkFDMUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQXVCLENBQUMsT0FBTyxDQUFDO2dCQUMxRSxDQUFDO2FBQ047WUFDRCxNQUFNLEVBQUU7Z0JBQ04sWUFBWSxFQUFFLEdBQUcsa0JBQWtCLHdCQUF3QjtnQkFDM0QsUUFBUSxFQUNKLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxDQUFTLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ3hELElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTt3QkFDZCxLQUFLLENBQUMsZ0NBQWdDLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQzlDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDZCxLQUFLLEVBQUUsQ0FBQzt3QkFDUixPQUFPLElBQUksQ0FBQztxQkFDYjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO2FBQ047U0FDRixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBRUQsdUVBQXVFO0FBQ3ZFLE1BQU0sa0JBQWtCLEdBQUcsc0VBQXNFO0lBQzdGLDJGQUEyRjtJQUMzRix5RkFBeUY7SUFDekYsdUZBQXVGO0lBQ3ZGLHNGQUFzRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG5cbi8qKlxuICogRm9ybWF0dGVyIGZvciBydW5uaW5nIGJ1aWxkaWZpZXIgYWdhaW5zdCBiYXplbCByZWxhdGVkIGZpbGVzLlxuICovXG5leHBvcnQgY2xhc3MgQnVpbGRpZmllciBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG92ZXJyaWRlIG5hbWUgPSAnYnVpbGRpZmllcic7XG5cbiAgb3ZlcnJpZGUgYmluYXJ5RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICdub2RlX21vZHVsZXMvLmJpbi9idWlsZGlmaWVyJyk7XG5cbiAgb3ZlcnJpZGUgZGVmYXVsdEZpbGVNYXRjaGVyID0gWycqKi8qLmJ6bCcsICcqKi9CVUlMRC5iYXplbCcsICcqKi9XT1JLU1BBQ0UnLCAnKiovQlVJTEQnXTtcblxuICBvdmVycmlkZSBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAke0JBWkVMX1dBUk5JTkdfRkxBR30gLS1saW50PXdhcm4gLS1tb2RlPWNoZWNrIC0tZm9ybWF0PWpzb25gLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKF86IHN0cmluZywgY29kZTogbnVtYmVyLCBzdGRvdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGUgIT09IDAgfHwgIShKU09OLnBhcnNlKHN0ZG91dCkgYXMge3N1Y2Nlc3M6IHN0cmluZ30pLnN1Y2Nlc3M7XG4gICAgICAgICAgfSxcbiAgICB9LFxuICAgIGZvcm1hdDoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgJHtCQVpFTF9XQVJOSU5HX0ZMQUd9IC0tbGludD1maXggLS1tb2RlPWZpeGAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgICAgIGVycm9yKGBFcnJvciBydW5uaW5nIGJ1aWxkaWZpZXIgb246ICR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgZXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuLy8gVGhlIHdhcm5pbmcgZmxhZyBmb3IgYnVpbGRpZmllciBjb3BpZWQgZnJvbSBhbmd1bGFyL2FuZ3VsYXIncyB1c2FnZS5cbmNvbnN0IEJBWkVMX1dBUk5JTkdfRkxBRyA9IGAtLXdhcm5pbmdzPWF0dHItY2ZnLGF0dHItbGljZW5zZSxhdHRyLW5vbi1lbXB0eSxhdHRyLW91dHB1dC1kZWZhdWx0LGAgK1xuICAgIGBhdHRyLXNpbmdsZS1maWxlLGNvbnN0YW50LWdsb2IsY3R4LWFyZ3MsZGVwc2V0LWl0ZXJhdGlvbixkZXBzZXQtdW5pb24sZGljdC1jb25jYXRlbmF0aW9uLGAgK1xuICAgIGBkdXBsaWNhdGVkLW5hbWUsZmlsZXR5cGUsZ2l0LXJlcG9zaXRvcnksaHR0cC1hcmNoaXZlLGludGVnZXItZGl2aXNpb24sbG9hZCxsb2FkLW9uLXRvcCxgICtcbiAgICBgbmF0aXZlLWJ1aWxkLG5hdGl2ZS1wYWNrYWdlLG91dHB1dC1ncm91cCxwYWNrYWdlLW5hbWUscGFja2FnZS1vbi10b3AscG9zaXRpb25hbC1hcmdzLGAgK1xuICAgIGByZWRlZmluZWQtdmFyaWFibGUscmVwb3NpdG9yeS1uYW1lLHNhbWUtb3JpZ2luLWxvYWQsc3RyaW5nLWl0ZXJhdGlvbix1bnVzZWQtdmFyaWFibGVgO1xuIl19