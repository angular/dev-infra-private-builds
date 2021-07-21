/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { join } from 'path';
import { spawnSync } from '../../utils/child-process';
import { error } from '../../utils/console';
import { Formatter } from './base-formatter';
/**
 * Formatter for running prettier against Typescript and Javascript files.
 */
export class Prettier extends Formatter {
    constructor() {
        super(...arguments);
        this.name = 'prettier';
        this.binaryFilePath = join(this.git.baseDir, 'node_modules/.bin/prettier');
        this.defaultFileMatcher = ['**/*.{t,j}s'];
        /**
         * The configuration path of the prettier config, obtained during construction to prevent needing
         * to discover it repeatedly for each execution.
         */
        this.configPath = this.config['prettier'] ?
            spawnSync(this.binaryFilePath, ['--find-config-path', '.']).stdout.trim() :
            '';
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
                        error(`Error running prettier on: ${file}`);
                        error(stderr);
                        error();
                        return true;
                    }
                    return false;
                },
            },
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHRpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvcHJldHRpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUUxQixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDcEQsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRTFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUzQzs7R0FFRztBQUNILE1BQU0sT0FBTyxRQUFTLFNBQVEsU0FBUztJQUF2Qzs7UUFDVyxTQUFJLEdBQUcsVUFBVSxDQUFDO1FBRWxCLG1CQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFFdEUsdUJBQWtCLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUU5Qzs7O1dBR0c7UUFDSyxlQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMzRSxFQUFFLENBQUM7UUFFRSxZQUFPLEdBQUc7WUFDakIsS0FBSyxFQUFFO2dCQUNMLFlBQVksRUFBRSxZQUFZLElBQUksQ0FBQyxVQUFVLFVBQVU7Z0JBQ25ELFFBQVEsRUFDSixDQUFDLENBQVMsRUFBRSxJQUEyQixFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUN6RCxPQUFPLElBQUksS0FBSyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7YUFDTjtZQUNELE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsWUFBWSxJQUFJLENBQUMsVUFBVSxVQUFVO2dCQUNuRCxRQUFRLEVBQ0osQ0FBQyxJQUFZLEVBQUUsSUFBMkIsRUFBRSxDQUFTLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQ3ZFLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTt3QkFDZCxLQUFLLENBQUMsOEJBQThCLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQzVDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDZCxLQUFLLEVBQUUsQ0FBQzt3QkFDUixPQUFPLElBQUksQ0FBQztxQkFDYjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO2FBQ047U0FDRixDQUFDO0lBQ0osQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7c3Bhd25TeW5jfSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG5cbi8qKlxuICogRm9ybWF0dGVyIGZvciBydW5uaW5nIHByZXR0aWVyIGFnYWluc3QgVHlwZXNjcmlwdCBhbmQgSmF2YXNjcmlwdCBmaWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFByZXR0aWVyIGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgb3ZlcnJpZGUgbmFtZSA9ICdwcmV0dGllcic7XG5cbiAgb3ZlcnJpZGUgYmluYXJ5RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICdub2RlX21vZHVsZXMvLmJpbi9wcmV0dGllcicpO1xuXG4gIG92ZXJyaWRlIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi57dCxqfXMnXTtcblxuICAvKipcbiAgICogVGhlIGNvbmZpZ3VyYXRpb24gcGF0aCBvZiB0aGUgcHJldHRpZXIgY29uZmlnLCBvYnRhaW5lZCBkdXJpbmcgY29uc3RydWN0aW9uIHRvIHByZXZlbnQgbmVlZGluZ1xuICAgKiB0byBkaXNjb3ZlciBpdCByZXBlYXRlZGx5IGZvciBlYWNoIGV4ZWN1dGlvbi5cbiAgICovXG4gIHByaXZhdGUgY29uZmlnUGF0aCA9IHRoaXMuY29uZmlnWydwcmV0dGllciddID9cbiAgICAgIHNwYXduU3luYyh0aGlzLmJpbmFyeUZpbGVQYXRoLCBbJy0tZmluZC1jb25maWctcGF0aCcsICcuJ10pLnN0ZG91dC50cmltKCkgOlxuICAgICAgJyc7XG5cbiAgb3ZlcnJpZGUgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1jb25maWcgJHt0aGlzLmNvbmZpZ1BhdGh9IC0tY2hlY2tgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKF86IHN0cmluZywgY29kZTogbnVtYmVyfE5vZGVKUy5TaWduYWxzLCBzdGRvdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGUgIT09IDA7XG4gICAgICAgICAgfSxcbiAgICB9LFxuICAgIGZvcm1hdDoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1jb25maWcgJHt0aGlzLmNvbmZpZ1BhdGh9IC0td3JpdGVgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyfE5vZGVKUy5TaWduYWxzLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgICAgICBlcnJvcihgRXJyb3IgcnVubmluZyBwcmV0dGllciBvbjogJHtmaWxlfWApO1xuICAgICAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9LFxuICAgIH0sXG4gIH07XG59XG4iXX0=