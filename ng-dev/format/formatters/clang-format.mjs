"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClangFormat = void 0;
const path_1 = require("path");
const console_1 = require("../../utils/console");
const base_formatter_1 = require("./base-formatter");
/**
 * Formatter for running clang-format against Typescript and Javascript files
 */
class ClangFormat extends base_formatter_1.Formatter {
    constructor() {
        super(...arguments);
        this.name = 'clang-format';
        this.binaryFilePath = path_1.join(this.git.baseDir, 'node_modules/.bin/clang-format');
        this.defaultFileMatcher = ['**/*.{t,j}s'];
        this.actions = {
            check: {
                commandFlags: `--Werror -n -style=file`,
                callback: (_, code) => {
                    return code !== 0;
                },
            },
            format: {
                commandFlags: `-i -style=file`,
                callback: (file, code, _, stderr) => {
                    if (code !== 0) {
                        console_1.error(`Error running clang-format on: ${file}`);
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
exports.ClangFormat = ClangFormat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhbmctZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9mb3JtYXR0ZXJzL2NsYW5nLWZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQkFBMEI7QUFFMUIsaURBQTBDO0FBRTFDLHFEQUEyQztBQUUzQzs7R0FFRztBQUNILE1BQWEsV0FBWSxTQUFRLDBCQUFTO0lBQTFDOztRQUNXLFNBQUksR0FBRyxjQUFjLENBQUM7UUFFdEIsbUJBQWMsR0FBRyxXQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztRQUUxRSx1QkFBa0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXJDLFlBQU8sR0FBRztZQUNqQixLQUFLLEVBQUU7Z0JBQ0wsWUFBWSxFQUFFLHlCQUF5QjtnQkFDdkMsUUFBUSxFQUFFLENBQUMsQ0FBUyxFQUFFLElBQTZCLEVBQUUsRUFBRTtvQkFDckQsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDO2dCQUNwQixDQUFDO2FBQ0Y7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sWUFBWSxFQUFFLGdCQUFnQjtnQkFDOUIsUUFBUSxFQUFFLENBQUMsSUFBWSxFQUFFLElBQTZCLEVBQUUsQ0FBUyxFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUNuRixJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7d0JBQ2QsZUFBSyxDQUFDLGtDQUFrQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUNoRCxlQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2QsZUFBSyxFQUFFLENBQUM7d0JBQ1IsT0FBTyxJQUFJLENBQUM7cUJBQ2I7b0JBQ0QsT0FBTyxLQUFLLENBQUM7Z0JBQ2YsQ0FBQzthQUNGO1NBQ0YsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQTNCRCxrQ0EyQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgY2xhbmctZm9ybWF0IGFnYWluc3QgVHlwZXNjcmlwdCBhbmQgSmF2YXNjcmlwdCBmaWxlc1xuICovXG5leHBvcnQgY2xhc3MgQ2xhbmdGb3JtYXQgZXh0ZW5kcyBGb3JtYXR0ZXIge1xuICBvdmVycmlkZSBuYW1lID0gJ2NsYW5nLWZvcm1hdCc7XG5cbiAgb3ZlcnJpZGUgYmluYXJ5RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICdub2RlX21vZHVsZXMvLmJpbi9jbGFuZy1mb3JtYXQnKTtcblxuICBvdmVycmlkZSBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyoue3Qsan1zJ107XG5cbiAgb3ZlcnJpZGUgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1XZXJyb3IgLW4gLXN0eWxlPWZpbGVgLFxuICAgICAgY2FsbGJhY2s6IChfOiBzdHJpbmcsIGNvZGU6IG51bWJlciB8IE5vZGVKUy5TaWduYWxzKSA9PiB7XG4gICAgICAgIHJldHVybiBjb2RlICE9PSAwO1xuICAgICAgfSxcbiAgICB9LFxuICAgIGZvcm1hdDoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLWkgLXN0eWxlPWZpbGVgLFxuICAgICAgY2FsbGJhY2s6IChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciB8IE5vZGVKUy5TaWduYWxzLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgZXJyb3IoYEVycm9yIHJ1bm5pbmcgY2xhbmctZm9ybWF0IG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgZXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==