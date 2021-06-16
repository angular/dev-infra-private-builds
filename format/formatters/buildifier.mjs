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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFMUIsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRTFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUzQzs7R0FFRztBQUNILE1BQU0sT0FBTyxVQUFXLFNBQVEsU0FBUztJQUF6Qzs7UUFDRSxTQUFJLEdBQUcsWUFBWSxDQUFDO1FBRXBCLG1CQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLDhCQUE4QixDQUFDLENBQUM7UUFFeEUsdUJBQWtCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWhGLFlBQU8sR0FBRztZQUNSLEtBQUssRUFBRTtnQkFDTCxZQUFZLEVBQUUsR0FBRyxrQkFBa0IseUNBQXlDO2dCQUM1RSxRQUFRLEVBQ0osQ0FBQyxDQUFTLEVBQUUsSUFBWSxFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUMxQyxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBdUIsQ0FBQyxPQUFPLENBQUM7Z0JBQzFFLENBQUM7YUFDTjtZQUNELE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsR0FBRyxrQkFBa0Isd0JBQXdCO2dCQUMzRCxRQUFRLEVBQ0osQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLENBQVMsRUFBRSxNQUFjLEVBQUUsRUFBRTtvQkFDeEQsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO3dCQUNkLEtBQUssQ0FBQyxnQ0FBZ0MsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDOUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNkLEtBQUssRUFBRSxDQUFDO3dCQUNSLE9BQU8sSUFBSSxDQUFDO3FCQUNiO29CQUNELE9BQU8sS0FBSyxDQUFDO2dCQUNmLENBQUM7YUFDTjtTQUNGLENBQUM7SUFDSixDQUFDO0NBQUE7QUFFRCx1RUFBdUU7QUFDdkUsTUFBTSxrQkFBa0IsR0FBRyxzRUFBc0U7SUFDN0YsMkZBQTJGO0lBQzNGLHlGQUF5RjtJQUN6Rix1RkFBdUY7SUFDdkYsc0ZBQXNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgYnVpbGRpZmllciBhZ2FpbnN0IGJhemVsIHJlbGF0ZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCdWlsZGlmaWVyIGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgbmFtZSA9ICdidWlsZGlmaWVyJztcblxuICBiaW5hcnlGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJ25vZGVfbW9kdWxlcy8uYmluL2J1aWxkaWZpZXInKTtcblxuICBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyouYnpsJywgJyoqL0JVSUxELmJhemVsJywgJyoqL1dPUktTUEFDRScsICcqKi9CVUlMRCddO1xuXG4gIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9d2FybiAtLW1vZGU9Y2hlY2sgLS1mb3JtYXQ9anNvbmAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIsIHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29kZSAhPT0gMCB8fCAhKEpTT04ucGFyc2Uoc3Rkb3V0KSBhcyB7c3VjY2Vzczogc3RyaW5nfSkuc3VjY2VzcztcbiAgICAgICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAke0JBWkVMX1dBUk5JTkdfRkxBR30gLS1saW50PWZpeCAtLW1vZGU9Zml4YCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgICAgZXJyb3IoYEVycm9yIHJ1bm5pbmcgYnVpbGRpZmllciBvbjogJHtmaWxlfWApO1xuICAgICAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vLyBUaGUgd2FybmluZyBmbGFnIGZvciBidWlsZGlmaWVyIGNvcGllZCBmcm9tIGFuZ3VsYXIvYW5ndWxhcidzIHVzYWdlLlxuY29uc3QgQkFaRUxfV0FSTklOR19GTEFHID0gYC0td2FybmluZ3M9YXR0ci1jZmcsYXR0ci1saWNlbnNlLGF0dHItbm9uLWVtcHR5LGF0dHItb3V0cHV0LWRlZmF1bHQsYCArXG4gICAgYGF0dHItc2luZ2xlLWZpbGUsY29uc3RhbnQtZ2xvYixjdHgtYXJncyxkZXBzZXQtaXRlcmF0aW9uLGRlcHNldC11bmlvbixkaWN0LWNvbmNhdGVuYXRpb24sYCArXG4gICAgYGR1cGxpY2F0ZWQtbmFtZSxmaWxldHlwZSxnaXQtcmVwb3NpdG9yeSxodHRwLWFyY2hpdmUsaW50ZWdlci1kaXZpc2lvbixsb2FkLGxvYWQtb24tdG9wLGAgK1xuICAgIGBuYXRpdmUtYnVpbGQsbmF0aXZlLXBhY2thZ2Usb3V0cHV0LWdyb3VwLHBhY2thZ2UtbmFtZSxwYWNrYWdlLW9uLXRvcCxwb3NpdGlvbmFsLWFyZ3MsYCArXG4gICAgYHJlZGVmaW5lZC12YXJpYWJsZSxyZXBvc2l0b3J5LW5hbWUsc2FtZS1vcmlnaW4tbG9hZCxzdHJpbmctaXRlcmF0aW9uLHVudXNlZC12YXJpYWJsZWA7XG4iXX0=