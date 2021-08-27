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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhbmctZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9mb3JtYXR0ZXJzL2NsYW5nLWZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQkFBMEI7QUFFMUIsaURBQTBDO0FBRTFDLHFEQUEyQztBQUUzQzs7R0FFRztBQUNILE1BQWEsV0FBWSxTQUFRLDBCQUFTO0lBQTFDOztRQUNXLFNBQUksR0FBRyxjQUFjLENBQUM7UUFFdEIsbUJBQWMsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1FBRTFFLHVCQUFrQixHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFckMsWUFBTyxHQUFHO1lBQ2pCLEtBQUssRUFBRTtnQkFDTCxZQUFZLEVBQUUseUJBQXlCO2dCQUN2QyxRQUFRLEVBQUUsQ0FBQyxDQUFTLEVBQUUsSUFBNkIsRUFBRSxFQUFFO29CQUNyRCxPQUFPLElBQUksS0FBSyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsZ0JBQWdCO2dCQUM5QixRQUFRLEVBQUUsQ0FBQyxJQUFZLEVBQUUsSUFBNkIsRUFBRSxDQUFTLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ25GLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTt3QkFDZCxJQUFBLGVBQUssRUFBQyxrQ0FBa0MsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDaEQsSUFBQSxlQUFLLEVBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2QsSUFBQSxlQUFLLEdBQUUsQ0FBQzt3QkFDUixPQUFPLElBQUksQ0FBQztxQkFDYjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBM0JELGtDQTJCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBjbGFuZy1mb3JtYXQgYWdhaW5zdCBUeXBlc2NyaXB0IGFuZCBKYXZhc2NyaXB0IGZpbGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGFuZ0Zvcm1hdCBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG92ZXJyaWRlIG5hbWUgPSAnY2xhbmctZm9ybWF0JztcblxuICBvdmVycmlkZSBiaW5hcnlGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJ25vZGVfbW9kdWxlcy8uYmluL2NsYW5nLWZvcm1hdCcpO1xuXG4gIG92ZXJyaWRlIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi57dCxqfXMnXTtcblxuICBvdmVycmlkZSBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLVdlcnJvciAtbiAtc3R5bGU9ZmlsZWAsXG4gICAgICBjYWxsYmFjazogKF86IHN0cmluZywgY29kZTogbnVtYmVyIHwgTm9kZUpTLlNpZ25hbHMpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvZGUgIT09IDA7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtaSAtc3R5bGU9ZmlsZWAsXG4gICAgICBjYWxsYmFjazogKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyIHwgTm9kZUpTLlNpZ25hbHMsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICBlcnJvcihgRXJyb3IgcnVubmluZyBjbGFuZy1mb3JtYXQgb246ICR7ZmlsZX1gKTtcbiAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuIl19