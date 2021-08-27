"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = require("yaml");
const console_1 = require("../utils/console");
const git_client_1 = require("../utils/git/git-client");
function verify() {
    const git = git_client_1.GitClient.get();
    /** Full path to NgBot config file */
    const NGBOT_CONFIG_YAML_PATH = (0, path_1.resolve)(git.baseDir, '.github/angular-robot.yml');
    /** The NgBot config file */
    const ngBotYaml = (0, fs_1.readFileSync)(NGBOT_CONFIG_YAML_PATH, 'utf8');
    try {
        // Try parsing the config file to verify that the syntax is correct.
        (0, yaml_1.parse)(ngBotYaml);
        (0, console_1.info)(`${(0, console_1.green)('√')}  Valid NgBot YAML config`);
    }
    catch (e) {
        (0, console_1.error)(`${(0, console_1.red)('!')} Invalid NgBot YAML config`);
        (0, console_1.error)(e);
        process.exitCode = 1;
    }
}
exports.verify = verify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L25nYm90L3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwyQkFBZ0M7QUFDaEMsK0JBQTZCO0FBQzdCLCtCQUF3QztBQUV4Qyw4Q0FBeUQ7QUFDekQsd0RBQWtEO0FBRWxELFNBQWdCLE1BQU07SUFDcEIsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixxQ0FBcUM7SUFDckMsTUFBTSxzQkFBc0IsR0FBRyxJQUFBLGNBQU8sRUFBQyxHQUFHLENBQUMsT0FBTyxFQUFFLDJCQUEyQixDQUFDLENBQUM7SUFFakYsNEJBQTRCO0lBQzVCLE1BQU0sU0FBUyxHQUFHLElBQUEsaUJBQVksRUFBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUUvRCxJQUFJO1FBQ0Ysb0VBQW9FO1FBQ3BFLElBQUEsWUFBUyxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JCLElBQUEsY0FBSSxFQUFDLEdBQUcsSUFBQSxlQUFLLEVBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7S0FDaEQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLElBQUEsZUFBSyxFQUFDLEdBQUcsSUFBQSxhQUFHLEVBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDL0MsSUFBQSxlQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztLQUN0QjtBQUNILENBQUM7QUFqQkQsd0JBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VZYW1sfSBmcm9tICd5YW1sJztcblxuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZH0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5KCkge1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIC8qKiBGdWxsIHBhdGggdG8gTmdCb3QgY29uZmlnIGZpbGUgKi9cbiAgY29uc3QgTkdCT1RfQ09ORklHX1lBTUxfUEFUSCA9IHJlc29sdmUoZ2l0LmJhc2VEaXIsICcuZ2l0aHViL2FuZ3VsYXItcm9ib3QueW1sJyk7XG5cbiAgLyoqIFRoZSBOZ0JvdCBjb25maWcgZmlsZSAqL1xuICBjb25zdCBuZ0JvdFlhbWwgPSByZWFkRmlsZVN5bmMoTkdCT1RfQ09ORklHX1lBTUxfUEFUSCwgJ3V0ZjgnKTtcblxuICB0cnkge1xuICAgIC8vIFRyeSBwYXJzaW5nIHRoZSBjb25maWcgZmlsZSB0byB2ZXJpZnkgdGhhdCB0aGUgc3ludGF4IGlzIGNvcnJlY3QuXG4gICAgcGFyc2VZYW1sKG5nQm90WWFtbCk7XG4gICAgaW5mbyhgJHtncmVlbign4oiaJyl9ICBWYWxpZCBOZ0JvdCBZQU1MIGNvbmZpZ2ApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IoYCR7cmVkKCchJyl9IEludmFsaWQgTmdCb3QgWUFNTCBjb25maWdgKTtcbiAgICBlcnJvcihlKTtcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbiAgfVxufVxuIl19