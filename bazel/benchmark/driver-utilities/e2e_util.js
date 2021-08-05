/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("dev-infra/bazel/benchmark/driver-utilities/e2e_util", ["require", "exports", "protractor", "selenium-webdriver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifyNoBrowserErrors = exports.openBrowser = void 0;
    /* tslint:disable:no-console  */
    const protractor_1 = require("protractor");
    const webdriver = require("selenium-webdriver");
    function openBrowser(config) {
        if (config.ignoreBrowserSynchronization) {
            protractor_1.browser.ignoreSynchronization = true;
        }
        const urlParams = [];
        if (config.params) {
            config.params.forEach((param) => urlParams.push(param.name + '=' + param.value));
        }
        const url = encodeURI(config.url + '?' + urlParams.join('&'));
        protractor_1.browser.get(url);
        if (config.ignoreBrowserSynchronization) {
            protractor_1.browser.sleep(2000);
        }
    }
    exports.openBrowser = openBrowser;
    /**
     * @experimental This API will be moved to Protractor.
     */
    function verifyNoBrowserErrors() {
        // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
        // so that the browser logs can be read out!
        protractor_1.browser.executeScript('1+1');
        protractor_1.browser
            .manage()
            .logs()
            .get('browser')
            .then(function (browserLog) {
            const filteredLog = browserLog.filter(function (logEntry) {
                if (logEntry.level.value >= webdriver.logging.Level.INFO.value) {
                    console.log('>> ' + logEntry.message);
                }
                return logEntry.level.value > webdriver.logging.Level.WARNING.value;
            });
            expect(filteredLog).toEqual([]);
        });
    }
    exports.verifyNoBrowserErrors = verifyNoBrowserErrors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZTJlX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9iYXplbC9iZW5jaG1hcmsvZHJpdmVyLXV0aWxpdGllcy9lMmVfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxnQ0FBZ0M7SUFDaEMsMkNBQW1DO0lBQ25DLGdEQUFnRDtJQUloRCxTQUFnQixXQUFXLENBQUMsTUFJM0I7UUFDQyxJQUFJLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRTtZQUN2QyxvQkFBTyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztTQUN0QztRQUNELE1BQU0sU0FBUyxHQUFhLEVBQUUsQ0FBQztRQUMvQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDbEY7UUFDRCxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlELG9CQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksTUFBTSxDQUFDLDRCQUE0QixFQUFFO1lBQ3ZDLG9CQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztJQWpCRCxrQ0FpQkM7SUFFRDs7T0FFRztJQUNILFNBQWdCLHFCQUFxQjtRQUNuQywwRUFBMEU7UUFDMUUsNENBQTRDO1FBQzVDLG9CQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLG9CQUFPO2FBQ0osTUFBTSxFQUFFO2FBQ1IsSUFBSSxFQUFFO2FBQ04sR0FBRyxDQUFDLFNBQVMsQ0FBQzthQUNkLElBQUksQ0FBQyxVQUFVLFVBQWU7WUFDN0IsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLFFBQWE7Z0JBQzNELElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN2QztnQkFDRCxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDdEUsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQWpCRCxzREFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAgKi9cbmltcG9ydCB7YnJvd3Nlcn0gZnJvbSAncHJvdHJhY3Rvcic7XG5pbXBvcnQgKiBhcyB3ZWJkcml2ZXIgZnJvbSAnc2VsZW5pdW0td2ViZHJpdmVyJztcblxuZGVjbGFyZSB2YXIgZXhwZWN0OiBhbnk7XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuQnJvd3Nlcihjb25maWc6IHtcbiAgdXJsPzogc3RyaW5nO1xuICBwYXJhbXM/OiB7bmFtZTogc3RyaW5nOyB2YWx1ZTogYW55fVtdO1xuICBpZ25vcmVCcm93c2VyU3luY2hyb25pemF0aW9uPzogYm9vbGVhbjtcbn0pIHtcbiAgaWYgKGNvbmZpZy5pZ25vcmVCcm93c2VyU3luY2hyb25pemF0aW9uKSB7XG4gICAgYnJvd3Nlci5pZ25vcmVTeW5jaHJvbml6YXRpb24gPSB0cnVlO1xuICB9XG4gIGNvbnN0IHVybFBhcmFtczogc3RyaW5nW10gPSBbXTtcbiAgaWYgKGNvbmZpZy5wYXJhbXMpIHtcbiAgICBjb25maWcucGFyYW1zLmZvckVhY2goKHBhcmFtKSA9PiB1cmxQYXJhbXMucHVzaChwYXJhbS5uYW1lICsgJz0nICsgcGFyYW0udmFsdWUpKTtcbiAgfVxuICBjb25zdCB1cmwgPSBlbmNvZGVVUkkoY29uZmlnLnVybCArICc/JyArIHVybFBhcmFtcy5qb2luKCcmJykpO1xuICBicm93c2VyLmdldCh1cmwpO1xuICBpZiAoY29uZmlnLmlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24pIHtcbiAgICBicm93c2VyLnNsZWVwKDIwMDApO1xuICB9XG59XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBUaGlzIEFQSSB3aWxsIGJlIG1vdmVkIHRvIFByb3RyYWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlOb0Jyb3dzZXJFcnJvcnMoKSB7XG4gIC8vIFRPRE8odGJvc2NoKTogQnVnIGluIENocm9tZURyaXZlcjogTmVlZCB0byBleGVjdXRlIGF0IGxlYXN0IG9uZSBjb21tYW5kXG4gIC8vIHNvIHRoYXQgdGhlIGJyb3dzZXIgbG9ncyBjYW4gYmUgcmVhZCBvdXQhXG4gIGJyb3dzZXIuZXhlY3V0ZVNjcmlwdCgnMSsxJyk7XG4gIGJyb3dzZXJcbiAgICAubWFuYWdlKClcbiAgICAubG9ncygpXG4gICAgLmdldCgnYnJvd3NlcicpXG4gICAgLnRoZW4oZnVuY3Rpb24gKGJyb3dzZXJMb2c6IGFueSkge1xuICAgICAgY29uc3QgZmlsdGVyZWRMb2cgPSBicm93c2VyTG9nLmZpbHRlcihmdW5jdGlvbiAobG9nRW50cnk6IGFueSkge1xuICAgICAgICBpZiAobG9nRW50cnkubGV2ZWwudmFsdWUgPj0gd2ViZHJpdmVyLmxvZ2dpbmcuTGV2ZWwuSU5GTy52YWx1ZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCc+PiAnICsgbG9nRW50cnkubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvZ0VudHJ5LmxldmVsLnZhbHVlID4gd2ViZHJpdmVyLmxvZ2dpbmcuTGV2ZWwuV0FSTklORy52YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgZXhwZWN0KGZpbHRlcmVkTG9nKS50b0VxdWFsKFtdKTtcbiAgICB9KTtcbn1cbiJdfQ==