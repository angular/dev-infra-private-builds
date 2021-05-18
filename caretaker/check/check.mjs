/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { getCaretakerConfig } from '../config';
import { CiModule } from './ci';
import { G3Module } from './g3';
import { GithubQueriesModule } from './github';
import { ServicesModule } from './services';
/** List of modules checked for the caretaker check command. */
const moduleList = [
    GithubQueriesModule,
    ServicesModule,
    CiModule,
    G3Module,
];
/** Check the status of services which Angular caretakers need to monitor. */
export function checkServiceStatuses() {
    return __awaiter(this, void 0, void 0, function* () {
        /** The configuration for the caretaker commands. */
        const config = getCaretakerConfig();
        /** List of instances of Caretaker Check modules */
        const caretakerCheckModules = moduleList.map(module => new module(config));
        // Module's `data` is casted as Promise<unknown> because the data types of the `module`'s `data`
        // promises do not match typings, however our usage here is only to determine when the promise
        // resolves.
        yield Promise.all(caretakerCheckModules.map(module => module.data));
        for (const module of caretakerCheckModules) {
            yield module.printToTerminal();
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM3QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRTFDLCtEQUErRDtBQUMvRCxNQUFNLFVBQVUsR0FBRztJQUNqQixtQkFBbUI7SUFDbkIsY0FBYztJQUNkLFFBQVE7SUFDUixRQUFRO0NBQ1QsQ0FBQztBQUVGLDZFQUE2RTtBQUM3RSxNQUFNLFVBQWdCLG9CQUFvQjs7UUFDeEMsb0RBQW9EO1FBQ3BELE1BQU0sTUFBTSxHQUFHLGtCQUFrQixFQUFFLENBQUM7UUFDcEMsbURBQW1EO1FBQ25ELE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFM0UsZ0dBQWdHO1FBQ2hHLDhGQUE4RjtRQUM5RixZQUFZO1FBQ1osTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUF3QixDQUFDLENBQUMsQ0FBQztRQUV4RixLQUFLLE1BQU0sTUFBTSxJQUFJLHFCQUFxQixFQUFFO1lBQzFDLE1BQU0sTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2V0Q2FyZXRha2VyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG5pbXBvcnQge0NpTW9kdWxlfSBmcm9tICcuL2NpJztcbmltcG9ydCB7RzNNb2R1bGV9IGZyb20gJy4vZzMnO1xuaW1wb3J0IHtHaXRodWJRdWVyaWVzTW9kdWxlfSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge1NlcnZpY2VzTW9kdWxlfSBmcm9tICcuL3NlcnZpY2VzJztcblxuLyoqIExpc3Qgb2YgbW9kdWxlcyBjaGVja2VkIGZvciB0aGUgY2FyZXRha2VyIGNoZWNrIGNvbW1hbmQuICovXG5jb25zdCBtb2R1bGVMaXN0ID0gW1xuICBHaXRodWJRdWVyaWVzTW9kdWxlLFxuICBTZXJ2aWNlc01vZHVsZSxcbiAgQ2lNb2R1bGUsXG4gIEczTW9kdWxlLFxuXTtcblxuLyoqIENoZWNrIHRoZSBzdGF0dXMgb2Ygc2VydmljZXMgd2hpY2ggQW5ndWxhciBjYXJldGFrZXJzIG5lZWQgdG8gbW9uaXRvci4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1NlcnZpY2VTdGF0dXNlcygpIHtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgY2FyZXRha2VyIGNvbW1hbmRzLiAqL1xuICBjb25zdCBjb25maWcgPSBnZXRDYXJldGFrZXJDb25maWcoKTtcbiAgLyoqIExpc3Qgb2YgaW5zdGFuY2VzIG9mIENhcmV0YWtlciBDaGVjayBtb2R1bGVzICovXG4gIGNvbnN0IGNhcmV0YWtlckNoZWNrTW9kdWxlcyA9IG1vZHVsZUxpc3QubWFwKG1vZHVsZSA9PiBuZXcgbW9kdWxlKGNvbmZpZykpO1xuXG4gIC8vIE1vZHVsZSdzIGBkYXRhYCBpcyBjYXN0ZWQgYXMgUHJvbWlzZTx1bmtub3duPiBiZWNhdXNlIHRoZSBkYXRhIHR5cGVzIG9mIHRoZSBgbW9kdWxlYCdzIGBkYXRhYFxuICAvLyBwcm9taXNlcyBkbyBub3QgbWF0Y2ggdHlwaW5ncywgaG93ZXZlciBvdXIgdXNhZ2UgaGVyZSBpcyBvbmx5IHRvIGRldGVybWluZSB3aGVuIHRoZSBwcm9taXNlXG4gIC8vIHJlc29sdmVzLlxuICBhd2FpdCBQcm9taXNlLmFsbChjYXJldGFrZXJDaGVja01vZHVsZXMubWFwKG1vZHVsZSA9PiBtb2R1bGUuZGF0YSBhcyBQcm9taXNlPHVua25vd24+KSk7XG5cbiAgZm9yIChjb25zdCBtb2R1bGUgb2YgY2FyZXRha2VyQ2hlY2tNb2R1bGVzKSB7XG4gICAgYXdhaXQgbW9kdWxlLnByaW50VG9UZXJtaW5hbCgpO1xuICB9XG59XG4iXX0=