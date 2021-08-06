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
        this.binaryFilePath = path_1.join(this.git.baseDir, 'node_modules/.bin/prettier');
        this.defaultFileMatcher = ['**/*.{t,j}s'];
        /**
         * The configuration path of the prettier config, obtained during construction to prevent needing
         * to discover it repeatedly for each execution.
         */
        this.configPath = this.config['prettier']
            ? child_process_1.spawnSync(this.binaryFilePath, ['--find-config-path', '.']).stdout.trim()
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
                        console_1.error(`Error running prettier on: ${file}`);
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
exports.Prettier = Prettier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHRpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvZm9ybWF0L2Zvcm1hdHRlcnMvcHJldHRpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQTBCO0FBRTFCLDZEQUFvRDtBQUNwRCxpREFBMEM7QUFFMUMscURBQTJDO0FBRTNDOztHQUVHO0FBQ0gsTUFBYSxRQUFTLFNBQVEsMEJBQVM7SUFBdkM7O1FBQ1csU0FBSSxHQUFHLFVBQVUsQ0FBQztRQUVsQixtQkFBYyxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBRXRFLHVCQUFrQixHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFOUM7OztXQUdHO1FBQ0ssZUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBQzFDLENBQUMsQ0FBQyx5QkFBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDM0UsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVFLFlBQU8sR0FBRztZQUNqQixLQUFLLEVBQUU7Z0JBQ0wsWUFBWSxFQUFFLFlBQVksSUFBSSxDQUFDLFVBQVUsVUFBVTtnQkFDbkQsUUFBUSxFQUFFLENBQUMsQ0FBUyxFQUFFLElBQTZCLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ3JFLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztnQkFDcEIsQ0FBQzthQUNGO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLFlBQVksRUFBRSxZQUFZLElBQUksQ0FBQyxVQUFVLFVBQVU7Z0JBQ25ELFFBQVEsRUFBRSxDQUFDLElBQVksRUFBRSxJQUE2QixFQUFFLENBQVMsRUFBRSxNQUFjLEVBQUUsRUFBRTtvQkFDbkYsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO3dCQUNkLGVBQUssQ0FBQyw4QkFBOEIsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDNUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNkLGVBQUssRUFBRSxDQUFDO3dCQUNSLE9BQU8sSUFBSSxDQUFDO3FCQUNiO29CQUNELE9BQU8sS0FBSyxDQUFDO2dCQUNmLENBQUM7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO0NBQUE7QUFuQ0QsNEJBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7c3Bhd25TeW5jfSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG5cbi8qKlxuICogRm9ybWF0dGVyIGZvciBydW5uaW5nIHByZXR0aWVyIGFnYWluc3QgVHlwZXNjcmlwdCBhbmQgSmF2YXNjcmlwdCBmaWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFByZXR0aWVyIGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgb3ZlcnJpZGUgbmFtZSA9ICdwcmV0dGllcic7XG5cbiAgb3ZlcnJpZGUgYmluYXJ5RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICdub2RlX21vZHVsZXMvLmJpbi9wcmV0dGllcicpO1xuXG4gIG92ZXJyaWRlIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi57dCxqfXMnXTtcblxuICAvKipcbiAgICogVGhlIGNvbmZpZ3VyYXRpb24gcGF0aCBvZiB0aGUgcHJldHRpZXIgY29uZmlnLCBvYnRhaW5lZCBkdXJpbmcgY29uc3RydWN0aW9uIHRvIHByZXZlbnQgbmVlZGluZ1xuICAgKiB0byBkaXNjb3ZlciBpdCByZXBlYXRlZGx5IGZvciBlYWNoIGV4ZWN1dGlvbi5cbiAgICovXG4gIHByaXZhdGUgY29uZmlnUGF0aCA9IHRoaXMuY29uZmlnWydwcmV0dGllciddXG4gICAgPyBzcGF3blN5bmModGhpcy5iaW5hcnlGaWxlUGF0aCwgWyctLWZpbmQtY29uZmlnLXBhdGgnLCAnLiddKS5zdGRvdXQudHJpbSgpXG4gICAgOiAnJztcblxuICBvdmVycmlkZSBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLWNvbmZpZyAke3RoaXMuY29uZmlnUGF0aH0gLS1jaGVja2AsXG4gICAgICBjYWxsYmFjazogKF86IHN0cmluZywgY29kZTogbnVtYmVyIHwgTm9kZUpTLlNpZ25hbHMsIHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBjb2RlICE9PSAwO1xuICAgICAgfSxcbiAgICB9LFxuICAgIGZvcm1hdDoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1jb25maWcgJHt0aGlzLmNvbmZpZ1BhdGh9IC0td3JpdGVgLFxuICAgICAgY2FsbGJhY2s6IChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciB8IE5vZGVKUy5TaWduYWxzLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgZXJyb3IoYEVycm9yIHJ1bm5pbmcgcHJldHRpZXIgb246ICR7ZmlsZX1gKTtcbiAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuIl19