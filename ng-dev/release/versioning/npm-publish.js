"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.npmLogout = exports.npmLogin = exports.npmIsLoggedIn = exports.setNpmTagForPackage = exports.runNpmPublish = void 0;
const child_process_1 = require("../../utils/child-process");
/**
 * Runs NPM publish within a specified package directory.
 * @throws With the process log output if the publish failed.
 */
async function runNpmPublish(packagePath, distTag, registryUrl) {
    const args = ['publish', '--access', 'public', '--tag', distTag];
    // If a custom registry URL has been specified, add the `--registry` flag.
    if (registryUrl !== undefined) {
        args.push('--registry', registryUrl);
    }
    await child_process_1.spawn('npm', args, { cwd: packagePath, mode: 'silent' });
}
exports.runNpmPublish = runNpmPublish;
/**
 * Sets the NPM tag to the specified version for the given package.
 * @throws With the process log output if the tagging failed.
 */
async function setNpmTagForPackage(packageName, distTag, version, registryUrl) {
    const args = ['dist-tag', 'add', `${packageName}@${version}`, distTag];
    // If a custom registry URL has been specified, add the `--registry` flag.
    if (registryUrl !== undefined) {
        args.push('--registry', registryUrl);
    }
    await child_process_1.spawn('npm', args, { mode: 'silent' });
}
exports.setNpmTagForPackage = setNpmTagForPackage;
/**
 * Checks whether the user is currently logged into NPM.
 * @returns Whether the user is currently logged into NPM.
 */
async function npmIsLoggedIn(registryUrl) {
    const args = ['whoami'];
    // If a custom registry URL has been specified, add the `--registry` flag.
    if (registryUrl !== undefined) {
        args.push('--registry', registryUrl);
    }
    try {
        await child_process_1.spawn('npm', args, { mode: 'silent' });
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.npmIsLoggedIn = npmIsLoggedIn;
/**
 * Log into NPM at a provided registry.
 * @throws With the `npm login` status code if the login failed.
 */
async function npmLogin(registryUrl) {
    const args = ['login', '--no-browser'];
    // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
    // must be spliced into the correct place in the command as npm expects it to be the flag
    // immediately following the login subcommand.
    if (registryUrl !== undefined) {
        args.splice(1, 0, '--registry', registryUrl);
    }
    // The login command prompts for username, password and other profile information. Hence
    // the process needs to be interactive (i.e. respecting current TTYs stdin).
    await child_process_1.spawnInteractive('npm', args);
}
exports.npmLogin = npmLogin;
/**
 * Log out of NPM at a provided registry.
 * @returns Whether the user was logged out of NPM.
 */
async function npmLogout(registryUrl) {
    const args = ['logout'];
    // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
    // must be spliced into the correct place in the command as npm expects it to be the flag
    // immediately following the logout subcommand.
    if (registryUrl !== undefined) {
        args.splice(1, 0, '--registry', registryUrl);
    }
    try {
        await child_process_1.spawn('npm', args, { mode: 'silent' });
    }
    finally {
        return npmIsLoggedIn(registryUrl);
    }
}
exports.npmLogout = npmLogout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXB1Ymxpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS92ZXJzaW9uaW5nL25wbS1wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILDZEQUFrRTtBQUlsRTs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsYUFBYSxDQUNqQyxXQUFtQixFQUNuQixPQUFtQixFQUNuQixXQUErQjtJQUUvQixNQUFNLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRSwwRUFBMEU7SUFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3RDO0lBQ0QsTUFBTSxxQkFBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFYRCxzQ0FXQztBQUVEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxtQkFBbUIsQ0FDdkMsV0FBbUIsRUFDbkIsT0FBZSxFQUNmLE9BQXNCLEVBQ3RCLFdBQStCO0lBRS9CLE1BQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxHQUFHLFdBQVcsSUFBSSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2RSwwRUFBMEU7SUFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3RDO0lBQ0QsTUFBTSxxQkFBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBWkQsa0RBWUM7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsYUFBYSxDQUFDLFdBQStCO0lBQ2pFLE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEIsMEVBQTBFO0lBQzFFLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztLQUN0QztJQUNELElBQUk7UUFDRixNQUFNLHFCQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLEtBQUssQ0FBQztLQUNkO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBWkQsc0NBWUM7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsUUFBUSxDQUFDLFdBQStCO0lBQzVELE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLGdHQUFnRztJQUNoRyx5RkFBeUY7SUFDekYsOENBQThDO0lBQzlDLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzlDO0lBQ0Qsd0ZBQXdGO0lBQ3hGLDRFQUE0RTtJQUM1RSxNQUFNLGdDQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBWEQsNEJBV0M7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsU0FBUyxDQUFDLFdBQStCO0lBQzdELE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEIsZ0dBQWdHO0lBQ2hHLHlGQUF5RjtJQUN6RiwrQ0FBK0M7SUFDL0MsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1FBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDOUM7SUFDRCxJQUFJO1FBQ0YsTUFBTSxxQkFBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztLQUM1QztZQUFTO1FBQ1IsT0FBTyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDbkM7QUFDSCxDQUFDO0FBYkQsOEJBYUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7c3Bhd24sIHNwYXduSW50ZXJhY3RpdmV9IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuXG5pbXBvcnQge05wbURpc3RUYWd9IGZyb20gJy4vbnBtLXJlZ2lzdHJ5JztcblxuLyoqXG4gKiBSdW5zIE5QTSBwdWJsaXNoIHdpdGhpbiBhIHNwZWNpZmllZCBwYWNrYWdlIGRpcmVjdG9yeS5cbiAqIEB0aHJvd3MgV2l0aCB0aGUgcHJvY2VzcyBsb2cgb3V0cHV0IGlmIHRoZSBwdWJsaXNoIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bk5wbVB1Ymxpc2goXG4gIHBhY2thZ2VQYXRoOiBzdHJpbmcsXG4gIGRpc3RUYWc6IE5wbURpc3RUYWcsXG4gIHJlZ2lzdHJ5VXJsOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4pIHtcbiAgY29uc3QgYXJncyA9IFsncHVibGlzaCcsICctLWFjY2VzcycsICdwdWJsaWMnLCAnLS10YWcnLCBkaXN0VGFnXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnB1c2goJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgYXdhaXQgc3Bhd24oJ25wbScsIGFyZ3MsIHtjd2Q6IHBhY2thZ2VQYXRoLCBtb2RlOiAnc2lsZW50J30pO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIE5QTSB0YWcgdG8gdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGZvciB0aGUgZ2l2ZW4gcGFja2FnZS5cbiAqIEB0aHJvd3MgV2l0aCB0aGUgcHJvY2VzcyBsb2cgb3V0cHV0IGlmIHRoZSB0YWdnaW5nIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldE5wbVRhZ0ZvclBhY2thZ2UoXG4gIHBhY2thZ2VOYW1lOiBzdHJpbmcsXG4gIGRpc3RUYWc6IHN0cmluZyxcbiAgdmVyc2lvbjogc2VtdmVyLlNlbVZlcixcbiAgcmVnaXN0cnlVcmw6IHN0cmluZyB8IHVuZGVmaW5lZCxcbikge1xuICBjb25zdCBhcmdzID0gWydkaXN0LXRhZycsICdhZGQnLCBgJHtwYWNrYWdlTmFtZX1AJHt2ZXJzaW9ufWAsIGRpc3RUYWddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3MucHVzaCgnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICBhd2FpdCBzcGF3bignbnBtJywgYXJncywge21vZGU6ICdzaWxlbnQnfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHVzZXIgaXMgY3VycmVudGx5IGxvZ2dlZCBpbnRvIE5QTS5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHVzZXIgaXMgY3VycmVudGx5IGxvZ2dlZCBpbnRvIE5QTS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUlzTG9nZ2VkSW4ocmVnaXN0cnlVcmw6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBhcmdzID0gWyd3aG9hbWknXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnB1c2goJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBzcGF3bignbnBtJywgYXJncywge21vZGU6ICdzaWxlbnQnfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogTG9nIGludG8gTlBNIGF0IGEgcHJvdmlkZWQgcmVnaXN0cnkuXG4gKiBAdGhyb3dzIFdpdGggdGhlIGBucG0gbG9naW5gIHN0YXR1cyBjb2RlIGlmIHRoZSBsb2dpbiBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Mb2dpbihyZWdpc3RyeVVybDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2xvZ2luJywgJy0tbm8tYnJvd3NlciddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLiBUaGUgYC0tcmVnaXN0cnlgIGZsYWdcbiAgLy8gbXVzdCBiZSBzcGxpY2VkIGludG8gdGhlIGNvcnJlY3QgcGxhY2UgaW4gdGhlIGNvbW1hbmQgYXMgbnBtIGV4cGVjdHMgaXQgdG8gYmUgdGhlIGZsYWdcbiAgLy8gaW1tZWRpYXRlbHkgZm9sbG93aW5nIHRoZSBsb2dpbiBzdWJjb21tYW5kLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3Muc3BsaWNlKDEsIDAsICctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIC8vIFRoZSBsb2dpbiBjb21tYW5kIHByb21wdHMgZm9yIHVzZXJuYW1lLCBwYXNzd29yZCBhbmQgb3RoZXIgcHJvZmlsZSBpbmZvcm1hdGlvbi4gSGVuY2VcbiAgLy8gdGhlIHByb2Nlc3MgbmVlZHMgdG8gYmUgaW50ZXJhY3RpdmUgKGkuZS4gcmVzcGVjdGluZyBjdXJyZW50IFRUWXMgc3RkaW4pLlxuICBhd2FpdCBzcGF3bkludGVyYWN0aXZlKCducG0nLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBMb2cgb3V0IG9mIE5QTSBhdCBhIHByb3ZpZGVkIHJlZ2lzdHJ5LlxuICogQHJldHVybnMgV2hldGhlciB0aGUgdXNlciB3YXMgbG9nZ2VkIG91dCBvZiBOUE0uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Mb2dvdXQocmVnaXN0cnlVcmw6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBhcmdzID0gWydsb2dvdXQnXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy4gVGhlIGAtLXJlZ2lzdHJ5YCBmbGFnXG4gIC8vIG11c3QgYmUgc3BsaWNlZCBpbnRvIHRoZSBjb3JyZWN0IHBsYWNlIGluIHRoZSBjb21tYW5kIGFzIG5wbSBleHBlY3RzIGl0IHRvIGJlIHRoZSBmbGFnXG4gIC8vIGltbWVkaWF0ZWx5IGZvbGxvd2luZyB0aGUgbG9nb3V0IHN1YmNvbW1hbmQuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5zcGxpY2UoMSwgMCwgJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBzcGF3bignbnBtJywgYXJncywge21vZGU6ICdzaWxlbnQnfSk7XG4gIH0gZmluYWxseSB7XG4gICAgcmV0dXJuIG5wbUlzTG9nZ2VkSW4ocmVnaXN0cnlVcmwpO1xuICB9XG59XG4iXX0=