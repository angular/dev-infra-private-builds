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
        define("@angular/dev-infra-private/benchmark/driver-utilities/e2e_util", ["require", "exports", "protractor", "selenium-webdriver"], factory);
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
        protractor_1.browser.manage().logs().get('browser').then(function (browserLog) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZTJlX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvYmVuY2htYXJrL2RyaXZlci11dGlsaXRpZXMvZTJlX3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsZ0NBQWdDO0lBQ2hDLDJDQUFtQztJQUNuQyxnREFBZ0Q7SUFJaEQsU0FBZ0IsV0FBVyxDQUFDLE1BSTNCO1FBQ0MsSUFBSSxNQUFNLENBQUMsNEJBQTRCLEVBQUU7WUFDdkMsb0JBQU8sQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7U0FDdEM7UUFDRCxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7UUFDL0IsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ2xGO1FBQ0QsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM5RCxvQkFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRTtZQUN2QyxvQkFBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNyQjtJQUNILENBQUM7SUFqQkQsa0NBaUJDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixxQkFBcUI7UUFDbkMsMEVBQTBFO1FBQzFFLDRDQUE0QztRQUM1QyxvQkFBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixvQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxVQUFlO1lBQ2xFLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBUyxRQUFhO2dCQUMxRCxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDdkM7Z0JBQ0QsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ3RFLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFiRCxzREFhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICAqL1xuaW1wb3J0IHticm93c2VyfSBmcm9tICdwcm90cmFjdG9yJztcbmltcG9ydCAqIGFzIHdlYmRyaXZlciBmcm9tICdzZWxlbml1bS13ZWJkcml2ZXInO1xuXG5kZWNsYXJlIHZhciBleHBlY3Q6IGFueTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5Ccm93c2VyKGNvbmZpZzoge1xuICB1cmw/OiBzdHJpbmcsXG4gIHBhcmFtcz86IHtuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnl9W10sXG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24/OiBib29sZWFuXG59KSB7XG4gIGlmIChjb25maWcuaWdub3JlQnJvd3NlclN5bmNocm9uaXphdGlvbikge1xuICAgIGJyb3dzZXIuaWdub3JlU3luY2hyb25pemF0aW9uID0gdHJ1ZTtcbiAgfVxuICBjb25zdCB1cmxQYXJhbXM6IHN0cmluZ1tdID0gW107XG4gIGlmIChjb25maWcucGFyYW1zKSB7XG4gICAgY29uZmlnLnBhcmFtcy5mb3JFYWNoKChwYXJhbSkgPT4gdXJsUGFyYW1zLnB1c2gocGFyYW0ubmFtZSArICc9JyArIHBhcmFtLnZhbHVlKSk7XG4gIH1cbiAgY29uc3QgdXJsID0gZW5jb2RlVVJJKGNvbmZpZy51cmwgKyAnPycgKyB1cmxQYXJhbXMuam9pbignJicpKTtcbiAgYnJvd3Nlci5nZXQodXJsKTtcbiAgaWYgKGNvbmZpZy5pZ25vcmVCcm93c2VyU3luY2hyb25pemF0aW9uKSB7XG4gICAgYnJvd3Nlci5zbGVlcCgyMDAwKTtcbiAgfVxufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgVGhpcyBBUEkgd2lsbCBiZSBtb3ZlZCB0byBQcm90cmFjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5Tm9Ccm93c2VyRXJyb3JzKCkge1xuICAvLyBUT0RPKHRib3NjaCk6IEJ1ZyBpbiBDaHJvbWVEcml2ZXI6IE5lZWQgdG8gZXhlY3V0ZSBhdCBsZWFzdCBvbmUgY29tbWFuZFxuICAvLyBzbyB0aGF0IHRoZSBicm93c2VyIGxvZ3MgY2FuIGJlIHJlYWQgb3V0IVxuICBicm93c2VyLmV4ZWN1dGVTY3JpcHQoJzErMScpO1xuICBicm93c2VyLm1hbmFnZSgpLmxvZ3MoKS5nZXQoJ2Jyb3dzZXInKS50aGVuKGZ1bmN0aW9uKGJyb3dzZXJMb2c6IGFueSkge1xuICAgIGNvbnN0IGZpbHRlcmVkTG9nID0gYnJvd3NlckxvZy5maWx0ZXIoZnVuY3Rpb24obG9nRW50cnk6IGFueSkge1xuICAgICAgaWYgKGxvZ0VudHJ5LmxldmVsLnZhbHVlID49IHdlYmRyaXZlci5sb2dnaW5nLkxldmVsLklORk8udmFsdWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJz4+ICcgKyBsb2dFbnRyeS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb2dFbnRyeS5sZXZlbC52YWx1ZSA+IHdlYmRyaXZlci5sb2dnaW5nLkxldmVsLldBUk5JTkcudmFsdWU7XG4gICAgfSk7XG4gICAgZXhwZWN0KGZpbHRlcmVkTG9nKS50b0VxdWFsKFtdKTtcbiAgfSk7XG59XG4iXX0=