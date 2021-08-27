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
        this.defaultFileMatcher = ['**/*.{t,j}s'];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHRpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvZm9ybWF0L2Zvcm1hdHRlcnMvcHJldHRpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQTBCO0FBRTFCLDZEQUFvRDtBQUNwRCxpREFBMEM7QUFFMUMscURBQTJDO0FBRTNDOztHQUVHO0FBQ0gsTUFBYSxRQUFTLFNBQVEsMEJBQVM7SUFBdkM7O1FBQ1csU0FBSSxHQUFHLFVBQVUsQ0FBQztRQUVsQixtQkFBYyxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFFdEUsdUJBQWtCLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUU5Qzs7O1dBR0c7UUFDSyxlQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDMUMsQ0FBQyxDQUFDLElBQUEseUJBQVMsRUFBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQzNFLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFRSxZQUFPLEdBQUc7WUFDakIsS0FBSyxFQUFFO2dCQUNMLFlBQVksRUFBRSxZQUFZLElBQUksQ0FBQyxVQUFVLFVBQVU7Z0JBQ25ELFFBQVEsRUFBRSxDQUFDLENBQVMsRUFBRSxJQUE2QixFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUNyRSxPQUFPLElBQUksS0FBSyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsWUFBWSxJQUFJLENBQUMsVUFBVSxVQUFVO2dCQUNuRCxRQUFRLEVBQUUsQ0FBQyxJQUFZLEVBQUUsSUFBNkIsRUFBRSxDQUFTLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ25GLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTt3QkFDZCxJQUFBLGVBQUssRUFBQyw4QkFBOEIsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDNUMsSUFBQSxlQUFLLEVBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2QsSUFBQSxlQUFLLEdBQUUsQ0FBQzt3QkFDUixPQUFPLElBQUksQ0FBQztxQkFDYjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBbkNELDRCQW1DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge3NwYXduU3luY30gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBwcmV0dGllciBhZ2FpbnN0IFR5cGVzY3JpcHQgYW5kIEphdmFzY3JpcHQgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcmV0dGllciBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG92ZXJyaWRlIG5hbWUgPSAncHJldHRpZXInO1xuXG4gIG92ZXJyaWRlIGJpbmFyeUZpbGVQYXRoID0gam9pbih0aGlzLmdpdC5iYXNlRGlyLCAnbm9kZV9tb2R1bGVzLy5iaW4vcHJldHRpZXInKTtcblxuICBvdmVycmlkZSBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyoue3Qsan1zJ107XG5cbiAgLyoqXG4gICAqIFRoZSBjb25maWd1cmF0aW9uIHBhdGggb2YgdGhlIHByZXR0aWVyIGNvbmZpZywgb2J0YWluZWQgZHVyaW5nIGNvbnN0cnVjdGlvbiB0byBwcmV2ZW50IG5lZWRpbmdcbiAgICogdG8gZGlzY292ZXIgaXQgcmVwZWF0ZWRseSBmb3IgZWFjaCBleGVjdXRpb24uXG4gICAqL1xuICBwcml2YXRlIGNvbmZpZ1BhdGggPSB0aGlzLmNvbmZpZ1sncHJldHRpZXInXVxuICAgID8gc3Bhd25TeW5jKHRoaXMuYmluYXJ5RmlsZVBhdGgsIFsnLS1maW5kLWNvbmZpZy1wYXRoJywgJy4nXSkuc3Rkb3V0LnRyaW0oKVxuICAgIDogJyc7XG5cbiAgb3ZlcnJpZGUgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1jb25maWcgJHt0aGlzLmNvbmZpZ1BhdGh9IC0tY2hlY2tgLFxuICAgICAgY2FsbGJhY2s6IChfOiBzdHJpbmcsIGNvZGU6IG51bWJlciB8IE5vZGVKUy5TaWduYWxzLCBzdGRvdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4gY29kZSAhPT0gMDtcbiAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC0tY29uZmlnICR7dGhpcy5jb25maWdQYXRofSAtLXdyaXRlYCxcbiAgICAgIGNhbGxiYWNrOiAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIgfCBOb2RlSlMuU2lnbmFscywgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgIGVycm9yKGBFcnJvciBydW5uaW5nIHByZXR0aWVyIG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgZXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==