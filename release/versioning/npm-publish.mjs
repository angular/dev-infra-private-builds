/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { spawn, spawnInteractive } from '../../utils/child-process';
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
        yield spawn('npm', args, { cwd: packagePath, mode: 'silent' });
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
        yield spawn('npm', args, { mode: 'silent' });
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
            yield spawn('npm', args, { mode: 'silent' });
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
        yield spawnInteractive('npm', args);
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
            yield spawn('npm', args, { mode: 'silent' });
        }
        finally {
            return npmIsLoggedIn(registryUrl);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXB1Ymxpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25wbS1wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSCxPQUFPLEVBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFJbEU7OztHQUdHO0FBQ0gsTUFBTSxVQUFnQixhQUFhLENBQy9CLFdBQW1CLEVBQUUsT0FBbUIsRUFBRSxXQUE2Qjs7UUFDekUsTUFBTSxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakUsMEVBQTBFO1FBQzFFLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtZQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUN0QztRQUNELE1BQU0sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7Q0FBQTtBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBZ0IsbUJBQW1CLENBQ3JDLFdBQW1CLEVBQUUsT0FBZSxFQUFFLE9BQXNCLEVBQUUsV0FBNkI7O1FBQzdGLE1BQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxHQUFHLFdBQVcsSUFBSSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSwwRUFBMEU7UUFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsTUFBTSxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FBQTtBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBZ0IsYUFBYSxDQUFDLFdBQTZCOztRQUMvRCxNQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hCLDBFQUEwRTtRQUMxRSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDdEM7UUFDRCxJQUFJO1lBQ0YsTUFBTSxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1NBQzVDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQUE7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQWdCLFFBQVEsQ0FBQyxXQUE2Qjs7UUFDMUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDdkMsZ0dBQWdHO1FBQ2hHLHlGQUF5RjtRQUN6Riw4Q0FBOEM7UUFDOUMsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDOUM7UUFDRCx3RkFBd0Y7UUFDeEYsNEVBQTRFO1FBQzVFLE1BQU0sZ0JBQWdCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FBQTtBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBZ0IsU0FBUyxDQUFDLFdBQTZCOztRQUMzRCxNQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hCLGdHQUFnRztRQUNoRyx5RkFBeUY7UUFDekYsK0NBQStDO1FBQy9DLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsSUFBSTtZQUNGLE1BQU0sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztTQUM1QztnQkFBUztZQUNSLE9BQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ25DO0lBQ0gsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NwYXduLCBzcGF3bkludGVyYWN0aXZlfSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcblxuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuL25wbS1yZWdpc3RyeSc7XG5cbi8qKlxuICogUnVucyBOUE0gcHVibGlzaCB3aXRoaW4gYSBzcGVjaWZpZWQgcGFja2FnZSBkaXJlY3RvcnkuXG4gKiBAdGhyb3dzIFdpdGggdGhlIHByb2Nlc3MgbG9nIG91dHB1dCBpZiB0aGUgcHVibGlzaCBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5OcG1QdWJsaXNoKFxuICAgIHBhY2thZ2VQYXRoOiBzdHJpbmcsIGRpc3RUYWc6IE5wbURpc3RUYWcsIHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ3B1Ymxpc2gnLCAnLS1hY2Nlc3MnLCAncHVibGljJywgJy0tdGFnJywgZGlzdFRhZ107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5wdXNoKCctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIGF3YWl0IHNwYXduKCducG0nLCBhcmdzLCB7Y3dkOiBwYWNrYWdlUGF0aCwgbW9kZTogJ3NpbGVudCd9KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBOUE0gdGFnIHRvIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBmb3IgdGhlIGdpdmVuIHBhY2thZ2UuXG4gKiBAdGhyb3dzIFdpdGggdGhlIHByb2Nlc3MgbG9nIG91dHB1dCBpZiB0aGUgdGFnZ2luZyBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXROcG1UYWdGb3JQYWNrYWdlKFxuICAgIHBhY2thZ2VOYW1lOiBzdHJpbmcsIGRpc3RUYWc6IHN0cmluZywgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcmVnaXN0cnlVcmw6IHN0cmluZ3x1bmRlZmluZWQpIHtcbiAgY29uc3QgYXJncyA9IFsnZGlzdC10YWcnLCAnYWRkJywgYCR7cGFja2FnZU5hbWV9QCR7dmVyc2lvbn1gLCBkaXN0VGFnXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnB1c2goJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgYXdhaXQgc3Bhd24oJ25wbScsIGFyZ3MsIHttb2RlOiAnc2lsZW50J30pO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb2dnZWQgaW50byBOUE0uXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb2dnZWQgaW50byBOUE0uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Jc0xvZ2dlZEluKHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGFyZ3MgPSBbJ3dob2FtaSddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3MucHVzaCgnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IHNwYXduKCducG0nLCBhcmdzLCB7bW9kZTogJ3NpbGVudCd9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBMb2cgaW50byBOUE0gYXQgYSBwcm92aWRlZCByZWdpc3RyeS5cbiAqIEB0aHJvd3MgV2l0aCB0aGUgYG5wbSBsb2dpbmAgc3RhdHVzIGNvZGUgaWYgdGhlIGxvZ2luIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUxvZ2luKHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2xvZ2luJywgJy0tbm8tYnJvd3NlciddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLiBUaGUgYC0tcmVnaXN0cnlgIGZsYWdcbiAgLy8gbXVzdCBiZSBzcGxpY2VkIGludG8gdGhlIGNvcnJlY3QgcGxhY2UgaW4gdGhlIGNvbW1hbmQgYXMgbnBtIGV4cGVjdHMgaXQgdG8gYmUgdGhlIGZsYWdcbiAgLy8gaW1tZWRpYXRlbHkgZm9sbG93aW5nIHRoZSBsb2dpbiBzdWJjb21tYW5kLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3Muc3BsaWNlKDEsIDAsICctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIC8vIFRoZSBsb2dpbiBjb21tYW5kIHByb21wdHMgZm9yIHVzZXJuYW1lLCBwYXNzd29yZCBhbmQgb3RoZXIgcHJvZmlsZSBpbmZvcm1hdGlvbi4gSGVuY2VcbiAgLy8gdGhlIHByb2Nlc3MgbmVlZHMgdG8gYmUgaW50ZXJhY3RpdmUgKGkuZS4gcmVzcGVjdGluZyBjdXJyZW50IFRUWXMgc3RkaW4pLlxuICBhd2FpdCBzcGF3bkludGVyYWN0aXZlKCducG0nLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBMb2cgb3V0IG9mIE5QTSBhdCBhIHByb3ZpZGVkIHJlZ2lzdHJ5LlxuICogQHJldHVybnMgV2hldGhlciB0aGUgdXNlciB3YXMgbG9nZ2VkIG91dCBvZiBOUE0uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Mb2dvdXQocmVnaXN0cnlVcmw6IHN0cmluZ3x1bmRlZmluZWQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgYXJncyA9IFsnbG9nb3V0J107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuIFRoZSBgLS1yZWdpc3RyeWAgZmxhZ1xuICAvLyBtdXN0IGJlIHNwbGljZWQgaW50byB0aGUgY29ycmVjdCBwbGFjZSBpbiB0aGUgY29tbWFuZCBhcyBucG0gZXhwZWN0cyBpdCB0byBiZSB0aGUgZmxhZ1xuICAvLyBpbW1lZGlhdGVseSBmb2xsb3dpbmcgdGhlIGxvZ291dCBzdWJjb21tYW5kLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3Muc3BsaWNlKDEsIDAsICctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIHRyeSB7XG4gICAgYXdhaXQgc3Bhd24oJ25wbScsIGFyZ3MsIHttb2RlOiAnc2lsZW50J30pO1xuICB9IGZpbmFsbHkge1xuICAgIHJldHVybiBucG1Jc0xvZ2dlZEluKHJlZ2lzdHJ5VXJsKTtcbiAgfVxufVxuIl19