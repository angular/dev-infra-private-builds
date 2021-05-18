/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { spawnInteractiveCommand, spawnWithDebugOutput } from '../../utils/child-process';
/**
 * Runs NPM publish within a specified package directory.
 * @throws With the process log output if the publish failed.
 */
export function runNpmPublish(packagePath, distTag, registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['publish', '--access', 'public', '--tag', distTag];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        yield spawnWithDebugOutput('npm', args, { cwd: packagePath, mode: 'silent' });
    });
}
/**
 * Sets the NPM tag to the specified version for the given package.
 * @throws With the process log output if the tagging failed.
 */
export function setNpmTagForPackage(packageName, distTag, version, registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['dist-tag', 'add', `${packageName}@${version}`, distTag];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
    });
}
/**
 * Checks whether the user is currently logged into NPM.
 * @returns Whether the user is currently logged into NPM.
 */
export function npmIsLoggedIn(registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['whoami'];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        try {
            yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
        }
        catch (e) {
            return false;
        }
        return true;
    });
}
/**
 * Log into NPM at a provided registry.
 * @throws With the `npm login` status code if the login failed.
 */
export function npmLogin(registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['login', '--no-browser'];
        // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
        // must be spliced into the correct place in the command as npm expects it to be the flag
        // immediately following the login subcommand.
        if (registryUrl !== undefined) {
            args.splice(1, 0, '--registry', registryUrl);
        }
        // The login command prompts for username, password and other profile information. Hence
        // the process needs to be interactive (i.e. respecting current TTYs stdin).
        yield spawnInteractiveCommand('npm', args);
    });
}
/**
 * Log out of NPM at a provided registry.
 * @returns Whether the user was logged out of NPM.
 */
export function npmLogout(registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['logout'];
        // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
        // must be spliced into the correct place in the command as npm expects it to be the flag
        // immediately following the logout subcommand.
        if (registryUrl !== undefined) {
            args.splice(1, 0, '--registry', registryUrl);
        }
        try {
            yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
        }
        finally {
            return npmIsLoggedIn(registryUrl);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXB1Ymxpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25wbS1wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUV4Rjs7O0dBR0c7QUFDSCxNQUFNLFVBQWdCLGFBQWEsQ0FDL0IsV0FBbUIsRUFBRSxPQUFlLEVBQUUsV0FBNkI7O1FBQ3JFLE1BQU0sSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLDBFQUEwRTtRQUMxRSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDdEM7UUFDRCxNQUFNLG9CQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQzlFLENBQUM7Q0FBQTtBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBZ0IsbUJBQW1CLENBQ3JDLFdBQW1CLEVBQUUsT0FBZSxFQUFFLE9BQXNCLEVBQUUsV0FBNkI7O1FBQzdGLE1BQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxHQUFHLFdBQVcsSUFBSSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSwwRUFBMEU7UUFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsTUFBTSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztDQUFBO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFnQixhQUFhLENBQUMsV0FBNkI7O1FBQy9ELE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEIsMEVBQTBFO1FBQzFFLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtZQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUN0QztRQUNELElBQUk7WUFDRixNQUFNLG9CQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztTQUMzRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUFBO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFnQixRQUFRLENBQUMsV0FBNkI7O1FBQzFELE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3ZDLGdHQUFnRztRQUNoRyx5RkFBeUY7UUFDekYsOENBQThDO1FBQzlDLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQzlDO1FBQ0Qsd0ZBQXdGO1FBQ3hGLDRFQUE0RTtRQUM1RSxNQUFNLHVCQUF1QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQUE7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQWdCLFNBQVMsQ0FBQyxXQUE2Qjs7UUFDM0QsTUFBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QixnR0FBZ0c7UUFDaEcseUZBQXlGO1FBQ3pGLCtDQUErQztRQUMvQyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUM5QztRQUNELElBQUk7WUFDRixNQUFNLG9CQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztTQUMzRDtnQkFBUztZQUNSLE9BQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ25DO0lBQ0gsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtzcGF3bkludGVyYWN0aXZlQ29tbWFuZCwgc3Bhd25XaXRoRGVidWdPdXRwdXR9IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuXG4vKipcbiAqIFJ1bnMgTlBNIHB1Ymxpc2ggd2l0aGluIGEgc3BlY2lmaWVkIHBhY2thZ2UgZGlyZWN0b3J5LlxuICogQHRocm93cyBXaXRoIHRoZSBwcm9jZXNzIGxvZyBvdXRwdXQgaWYgdGhlIHB1Ymxpc2ggZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuTnBtUHVibGlzaChcbiAgICBwYWNrYWdlUGF0aDogc3RyaW5nLCBkaXN0VGFnOiBzdHJpbmcsIHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ3B1Ymxpc2gnLCAnLS1hY2Nlc3MnLCAncHVibGljJywgJy0tdGFnJywgZGlzdFRhZ107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5wdXNoKCctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7Y3dkOiBwYWNrYWdlUGF0aCwgbW9kZTogJ3NpbGVudCd9KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBOUE0gdGFnIHRvIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBmb3IgdGhlIGdpdmVuIHBhY2thZ2UuXG4gKiBAdGhyb3dzIFdpdGggdGhlIHByb2Nlc3MgbG9nIG91dHB1dCBpZiB0aGUgdGFnZ2luZyBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXROcG1UYWdGb3JQYWNrYWdlKFxuICAgIHBhY2thZ2VOYW1lOiBzdHJpbmcsIGRpc3RUYWc6IHN0cmluZywgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcmVnaXN0cnlVcmw6IHN0cmluZ3x1bmRlZmluZWQpIHtcbiAgY29uc3QgYXJncyA9IFsnZGlzdC10YWcnLCAnYWRkJywgYCR7cGFja2FnZU5hbWV9QCR7dmVyc2lvbn1gLCBkaXN0VGFnXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnB1c2goJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgYXdhaXQgc3Bhd25XaXRoRGVidWdPdXRwdXQoJ25wbScsIGFyZ3MsIHttb2RlOiAnc2lsZW50J30pO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb2dnZWQgaW50byBOUE0uXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb2dnZWQgaW50byBOUE0uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Jc0xvZ2dlZEluKHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGFyZ3MgPSBbJ3dob2FtaSddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3MucHVzaCgnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7bW9kZTogJ3NpbGVudCd9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBMb2cgaW50byBOUE0gYXQgYSBwcm92aWRlZCByZWdpc3RyeS5cbiAqIEB0aHJvd3MgV2l0aCB0aGUgYG5wbSBsb2dpbmAgc3RhdHVzIGNvZGUgaWYgdGhlIGxvZ2luIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUxvZ2luKHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2xvZ2luJywgJy0tbm8tYnJvd3NlciddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLiBUaGUgYC0tcmVnaXN0cnlgIGZsYWdcbiAgLy8gbXVzdCBiZSBzcGxpY2VkIGludG8gdGhlIGNvcnJlY3QgcGxhY2UgaW4gdGhlIGNvbW1hbmQgYXMgbnBtIGV4cGVjdHMgaXQgdG8gYmUgdGhlIGZsYWdcbiAgLy8gaW1tZWRpYXRlbHkgZm9sbG93aW5nIHRoZSBsb2dpbiBzdWJjb21tYW5kLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3Muc3BsaWNlKDEsIDAsICctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIC8vIFRoZSBsb2dpbiBjb21tYW5kIHByb21wdHMgZm9yIHVzZXJuYW1lLCBwYXNzd29yZCBhbmQgb3RoZXIgcHJvZmlsZSBpbmZvcm1hdGlvbi4gSGVuY2VcbiAgLy8gdGhlIHByb2Nlc3MgbmVlZHMgdG8gYmUgaW50ZXJhY3RpdmUgKGkuZS4gcmVzcGVjdGluZyBjdXJyZW50IFRUWXMgc3RkaW4pLlxuICBhd2FpdCBzcGF3bkludGVyYWN0aXZlQ29tbWFuZCgnbnBtJywgYXJncyk7XG59XG5cbi8qKlxuICogTG9nIG91dCBvZiBOUE0gYXQgYSBwcm92aWRlZCByZWdpc3RyeS5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHVzZXIgd2FzIGxvZ2dlZCBvdXQgb2YgTlBNLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbnBtTG9nb3V0KHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2xvZ291dCddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLiBUaGUgYC0tcmVnaXN0cnlgIGZsYWdcbiAgLy8gbXVzdCBiZSBzcGxpY2VkIGludG8gdGhlIGNvcnJlY3QgcGxhY2UgaW4gdGhlIGNvbW1hbmQgYXMgbnBtIGV4cGVjdHMgaXQgdG8gYmUgdGhlIGZsYWdcbiAgLy8gaW1tZWRpYXRlbHkgZm9sbG93aW5nIHRoZSBsb2dvdXQgc3ViY29tbWFuZC5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCAnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7bW9kZTogJ3NpbGVudCd9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICByZXR1cm4gbnBtSXNMb2dnZWRJbihyZWdpc3RyeVVybCk7XG4gIH1cbn1cbiJdfQ==