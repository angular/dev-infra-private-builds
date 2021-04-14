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
        define("@angular/dev-infra-private/release/stamping/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/release/stamping/env-stamp"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BuildEnvStampCommand = void 0;
    var tslib_1 = require("tslib");
    var env_stamp_1 = require("@angular/dev-infra-private/release/stamping/env-stamp");
    function builder(args) {
        return args.option('mode', {
            demandOption: true,
            description: 'Whether the env-stamp should be built for a snapshot or release',
            choices: ['snapshot', 'release']
        });
    }
    function handler(_a) {
        var mode = _a.mode;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                env_stamp_1.buildEnvStamp(mode);
                return [2 /*return*/];
            });
        });
    }
    /** CLI command module for building the environment stamp. */
    exports.BuildEnvStampCommand = {
        builder: builder,
        handler: handler,
        command: 'build-env-stamp',
        describe: 'Build the environment stamping information',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc3RhbXBpbmcvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCxtRkFBd0Q7SUFPeEQsU0FBUyxPQUFPLENBQUMsSUFBVTtRQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ3pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFdBQVcsRUFBRSxpRUFBaUU7WUFDOUUsT0FBTyxFQUFFLENBQUMsVUFBbUIsRUFBRSxTQUFrQixDQUFDO1NBQ25ELENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxTQUFlLE9BQU8sQ0FBQyxFQUEwQjtZQUF6QixJQUFJLFVBQUE7OztnQkFDMUIseUJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7OztLQUNyQjtJQUVELDZEQUE2RDtJQUNoRCxRQUFBLG9CQUFvQixHQUErQjtRQUM5RCxPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsaUJBQWlCO1FBQzFCLFFBQVEsRUFBRSw0Q0FBNEM7S0FDdkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkRW52U3RhbXAsIEVudlN0YW1wTW9kZX0gZnJvbSAnLi9lbnYtc3RhbXAnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XG4gIG1vZGU6IEVudlN0YW1wTW9kZTtcbn1cblxuZnVuY3Rpb24gYnVpbGRlcihhcmdzOiBBcmd2KTogQXJndjxPcHRpb25zPiB7XG4gIHJldHVybiBhcmdzLm9wdGlvbignbW9kZScsIHtcbiAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRoZSBlbnYtc3RhbXAgc2hvdWxkIGJlIGJ1aWx0IGZvciBhIHNuYXBzaG90IG9yIHJlbGVhc2UnLFxuICAgIGNob2ljZXM6IFsnc25hcHNob3QnIGFzIGNvbnN0LCAncmVsZWFzZScgYXMgY29uc3RdXG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHttb2RlfTogQXJndW1lbnRzPE9wdGlvbnM+KSB7XG4gIGJ1aWxkRW52U3RhbXAobW9kZSk7XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGJ1aWxkaW5nIHRoZSBlbnZpcm9ubWVudCBzdGFtcC4gKi9cbmV4cG9ydCBjb25zdCBCdWlsZEVudlN0YW1wQ29tbWFuZDogQ29tbWFuZE1vZHVsZTx7fSwgT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdidWlsZC1lbnYtc3RhbXAnLFxuICBkZXNjcmliZTogJ0J1aWxkIHRoZSBlbnZpcm9ubWVudCBzdGFtcGluZyBpbmZvcm1hdGlvbicsXG59O1xuIl19