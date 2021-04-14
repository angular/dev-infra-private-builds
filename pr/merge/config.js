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
        define("@angular/dev-infra-private/pr/merge/config", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadAndValidateConfig = void 0;
    var tslib_1 = require("tslib");
    /** Loads and validates the merge configuration. */
    function loadAndValidateConfig(config, api) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var mergeConfig, errors;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config.merge === undefined) {
                            return [2 /*return*/, { errors: ['No merge configuration found. Set the `merge` configuration.'] }];
                        }
                        if (typeof config.merge !== 'function') {
                            return [2 /*return*/, { errors: ['Expected merge configuration to be defined lazily through a function.'] }];
                        }
                        return [4 /*yield*/, config.merge(api)];
                    case 1:
                        mergeConfig = _a.sent();
                        errors = validateMergeConfig(mergeConfig);
                        if (errors.length) {
                            return [2 /*return*/, { errors: errors }];
                        }
                        return [2 /*return*/, { config: mergeConfig }];
                }
            });
        });
    }
    exports.loadAndValidateConfig = loadAndValidateConfig;
    /** Validates the specified configuration. Returns a list of failure messages. */
    function validateMergeConfig(config) {
        var errors = [];
        if (!config.labels) {
            errors.push('No label configuration.');
        }
        else if (!Array.isArray(config.labels)) {
            errors.push('Label configuration needs to be an array.');
        }
        if (!config.claSignedLabel) {
            errors.push('No CLA signed label configured.');
        }
        if (!config.mergeReadyLabel) {
            errors.push('No merge ready label configured.');
        }
        if (config.githubApiMerge === undefined) {
            errors.push('No explicit choice of merge strategy. Please set `githubApiMerge`.');
        }
        return errors;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBcUZILG1EQUFtRDtJQUNuRCxTQUFzQixxQkFBcUIsQ0FDdkMsTUFBb0MsRUFDcEMsR0FBaUI7Ozs7Ozt3QkFDbkIsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTs0QkFDOUIsc0JBQU8sRUFBQyxNQUFNLEVBQUUsQ0FBQyw4REFBOEQsQ0FBQyxFQUFDLEVBQUM7eUJBQ25GO3dCQUVELElBQUksT0FBTyxNQUFNLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRTs0QkFDdEMsc0JBQU8sRUFBQyxNQUFNLEVBQUUsQ0FBQyx1RUFBdUUsQ0FBQyxFQUFDLEVBQUM7eUJBQzVGO3dCQUVtQixxQkFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFBOzt3QkFBckMsV0FBVyxHQUFHLFNBQXVCO3dCQUNyQyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBRWhELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTs0QkFDakIsc0JBQU8sRUFBQyxNQUFNLFFBQUEsRUFBQyxFQUFDO3lCQUNqQjt3QkFFRCxzQkFBTyxFQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUMsRUFBQzs7OztLQUM5QjtJQW5CRCxzREFtQkM7SUFFRCxpRkFBaUY7SUFDakYsU0FBUyxtQkFBbUIsQ0FBQyxNQUE0QjtRQUN2RCxJQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1NBQ3hDO2FBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQztTQUMxRDtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQztTQUNoRDtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNqRDtRQUNELElBQUksTUFBTSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxvRUFBb0UsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0dpdENsaWVudENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge0dpdGh1YkNsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yic7XG5cbmltcG9ydCB7R2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZ30gZnJvbSAnLi9zdHJhdGVnaWVzL2FwaS1tZXJnZSc7XG5cbi8qKiBEZXNjcmliZXMgcG9zc2libGUgdmFsdWVzIHRoYXQgY2FuIGJlIHJldHVybmVkIGZvciBgYnJhbmNoZXNgIG9mIGEgdGFyZ2V0IGxhYmVsLiAqL1xuZXhwb3J0IHR5cGUgVGFyZ2V0TGFiZWxCcmFuY2hSZXN1bHQgPSBzdHJpbmdbXXxQcm9taXNlPHN0cmluZ1tdPjtcblxuLyoqXG4gKiBQb3NzaWJsZSBtZXJnZSBtZXRob2RzIHN1cHBvcnRlZCBieSB0aGUgR2l0aHViIEFQSS5cbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcHVsbHMvI21lcmdlLWEtcHVsbC1yZXF1ZXN0LW1lcmdlLWJ1dHRvbi5cbiAqL1xuZXhwb3J0IHR5cGUgR2l0aHViQXBpTWVyZ2VNZXRob2QgPSAnbWVyZ2UnfCdzcXVhc2gnfCdyZWJhc2UnO1xuXG4vKipcbiAqIFRhcmdldCBsYWJlbHMgcmVwcmVzZW50IEdpdGh1YiBwdWxsIHJlcXVlc3RzIGxhYmVscy4gVGhlc2UgbGFiZWxzIGluc3RydWN0IHRoZSBtZXJnZVxuICogc2NyaXB0IGludG8gd2hpY2ggYnJhbmNoZXMgYSBnaXZlbiBwdWxsIHJlcXVlc3Qgc2hvdWxkIGJlIG1lcmdlZCB0by5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXJnZXRMYWJlbCB7XG4gIC8qKiBQYXR0ZXJuIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gdGFyZ2V0IGxhYmVsLiAqL1xuICBwYXR0ZXJuOiBSZWdFeHB8c3RyaW5nO1xuICAvKipcbiAgICogTGlzdCBvZiBicmFuY2hlcyBhIHB1bGwgcmVxdWVzdCB3aXRoIHRoaXMgdGFyZ2V0IGxhYmVsIHNob3VsZCBiZSBtZXJnZWQgaW50by5cbiAgICogQ2FuIGFsc28gYmUgd3JhcHBlZCBpbiBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyB0aGUgdGFyZ2V0IGJyYW5jaCBzcGVjaWZpZWQgaW4gdGhlXG4gICAqIEdpdGh1YiBXZWIgVUkuIFRoaXMgaXMgdXNlZnVsIGZvciBzdXBwb3J0aW5nIGxhYmVscyBsaWtlIGB0YXJnZXQ6IGRldmVsb3BtZW50LWJyYW5jaGAuXG4gICAqXG4gICAqIEB0aHJvd3Mge0ludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBJbnZhbGlkIGxhYmVsIGhhcyBiZWVuIGFwcGxpZWQgdG8gcHVsbCByZXF1ZXN0LlxuICAgKiBAdGhyb3dzIHtJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3J9IEludmFsaWQgR2l0aHViIHRhcmdldCBicmFuY2ggaGFzIGJlZW4gc2VsZWN0ZWQuXG4gICAqL1xuICBicmFuY2hlczogVGFyZ2V0TGFiZWxCcmFuY2hSZXN1bHR8KChnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZykgPT4gVGFyZ2V0TGFiZWxCcmFuY2hSZXN1bHQpO1xufVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBtZXJnZSBzY3JpcHQgd2l0aCBhbGwgcmVtb3RlIG9wdGlvbnMgc3BlY2lmaWVkLiBUaGVcbiAqIGRlZmF1bHQgYE1lcmdlQ29uZmlnYCBoYXMgZG9lcyBub3QgcmVxdWlyZSBhbnkgb2YgdGhlc2Ugb3B0aW9ucyBhcyBkZWZhdWx0c1xuICogYXJlIHByb3ZpZGVkIGJ5IHRoZSBjb21tb24gZGV2LWluZnJhIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgdHlwZSBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUgPSBNZXJnZUNvbmZpZyZ7cmVtb3RlOiBHaXRDbGllbnRDb25maWd9O1xuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgdGhlIG1lcmdlIHNjcmlwdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VDb25maWcge1xuICAvKipcbiAgICogQ29uZmlndXJhdGlvbiBmb3IgdGhlIHVwc3RyZWFtIHJlbW90ZS4gQWxsIG9mIHRoZXNlIG9wdGlvbnMgYXJlIG9wdGlvbmFsIGFzXG4gICAqIGRlZmF1bHRzIGFyZSBwcm92aWRlZCBieSB0aGUgY29tbW9uIGRldi1pbmZyYSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgICovXG4gIHJlbW90ZT86IEdpdENsaWVudENvbmZpZztcbiAgLyoqIExpc3Qgb2YgdGFyZ2V0IGxhYmVscy4gKi9cbiAgbGFiZWxzOiBUYXJnZXRMYWJlbFtdO1xuICAvKiogUmVxdWlyZWQgYmFzZSBjb21taXRzIGZvciBnaXZlbiBicmFuY2hlcy4gKi9cbiAgcmVxdWlyZWRCYXNlQ29tbWl0cz86IHtbYnJhbmNoTmFtZTogc3RyaW5nXTogc3RyaW5nfTtcbiAgLyoqIFBhdHRlcm4gdGhhdCBtYXRjaGVzIGxhYmVscyB3aGljaCBpbXBseSBhIHNpZ25lZCBDTEEuICovXG4gIGNsYVNpZ25lZExhYmVsOiBzdHJpbmd8UmVnRXhwO1xuICAvKiogUGF0dGVybiB0aGF0IG1hdGNoZXMgbGFiZWxzIHdoaWNoIGltcGx5IGEgbWVyZ2UgcmVhZHkgcHVsbCByZXF1ZXN0LiAqL1xuICBtZXJnZVJlYWR5TGFiZWw6IHN0cmluZ3xSZWdFeHA7XG4gIC8qKiBMYWJlbCB0aGF0IGlzIGFwcGxpZWQgd2hlbiBzcGVjaWFsIGF0dGVudGlvbiBmcm9tIHRoZSBjYXJldGFrZXIgaXMgcmVxdWlyZWQuICovXG4gIGNhcmV0YWtlck5vdGVMYWJlbD86IHN0cmluZ3xSZWdFeHA7XG4gIC8qKiBMYWJlbCB3aGljaCBjYW4gYmUgYXBwbGllZCB0byBmaXh1cCBjb21taXQgbWVzc2FnZXMgaW4gdGhlIG1lcmdlIHNjcmlwdC4gKi9cbiAgY29tbWl0TWVzc2FnZUZpeHVwTGFiZWw6IHN0cmluZ3xSZWdFeHA7XG4gIC8qKiBMYWJlbCB0aGF0IGlzIGFwcGxpZWQgd2hlbiBhIGJyZWFraW5nIGNoYW5nZSBpcyBtYWRlIGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGJyZWFraW5nQ2hhbmdlTGFiZWw/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHB1bGwgcmVxdWVzdHMgc2hvdWxkIGJlIG1lcmdlZCB1c2luZyB0aGUgR2l0aHViIEFQSS4gVGhpcyBjYW4gYmUgZW5hYmxlZFxuICAgKiBpZiBwcm9qZWN0cyB3YW50IHRvIGhhdmUgdGhlaXIgcHVsbCByZXF1ZXN0cyBzaG93IHVwIGFzIGBNZXJnZWRgIGluIHRoZSBHaXRodWIgVUkuXG4gICAqIFRoZSBkb3duc2lkZSBpcyB0aGF0IGZpeHVwIG9yIHNxdWFzaCBjb21taXRzIG5vIGxvbmdlciB3b3JrIGFzIHRoZSBHaXRodWIgQVBJIGRvZXNcbiAgICogbm90IHN1cHBvcnQgdGhpcy5cbiAgICovXG4gIGdpdGh1YkFwaU1lcmdlOiBmYWxzZXxHaXRodWJBcGlNZXJnZVN0cmF0ZWd5Q29uZmlnO1xuICAvKipcbiAgICogTGlzdCBvZiBjb21taXQgc2NvcGVzIHdoaWNoIGFyZSBleGVtcHRlZCBmcm9tIHRhcmdldCBsYWJlbCBjb250ZW50IHJlcXVpcmVtZW50cy4gaS5lLiBubyBgZmVhdGBcbiAgICogc2NvcGVzIGluIHBhdGNoIGJyYW5jaGVzLCBubyBicmVha2luZyBjaGFuZ2VzIGluIG1pbm9yIG9yIHBhdGNoIGNoYW5nZXMuXG4gICAqL1xuICB0YXJnZXRMYWJlbEV4ZW1wdFNjb3Blcz86IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb2YgdGhlIG1lcmdlIHNjcmlwdCBpbiB0aGUgZGV2LWluZnJhIGNvbmZpZ3VyYXRpb24uIE5vdGUgdGhhdCB0aGVcbiAqIG1lcmdlIGNvbmZpZ3VyYXRpb24gaXMgcmV0cmlldmVkIGxhemlseSBhcyB1c3VhbGx5IHRoZXNlIGNvbmZpZ3VyYXRpb25zIHJlbHlcbiAqIG9uIGJyYW5jaCBuYW1lIGNvbXB1dGF0aW9ucy4gV2UgZG9uJ3Qgd2FudCB0byBydW4gdGhlc2UgaW1tZWRpYXRlbHkgd2hlbmV2ZXJcbiAqIHRoZSBkZXYtaW5mcmEgY29uZmlndXJhdGlvbiBpcyBsb2FkZWQgYXMgdGhhdCBjb3VsZCBzbG93LWRvd24gb3RoZXIgY29tbWFuZHMuXG4gKi9cbmV4cG9ydCB0eXBlIERldkluZnJhTWVyZ2VDb25maWcgPVxuICAgIE5nRGV2Q29uZmlnPHsnbWVyZ2UnOiAoYXBpOiBHaXRodWJDbGllbnQpID0+IE1lcmdlQ29uZmlnIHwgUHJvbWlzZTxNZXJnZUNvbmZpZz59PjtcblxuLyoqIExvYWRzIGFuZCB2YWxpZGF0ZXMgdGhlIG1lcmdlIGNvbmZpZ3VyYXRpb24uICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEFuZFZhbGlkYXRlQ29uZmlnKFxuICAgIGNvbmZpZzogUGFydGlhbDxEZXZJbmZyYU1lcmdlQ29uZmlnPixcbiAgICBhcGk6IEdpdGh1YkNsaWVudCk6IFByb21pc2U8e2NvbmZpZz86IE1lcmdlQ29uZmlnLCBlcnJvcnM/OiBzdHJpbmdbXX0+IHtcbiAgaWYgKGNvbmZpZy5tZXJnZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHtlcnJvcnM6IFsnTm8gbWVyZ2UgY29uZmlndXJhdGlvbiBmb3VuZC4gU2V0IHRoZSBgbWVyZ2VgIGNvbmZpZ3VyYXRpb24uJ119O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBjb25maWcubWVyZ2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4ge2Vycm9yczogWydFeHBlY3RlZCBtZXJnZSBjb25maWd1cmF0aW9uIHRvIGJlIGRlZmluZWQgbGF6aWx5IHRocm91Z2ggYSBmdW5jdGlvbi4nXX07XG4gIH1cblxuICBjb25zdCBtZXJnZUNvbmZpZyA9IGF3YWl0IGNvbmZpZy5tZXJnZShhcGkpO1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0ZU1lcmdlQ29uZmlnKG1lcmdlQ29uZmlnKTtcblxuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHJldHVybiB7ZXJyb3JzfTtcbiAgfVxuXG4gIHJldHVybiB7Y29uZmlnOiBtZXJnZUNvbmZpZ307XG59XG5cbi8qKiBWYWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uLiBSZXR1cm5zIGEgbGlzdCBvZiBmYWlsdXJlIG1lc3NhZ2VzLiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVNZXJnZUNvbmZpZyhjb25maWc6IFBhcnRpYWw8TWVyZ2VDb25maWc+KTogc3RyaW5nW10ge1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIGlmICghY29uZmlnLmxhYmVscykge1xuICAgIGVycm9ycy5wdXNoKCdObyBsYWJlbCBjb25maWd1cmF0aW9uLicpO1xuICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KGNvbmZpZy5sYWJlbHMpKSB7XG4gICAgZXJyb3JzLnB1c2goJ0xhYmVsIGNvbmZpZ3VyYXRpb24gbmVlZHMgdG8gYmUgYW4gYXJyYXkuJyk7XG4gIH1cbiAgaWYgKCFjb25maWcuY2xhU2lnbmVkTGFiZWwpIHtcbiAgICBlcnJvcnMucHVzaCgnTm8gQ0xBIHNpZ25lZCBsYWJlbCBjb25maWd1cmVkLicpO1xuICB9XG4gIGlmICghY29uZmlnLm1lcmdlUmVhZHlMYWJlbCkge1xuICAgIGVycm9ycy5wdXNoKCdObyBtZXJnZSByZWFkeSBsYWJlbCBjb25maWd1cmVkLicpO1xuICB9XG4gIGlmIChjb25maWcuZ2l0aHViQXBpTWVyZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKCdObyBleHBsaWNpdCBjaG9pY2Ugb2YgbWVyZ2Ugc3RyYXRlZ3kuIFBsZWFzZSBzZXQgYGdpdGh1YkFwaU1lcmdlYC4nKTtcbiAgfVxuICByZXR1cm4gZXJyb3JzO1xufVxuIl19