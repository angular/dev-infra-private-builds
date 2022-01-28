"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prettier = void 0;
const path_1 = require("path");
const child_process_1 = require("../../utils/child-process");
const console_1 = require("../../utils/console");
const base_formatter_1 = require("./base-formatter");
/**
 * Formatter for running prettier against Typescript and Javascript files.
 */
class Prettier extends base_formatter_1.Formatter {
    constructor() {
        super(...arguments);
        this.name = 'prettier';
        this.binaryFilePath = (0, path_1.join)(this.git.baseDir, 'node_modules/.bin/prettier');
        this.defaultFileMatcher = ['**/*.{js,cjs,mjs}', '**/*.{ts,cts,mts}', '**/*.json'];
        /**
         * The configuration path of the prettier config, obtained during construction to prevent needing
         * to discover it repeatedly for each execution.
         */
        this.configPath = this.config['prettier']
            ? (0, child_process_1.spawnSync)(this.binaryFilePath, ['--find-config-path', '.']).stdout.trim()
            : '';
        this.actions = {
            check: {
                commandFlags: `--config ${this.configPath} --check`,
                callback: (_, code, stdout) => {
                    return code !== 0;
                },
            },
            format: {
                commandFlags: `--config ${this.configPath} --write`,
                callback: (file, code, _, stderr) => {
                    if (code !== 0) {
                        (0, console_1.error)(`Error running prettier on: ${file}`);
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
exports.Prettier = Prettier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHRpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvZm9ybWF0L2Zvcm1hdHRlcnMvcHJldHRpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQTBCO0FBRTFCLDZEQUFvRDtBQUNwRCxpREFBMEM7QUFFMUMscURBQTJDO0FBRTNDOztHQUVHO0FBQ0gsTUFBYSxRQUFTLFNBQVEsMEJBQVM7SUFBdkM7O1FBQ1csU0FBSSxHQUFHLFVBQVUsQ0FBQztRQUVsQixtQkFBYyxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFFdEUsdUJBQWtCLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUV0Rjs7O1dBR0c7UUFDSyxlQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDMUMsQ0FBQyxDQUFDLElBQUEseUJBQVMsRUFBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQzNFLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFRSxZQUFPLEdBQUc7WUFDakIsS0FBSyxFQUFFO2dCQUNMLFlBQVksRUFBRSxZQUFZLElBQUksQ0FBQyxVQUFVLFVBQVU7Z0JBQ25ELFFBQVEsRUFBRSxDQUFDLENBQVMsRUFBRSxJQUE2QixFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUNyRSxPQUFPLElBQUksS0FBSyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsWUFBWSxJQUFJLENBQUMsVUFBVSxVQUFVO2dCQUNuRCxRQUFRLEVBQUUsQ0FBQyxJQUFZLEVBQUUsSUFBNkIsRUFBRSxDQUFTLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ25GLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTt3QkFDZCxJQUFBLGVBQUssRUFBQyw4QkFBOEIsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDNUMsSUFBQSxlQUFLLEVBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2QsSUFBQSxlQUFLLEdBQUUsQ0FBQzt3QkFDUixPQUFPLElBQUksQ0FBQztxQkFDYjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBbkNELDRCQW1DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge3NwYXduU3luY30gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBwcmV0dGllciBhZ2FpbnN0IFR5cGVzY3JpcHQgYW5kIEphdmFzY3JpcHQgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcmV0dGllciBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG92ZXJyaWRlIG5hbWUgPSAncHJldHRpZXInO1xuXG4gIG92ZXJyaWRlIGJpbmFyeUZpbGVQYXRoID0gam9pbih0aGlzLmdpdC5iYXNlRGlyLCAnbm9kZV9tb2R1bGVzLy5iaW4vcHJldHRpZXInKTtcblxuICBvdmVycmlkZSBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyoue2pzLGNqcyxtanN9JywgJyoqLyoue3RzLGN0cyxtdHN9JywgJyoqLyouanNvbiddO1xuXG4gIC8qKlxuICAgKiBUaGUgY29uZmlndXJhdGlvbiBwYXRoIG9mIHRoZSBwcmV0dGllciBjb25maWcsIG9idGFpbmVkIGR1cmluZyBjb25zdHJ1Y3Rpb24gdG8gcHJldmVudCBuZWVkaW5nXG4gICAqIHRvIGRpc2NvdmVyIGl0IHJlcGVhdGVkbHkgZm9yIGVhY2ggZXhlY3V0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBjb25maWdQYXRoID0gdGhpcy5jb25maWdbJ3ByZXR0aWVyJ11cbiAgICA/IHNwYXduU3luYyh0aGlzLmJpbmFyeUZpbGVQYXRoLCBbJy0tZmluZC1jb25maWctcGF0aCcsICcuJ10pLnN0ZG91dC50cmltKClcbiAgICA6ICcnO1xuXG4gIG92ZXJyaWRlIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC0tY29uZmlnICR7dGhpcy5jb25maWdQYXRofSAtLWNoZWNrYCxcbiAgICAgIGNhbGxiYWNrOiAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIgfCBOb2RlSlMuU2lnbmFscywgc3Rkb3V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvZGUgIT09IDA7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLWNvbmZpZyAke3RoaXMuY29uZmlnUGF0aH0gLS13cml0ZWAsXG4gICAgICBjYWxsYmFjazogKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyIHwgTm9kZUpTLlNpZ25hbHMsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICBlcnJvcihgRXJyb3IgcnVubmluZyBwcmV0dGllciBvbjogJHtmaWxlfWApO1xuICAgICAgICAgIGVycm9yKHN0ZGVycik7XG4gICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59XG4iXX0=