/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { join } from 'path';
import { exec } from 'shelljs';
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
        this.configPath = this.config['prettier'] ? exec(`${this.binaryFilePath} --find-config-path .`).trim() : '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHRpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvcHJldHRpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMxQixPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRTdCLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUUxQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFM0M7O0dBRUc7QUFDSCxNQUFNLE9BQU8sUUFBUyxTQUFRLFNBQVM7SUFBdkM7O1FBQ1csU0FBSSxHQUFHLFVBQVUsQ0FBQztRQUVsQixtQkFBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBRXRFLHVCQUFrQixHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFOUM7OztXQUdHO1FBQ0ssZUFBVSxHQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLHVCQUF1QixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVyRixZQUFPLEdBQUc7WUFDakIsS0FBSyxFQUFFO2dCQUNMLFlBQVksRUFBRSxZQUFZLElBQUksQ0FBQyxVQUFVLFVBQVU7Z0JBQ25ELFFBQVEsRUFDSixDQUFDLENBQVMsRUFBRSxJQUFZLEVBQUUsTUFBYyxFQUFFLEVBQUU7b0JBQzFDLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztnQkFDcEIsQ0FBQzthQUNOO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLFlBQVksRUFBRSxZQUFZLElBQUksQ0FBQyxVQUFVLFVBQVU7Z0JBQ25ELFFBQVEsRUFDSixDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsQ0FBUyxFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUN4RCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7d0JBQ2QsS0FBSyxDQUFDLDhCQUE4QixJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUM1QyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2QsS0FBSyxFQUFFLENBQUM7d0JBQ1IsT0FBTyxJQUFJLENBQUM7cUJBQ2I7b0JBQ0QsT0FBTyxLQUFLLENBQUM7Z0JBQ2YsQ0FBQzthQUNOO1NBQ0YsQ0FBQztJQUNKLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgcHJldHRpZXIgYWdhaW5zdCBUeXBlc2NyaXB0IGFuZCBKYXZhc2NyaXB0IGZpbGVzLlxuICovXG5leHBvcnQgY2xhc3MgUHJldHRpZXIgZXh0ZW5kcyBGb3JtYXR0ZXIge1xuICBvdmVycmlkZSBuYW1lID0gJ3ByZXR0aWVyJztcblxuICBvdmVycmlkZSBiaW5hcnlGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJ25vZGVfbW9kdWxlcy8uYmluL3ByZXR0aWVyJyk7XG5cbiAgb3ZlcnJpZGUgZGVmYXVsdEZpbGVNYXRjaGVyID0gWycqKi8qLnt0LGp9cyddO1xuXG4gIC8qKlxuICAgKiBUaGUgY29uZmlndXJhdGlvbiBwYXRoIG9mIHRoZSBwcmV0dGllciBjb25maWcsIG9idGFpbmVkIGR1cmluZyBjb25zdHJ1Y3Rpb24gdG8gcHJldmVudCBuZWVkaW5nXG4gICAqIHRvIGRpc2NvdmVyIGl0IHJlcGVhdGVkbHkgZm9yIGVhY2ggZXhlY3V0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBjb25maWdQYXRoID1cbiAgICAgIHRoaXMuY29uZmlnWydwcmV0dGllciddID8gZXhlYyhgJHt0aGlzLmJpbmFyeUZpbGVQYXRofSAtLWZpbmQtY29uZmlnLXBhdGggLmApLnRyaW0oKSA6ICcnO1xuXG4gIG92ZXJyaWRlIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC0tY29uZmlnICR7dGhpcy5jb25maWdQYXRofSAtLWNoZWNrYCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChfOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgc3Rkb3V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb2RlICE9PSAwO1xuICAgICAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC0tY29uZmlnICR7dGhpcy5jb25maWdQYXRofSAtLXdyaXRlYCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgICAgZXJyb3IoYEVycm9yIHJ1bm5pbmcgcHJldHRpZXIgb246ICR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgZXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuIl19