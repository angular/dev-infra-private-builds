/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/pr/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/pr/discover-new-conflicts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var yargs = require("yargs");
    var discover_new_conflicts_1 = require("@angular/dev-infra-private/pr/discover-new-conflicts");
    /** A Date object 30 days ago. */
    var THIRTY_DAYS_AGO = (function () {
        var date = new Date();
        // Set the hours, minutes and seconds to 0 to only consider date.
        date.setHours(0, 0, 0, 0);
        // Set the date to 30 days in the past.
        date.setDate(date.getDate() - 30);
        return date;
    })();
    /** Build the parser for the pr commands. */
    function buildPrParser(localYargs) {
        return localYargs.help().strict().demandCommand().command('discover-new-conflicts <pr>', 'Check if a pending PR causes new conflicts for other pending PRs', function (args) {
            return args.option('date', {
                description: 'Only consider PRs updated since provided date',
                defaultDescription: '30 days ago',
                coerce: Date.parse,
                default: THIRTY_DAYS_AGO,
            });
        }, function (_a) {
            var pr = _a.pr, date = _a.date;
            // If a provided date is not able to be parsed, yargs provides it as NaN.
            if (isNaN(date)) {
                console.error('Unable to parse the value provided via --date flag');
                process.exit(1);
            }
            discover_new_conflicts_1.discoverNewConflictsForPr(pr, date);
        });
    }
    exports.buildPrParser = buildPrParser;
    if (require.main === module) {
        buildPrParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDZCQUErQjtJQUMvQiwrRkFBbUU7SUFFbkUsaUNBQWlDO0lBQ2pDLElBQU0sZUFBZSxHQUFHLENBQUM7UUFDdkIsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixpRUFBaUU7UUFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQix1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDbEMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsNENBQTRDO0lBQzVDLFNBQWdCLGFBQWEsQ0FBQyxVQUFzQjtRQUNsRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQ3JELDZCQUE2QixFQUM3QixrRUFBa0UsRUFDbEUsVUFBQSxJQUFJO1lBQ0YsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDekIsV0FBVyxFQUFFLCtDQUErQztnQkFDNUQsa0JBQWtCLEVBQUUsYUFBYTtnQkFDakMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNsQixPQUFPLEVBQUUsZUFBZTthQUN6QixDQUFDLENBQUM7UUFDTCxDQUFDLEVBQ0QsVUFBQyxFQUFVO2dCQUFULFVBQUUsRUFBRSxjQUFJO1lBQ1IseUVBQXlFO1lBQ3pFLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqQjtZQUNELGtEQUF5QixDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUFwQkQsc0NBb0JDO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDOUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7ZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcn0gZnJvbSAnLi9kaXNjb3Zlci1uZXctY29uZmxpY3RzJztcblxuLyoqIEEgRGF0ZSBvYmplY3QgMzAgZGF5cyBhZ28uICovXG5jb25zdCBUSElSVFlfREFZU19BR08gPSAoKCkgPT4ge1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgLy8gU2V0IHRoZSBob3VycywgbWludXRlcyBhbmQgc2Vjb25kcyB0byAwIHRvIG9ubHkgY29uc2lkZXIgZGF0ZS5cbiAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgLy8gU2V0IHRoZSBkYXRlIHRvIDMwIGRheXMgaW4gdGhlIHBhc3QuXG4gIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIDMwKTtcbiAgcmV0dXJuIGRhdGU7XG59KSgpO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIHByIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUHJQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKCkuc3RyaWN0KCkuZGVtYW5kQ29tbWFuZCgpLmNvbW1hbmQoXG4gICAgICAnZGlzY292ZXItbmV3LWNvbmZsaWN0cyA8cHI+JyxcbiAgICAgICdDaGVjayBpZiBhIHBlbmRpbmcgUFIgY2F1c2VzIG5ldyBjb25mbGljdHMgZm9yIG90aGVyIHBlbmRpbmcgUFJzJyxcbiAgICAgIGFyZ3MgPT4ge1xuICAgICAgICByZXR1cm4gYXJncy5vcHRpb24oJ2RhdGUnLCB7XG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPbmx5IGNvbnNpZGVyIFBScyB1cGRhdGVkIHNpbmNlIHByb3ZpZGVkIGRhdGUnLFxuICAgICAgICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJzMwIGRheXMgYWdvJyxcbiAgICAgICAgICBjb2VyY2U6IERhdGUucGFyc2UsXG4gICAgICAgICAgZGVmYXVsdDogVEhJUlRZX0RBWVNfQUdPLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICAoe3ByLCBkYXRlfSkgPT4ge1xuICAgICAgICAvLyBJZiBhIHByb3ZpZGVkIGRhdGUgaXMgbm90IGFibGUgdG8gYmUgcGFyc2VkLCB5YXJncyBwcm92aWRlcyBpdCBhcyBOYU4uXG4gICAgICAgIGlmIChpc05hTihkYXRlKSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuYWJsZSB0byBwYXJzZSB0aGUgdmFsdWUgcHJvdmlkZWQgdmlhIC0tZGF0ZSBmbGFnJyk7XG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgICAgIGRpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHIocHIsIGRhdGUpO1xuICAgICAgfSk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBidWlsZFByUGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19