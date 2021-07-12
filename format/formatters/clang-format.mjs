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
 * Formatter for running clang-format against Typescript and Javascript files
 */
export class ClangFormat extends Formatter {
    constructor() {
        super(...arguments);
        this.name = 'clang-format';
        this.binaryFilePath = join(this.git.baseDir, 'node_modules/.bin/clang-format');
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
                        error(`Error running clang-format on: ${file}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhbmctZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXR0ZXJzL2NsYW5nLWZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRTFCLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUUxQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFM0M7O0dBRUc7QUFDSCxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFBMUM7O1FBQ1csU0FBSSxHQUFHLGNBQWMsQ0FBQztRQUV0QixtQkFBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1FBRTFFLHVCQUFrQixHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFckMsWUFBTyxHQUFHO1lBQ2pCLEtBQUssRUFBRTtnQkFDTCxZQUFZLEVBQUUseUJBQXlCO2dCQUN2QyxRQUFRLEVBQ0osQ0FBQyxDQUFTLEVBQUUsSUFBWSxFQUFFLEVBQUU7b0JBQzFCLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztnQkFDcEIsQ0FBQzthQUNOO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLFlBQVksRUFBRSxnQkFBZ0I7Z0JBQzlCLFFBQVEsRUFDSixDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsQ0FBUyxFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUN4RCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7d0JBQ2QsS0FBSyxDQUFDLGtDQUFrQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUNoRCxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2QsS0FBSyxFQUFFLENBQUM7d0JBQ1IsT0FBTyxJQUFJLENBQUM7cUJBQ2I7b0JBQ0QsT0FBTyxLQUFLLENBQUM7Z0JBQ2YsQ0FBQzthQUNOO1NBQ0YsQ0FBQztJQUNKLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBjbGFuZy1mb3JtYXQgYWdhaW5zdCBUeXBlc2NyaXB0IGFuZCBKYXZhc2NyaXB0IGZpbGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGFuZ0Zvcm1hdCBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG92ZXJyaWRlIG5hbWUgPSAnY2xhbmctZm9ybWF0JztcblxuICBvdmVycmlkZSBiaW5hcnlGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJ25vZGVfbW9kdWxlcy8uYmluL2NsYW5nLWZvcm1hdCcpO1xuXG4gIG92ZXJyaWRlIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi57dCxqfXMnXTtcblxuICBvdmVycmlkZSBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLVdlcnJvciAtbiAtc3R5bGU9ZmlsZWAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb2RlICE9PSAwO1xuICAgICAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC1pIC1zdHlsZT1maWxlYCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgICAgZXJyb3IoYEVycm9yIHJ1bm5pbmcgY2xhbmctZm9ybWF0IG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgICAgIGVycm9yKHN0ZGVycik7XG4gICAgICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICB9XG4gIH07XG59XG4iXX0=