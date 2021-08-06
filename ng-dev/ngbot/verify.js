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
    const NGBOT_CONFIG_YAML_PATH = path_1.resolve(git.baseDir, '.github/angular-robot.yml');
    /** The NgBot config file */
    const ngBotYaml = fs_1.readFileSync(NGBOT_CONFIG_YAML_PATH, 'utf8');
    try {
        // Try parsing the config file to verify that the syntax is correct.
        yaml_1.parse(ngBotYaml);
        console_1.info(`${console_1.green('√')}  Valid NgBot YAML config`);
    }
    catch (e) {
        console_1.error(`${console_1.red('!')} Invalid NgBot YAML config`);
        console_1.error(e);
        process.exitCode = 1;
    }
}
exports.verify = verify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L25nYm90L3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwyQkFBZ0M7QUFDaEMsK0JBQTZCO0FBQzdCLCtCQUF3QztBQUV4Qyw4Q0FBeUQ7QUFDekQsd0RBQWtEO0FBRWxELFNBQWdCLE1BQU07SUFDcEIsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixxQ0FBcUM7SUFDckMsTUFBTSxzQkFBc0IsR0FBRyxjQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0lBRWpGLDRCQUE0QjtJQUM1QixNQUFNLFNBQVMsR0FBRyxpQkFBWSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRS9ELElBQUk7UUFDRixvRUFBb0U7UUFDcEUsWUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JCLGNBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUNoRDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsZUFBSyxDQUFDLEdBQUcsYUFBRyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQy9DLGVBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0tBQ3RCO0FBQ0gsQ0FBQztBQWpCRCx3QkFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtwYXJzZSBhcyBwYXJzZVlhbWx9IGZyb20gJ3lhbWwnO1xuXG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnkoKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIEZ1bGwgcGF0aCB0byBOZ0JvdCBjb25maWcgZmlsZSAqL1xuICBjb25zdCBOR0JPVF9DT05GSUdfWUFNTF9QQVRIID0gcmVzb2x2ZShnaXQuYmFzZURpciwgJy5naXRodWIvYW5ndWxhci1yb2JvdC55bWwnKTtcblxuICAvKiogVGhlIE5nQm90IGNvbmZpZyBmaWxlICovXG4gIGNvbnN0IG5nQm90WWFtbCA9IHJlYWRGaWxlU3luYyhOR0JPVF9DT05GSUdfWUFNTF9QQVRILCAndXRmOCcpO1xuXG4gIHRyeSB7XG4gICAgLy8gVHJ5IHBhcnNpbmcgdGhlIGNvbmZpZyBmaWxlIHRvIHZlcmlmeSB0aGF0IHRoZSBzeW50YXggaXMgY29ycmVjdC5cbiAgICBwYXJzZVlhbWwobmdCb3RZYW1sKTtcbiAgICBpbmZvKGAke2dyZWVuKCfiiJonKX0gIFZhbGlkIE5nQm90IFlBTUwgY29uZmlnYCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihgJHtyZWQoJyEnKX0gSW52YWxpZCBOZ0JvdCBZQU1MIGNvbmZpZ2ApO1xuICAgIGVycm9yKGUpO1xuICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICB9XG59XG4iXX0=