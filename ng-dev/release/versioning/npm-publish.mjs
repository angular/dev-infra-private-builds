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
    await (0, child_process_1.spawn)('npm', args, { cwd: packagePath, mode: 'silent' });
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
    await (0, child_process_1.spawn)('npm', args, { mode: 'silent' });
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
        await (0, child_process_1.spawn)('npm', args, { mode: 'silent' });
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
    await (0, child_process_1.spawnInteractive)('npm', args);
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
        await (0, child_process_1.spawn)('npm', args, { mode: 'silent' });
    }
    finally {
        return npmIsLoggedIn(registryUrl);
    }
}
exports.npmLogout = npmLogout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXB1Ymxpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS92ZXJzaW9uaW5nL25wbS1wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILDZEQUFrRTtBQUlsRTs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsYUFBYSxDQUNqQyxXQUFtQixFQUNuQixPQUFtQixFQUNuQixXQUErQjtJQUUvQixNQUFNLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRSwwRUFBMEU7SUFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3RDO0lBQ0QsTUFBTSxJQUFBLHFCQUFLLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQVhELHNDQVdDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLG1CQUFtQixDQUN2QyxXQUFtQixFQUNuQixPQUFlLEVBQ2YsT0FBc0IsRUFDdEIsV0FBK0I7SUFFL0IsTUFBTSxJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEdBQUcsV0FBVyxJQUFJLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZFLDBFQUEwRTtJQUMxRSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDdEM7SUFDRCxNQUFNLElBQUEscUJBQUssRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQVpELGtEQVlDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLGFBQWEsQ0FBQyxXQUErQjtJQUNqRSxNQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hCLDBFQUEwRTtJQUMxRSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDdEM7SUFDRCxJQUFJO1FBQ0YsTUFBTSxJQUFBLHFCQUFLLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLEtBQUssQ0FBQztLQUNkO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBWkQsc0NBWUM7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsUUFBUSxDQUFDLFdBQStCO0lBQzVELE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLGdHQUFnRztJQUNoRyx5RkFBeUY7SUFDekYsOENBQThDO0lBQzlDLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzlDO0lBQ0Qsd0ZBQXdGO0lBQ3hGLDRFQUE0RTtJQUM1RSxNQUFNLElBQUEsZ0NBQWdCLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFYRCw0QkFXQztBQUVEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxTQUFTLENBQUMsV0FBK0I7SUFDN0QsTUFBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QixnR0FBZ0c7SUFDaEcseUZBQXlGO0lBQ3pGLCtDQUErQztJQUMvQyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7UUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztLQUM5QztJQUNELElBQUk7UUFDRixNQUFNLElBQUEscUJBQUssRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDNUM7WUFBUztRQUNSLE9BQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ25DO0FBQ0gsQ0FBQztBQWJELDhCQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NwYXduLCBzcGF3bkludGVyYWN0aXZlfSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcblxuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuL25wbS1yZWdpc3RyeSc7XG5cbi8qKlxuICogUnVucyBOUE0gcHVibGlzaCB3aXRoaW4gYSBzcGVjaWZpZWQgcGFja2FnZSBkaXJlY3RvcnkuXG4gKiBAdGhyb3dzIFdpdGggdGhlIHByb2Nlc3MgbG9nIG91dHB1dCBpZiB0aGUgcHVibGlzaCBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5OcG1QdWJsaXNoKFxuICBwYWNrYWdlUGF0aDogc3RyaW5nLFxuICBkaXN0VGFnOiBOcG1EaXN0VGFnLFxuICByZWdpc3RyeVVybDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ3B1Ymxpc2gnLCAnLS1hY2Nlc3MnLCAncHVibGljJywgJy0tdGFnJywgZGlzdFRhZ107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5wdXNoKCctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIGF3YWl0IHNwYXduKCducG0nLCBhcmdzLCB7Y3dkOiBwYWNrYWdlUGF0aCwgbW9kZTogJ3NpbGVudCd9KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBOUE0gdGFnIHRvIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBmb3IgdGhlIGdpdmVuIHBhY2thZ2UuXG4gKiBAdGhyb3dzIFdpdGggdGhlIHByb2Nlc3MgbG9nIG91dHB1dCBpZiB0aGUgdGFnZ2luZyBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXROcG1UYWdGb3JQYWNrYWdlKFxuICBwYWNrYWdlTmFtZTogc3RyaW5nLFxuICBkaXN0VGFnOiBzdHJpbmcsXG4gIHZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4gIHJlZ2lzdHJ5VXJsOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4pIHtcbiAgY29uc3QgYXJncyA9IFsnZGlzdC10YWcnLCAnYWRkJywgYCR7cGFja2FnZU5hbWV9QCR7dmVyc2lvbn1gLCBkaXN0VGFnXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnB1c2goJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgYXdhaXQgc3Bhd24oJ25wbScsIGFyZ3MsIHttb2RlOiAnc2lsZW50J30pO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb2dnZWQgaW50byBOUE0uXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb2dnZWQgaW50byBOUE0uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Jc0xvZ2dlZEluKHJlZ2lzdHJ5VXJsOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgYXJncyA9IFsnd2hvYW1pJ107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5wdXNoKCctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIHRyeSB7XG4gICAgYXdhaXQgc3Bhd24oJ25wbScsIGFyZ3MsIHttb2RlOiAnc2lsZW50J30pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIExvZyBpbnRvIE5QTSBhdCBhIHByb3ZpZGVkIHJlZ2lzdHJ5LlxuICogQHRocm93cyBXaXRoIHRoZSBgbnBtIGxvZ2luYCBzdGF0dXMgY29kZSBpZiB0aGUgbG9naW4gZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbnBtTG9naW4ocmVnaXN0cnlVcmw6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICBjb25zdCBhcmdzID0gWydsb2dpbicsICctLW5vLWJyb3dzZXInXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy4gVGhlIGAtLXJlZ2lzdHJ5YCBmbGFnXG4gIC8vIG11c3QgYmUgc3BsaWNlZCBpbnRvIHRoZSBjb3JyZWN0IHBsYWNlIGluIHRoZSBjb21tYW5kIGFzIG5wbSBleHBlY3RzIGl0IHRvIGJlIHRoZSBmbGFnXG4gIC8vIGltbWVkaWF0ZWx5IGZvbGxvd2luZyB0aGUgbG9naW4gc3ViY29tbWFuZC5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCAnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICAvLyBUaGUgbG9naW4gY29tbWFuZCBwcm9tcHRzIGZvciB1c2VybmFtZSwgcGFzc3dvcmQgYW5kIG90aGVyIHByb2ZpbGUgaW5mb3JtYXRpb24uIEhlbmNlXG4gIC8vIHRoZSBwcm9jZXNzIG5lZWRzIHRvIGJlIGludGVyYWN0aXZlIChpLmUuIHJlc3BlY3RpbmcgY3VycmVudCBUVFlzIHN0ZGluKS5cbiAgYXdhaXQgc3Bhd25JbnRlcmFjdGl2ZSgnbnBtJywgYXJncyk7XG59XG5cbi8qKlxuICogTG9nIG91dCBvZiBOUE0gYXQgYSBwcm92aWRlZCByZWdpc3RyeS5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHVzZXIgd2FzIGxvZ2dlZCBvdXQgb2YgTlBNLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbnBtTG9nb3V0KHJlZ2lzdHJ5VXJsOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgYXJncyA9IFsnbG9nb3V0J107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuIFRoZSBgLS1yZWdpc3RyeWAgZmxhZ1xuICAvLyBtdXN0IGJlIHNwbGljZWQgaW50byB0aGUgY29ycmVjdCBwbGFjZSBpbiB0aGUgY29tbWFuZCBhcyBucG0gZXhwZWN0cyBpdCB0byBiZSB0aGUgZmxhZ1xuICAvLyBpbW1lZGlhdGVseSBmb2xsb3dpbmcgdGhlIGxvZ291dCBzdWJjb21tYW5kLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3Muc3BsaWNlKDEsIDAsICctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIHRyeSB7XG4gICAgYXdhaXQgc3Bhd24oJ25wbScsIGFyZ3MsIHttb2RlOiAnc2lsZW50J30pO1xuICB9IGZpbmFsbHkge1xuICAgIHJldHVybiBucG1Jc0xvZ2dlZEluKHJlZ2lzdHJ5VXJsKTtcbiAgfVxufVxuIl19