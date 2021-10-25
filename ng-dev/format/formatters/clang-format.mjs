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
        this.binaryFilePath = (0, path_1.join)(this.git.baseDir, 'node_modules/.bin/clang-format');
        this.defaultFileMatcher = ['**/*.{t,j,cj,mj}s'];
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
                        (0, console_1.error)(`Error running clang-format on: ${file}`);
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
exports.ClangFormat = ClangFormat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhbmctZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9mb3JtYXR0ZXJzL2NsYW5nLWZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQkFBMEI7QUFFMUIsaURBQTBDO0FBRTFDLHFEQUEyQztBQUUzQzs7R0FFRztBQUNILE1BQWEsV0FBWSxTQUFRLDBCQUFTO0lBQTFDOztRQUNXLFNBQUksR0FBRyxjQUFjLENBQUM7UUFFdEIsbUJBQWMsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1FBRTFFLHVCQUFrQixHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUUzQyxZQUFPLEdBQUc7WUFDakIsS0FBSyxFQUFFO2dCQUNMLFlBQVksRUFBRSx5QkFBeUI7Z0JBQ3ZDLFFBQVEsRUFBRSxDQUFDLENBQVMsRUFBRSxJQUE2QixFQUFFLEVBQUU7b0JBQ3JELE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztnQkFDcEIsQ0FBQzthQUNGO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLFlBQVksRUFBRSxnQkFBZ0I7Z0JBQzlCLFFBQVEsRUFBRSxDQUFDLElBQVksRUFBRSxJQUE2QixFQUFFLENBQVMsRUFBRSxNQUFjLEVBQUUsRUFBRTtvQkFDbkYsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO3dCQUNkLElBQUEsZUFBSyxFQUFDLGtDQUFrQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUNoRCxJQUFBLGVBQUssRUFBQyxNQUFNLENBQUMsQ0FBQzt3QkFDZCxJQUFBLGVBQUssR0FBRSxDQUFDO3dCQUNSLE9BQU8sSUFBSSxDQUFDO3FCQUNiO29CQUNELE9BQU8sS0FBSyxDQUFDO2dCQUNmLENBQUM7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO0NBQUE7QUEzQkQsa0NBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG5cbi8qKlxuICogRm9ybWF0dGVyIGZvciBydW5uaW5nIGNsYW5nLWZvcm1hdCBhZ2FpbnN0IFR5cGVzY3JpcHQgYW5kIEphdmFzY3JpcHQgZmlsZXNcbiAqL1xuZXhwb3J0IGNsYXNzIENsYW5nRm9ybWF0IGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgb3ZlcnJpZGUgbmFtZSA9ICdjbGFuZy1mb3JtYXQnO1xuXG4gIG92ZXJyaWRlIGJpbmFyeUZpbGVQYXRoID0gam9pbih0aGlzLmdpdC5iYXNlRGlyLCAnbm9kZV9tb2R1bGVzLy5iaW4vY2xhbmctZm9ybWF0Jyk7XG5cbiAgb3ZlcnJpZGUgZGVmYXVsdEZpbGVNYXRjaGVyID0gWycqKi8qLnt0LGosY2osbWp9cyddO1xuXG4gIG92ZXJyaWRlIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC0tV2Vycm9yIC1uIC1zdHlsZT1maWxlYCxcbiAgICAgIGNhbGxiYWNrOiAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIgfCBOb2RlSlMuU2lnbmFscykgPT4ge1xuICAgICAgICByZXR1cm4gY29kZSAhPT0gMDtcbiAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC1pIC1zdHlsZT1maWxlYCxcbiAgICAgIGNhbGxiYWNrOiAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIgfCBOb2RlSlMuU2lnbmFscywgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgIGVycm9yKGBFcnJvciBydW5uaW5nIGNsYW5nLWZvcm1hdCBvbjogJHtmaWxlfWApO1xuICAgICAgICAgIGVycm9yKHN0ZGVycik7XG4gICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59XG4iXX0=