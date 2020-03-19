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
        define("@angular/dev-infra-private/ts-circular-dependencies/golden", ["require", "exports", "path", "@angular/dev-infra-private/ts-circular-dependencies/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path_1 = require("path");
    var file_system_1 = require("@angular/dev-infra-private/ts-circular-dependencies/file_system");
    /**
     * Converts a list of reference chains to a JSON-compatible golden object. Reference chains
     * by default use TypeScript source file objects. In order to make those chains printable,
     * the source file objects are mapped to their relative file names.
     */
    function convertReferenceChainToGolden(refs, baseDir) {
        return refs.map(function (chain) { return chain.map(function (_a) {
            var fileName = _a.fileName;
            return file_system_1.convertPathToForwardSlash(path_1.relative(baseDir, fileName));
        }); });
    }
    exports.convertReferenceChainToGolden = convertReferenceChainToGolden;
    /**
     * Compares the specified goldens and returns two lists that describe newly
     * added circular dependencies, or fixed circular dependencies.
     */
    function compareGoldens(actual, expected) {
        var newCircularDeps = [];
        var fixedCircularDeps = [];
        actual.forEach(function (a) {
            if (!expected.find(function (e) { return isSameCircularDependency(a, e); })) {
                newCircularDeps.push(a);
            }
        });
        expected.forEach(function (e) {
            if (!actual.find(function (a) { return isSameCircularDependency(e, a); })) {
                fixedCircularDeps.push(e);
            }
        });
        return { newCircularDeps: newCircularDeps, fixedCircularDeps: fixedCircularDeps };
    }
    exports.compareGoldens = compareGoldens;
    /** Checks whether the specified circular dependencies are equal. */
    function isSameCircularDependency(actual, expected) {
        if (actual.length !== expected.length) {
            return false;
        }
        for (var i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                return false;
            }
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9nb2xkZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCw2QkFBOEI7SUFHOUIsK0ZBQXdEO0lBS3hEOzs7O09BSUc7SUFDSCxTQUFnQiw2QkFBNkIsQ0FBQyxJQUFzQixFQUFFLE9BQWU7UUFDbkYsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUNYLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEVBQVU7Z0JBQVQsc0JBQVE7WUFBTSxPQUFBLHVDQUF5QixDQUFDLGVBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFBdEQsQ0FBc0QsQ0FBQyxFQUFqRixDQUFpRixDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUhELHNFQUdDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsY0FBYyxDQUFDLE1BQWMsRUFBRSxRQUFnQjtRQUM3RCxJQUFNLGVBQWUsR0FBeUIsRUFBRSxDQUFDO1FBQ2pELElBQU0saUJBQWlCLEdBQXlCLEVBQUUsQ0FBQztRQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztZQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUE5QixDQUE4QixDQUFDLEVBQUU7Z0JBQ3ZELGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDekI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUE5QixDQUE4QixDQUFDLEVBQUU7Z0JBQ3JELGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxFQUFDLGVBQWUsaUJBQUEsRUFBRSxpQkFBaUIsbUJBQUEsRUFBQyxDQUFDO0lBQzlDLENBQUM7SUFkRCx3Q0FjQztJQUVELG9FQUFvRTtJQUNwRSxTQUFTLHdCQUF3QixDQUFDLE1BQTBCLEVBQUUsUUFBNEI7UUFDeEYsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDckMsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxLQUFLLENBQUM7YUFDZDtTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3JlbGF0aXZlfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtSZWZlcmVuY2VDaGFpbn0gZnJvbSAnLi9hbmFseXplcic7XG5pbXBvcnQge2NvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2h9IGZyb20gJy4vZmlsZV9zeXN0ZW0nO1xuXG5leHBvcnQgdHlwZSBDaXJjdWxhckRlcGVuZGVuY3kgPSBSZWZlcmVuY2VDaGFpbjxzdHJpbmc+O1xuZXhwb3J0IHR5cGUgR29sZGVuID0gQ2lyY3VsYXJEZXBlbmRlbmN5W107XG5cbi8qKlxuICogQ29udmVydHMgYSBsaXN0IG9mIHJlZmVyZW5jZSBjaGFpbnMgdG8gYSBKU09OLWNvbXBhdGlibGUgZ29sZGVuIG9iamVjdC4gUmVmZXJlbmNlIGNoYWluc1xuICogYnkgZGVmYXVsdCB1c2UgVHlwZVNjcmlwdCBzb3VyY2UgZmlsZSBvYmplY3RzLiBJbiBvcmRlciB0byBtYWtlIHRob3NlIGNoYWlucyBwcmludGFibGUsXG4gKiB0aGUgc291cmNlIGZpbGUgb2JqZWN0cyBhcmUgbWFwcGVkIHRvIHRoZWlyIHJlbGF0aXZlIGZpbGUgbmFtZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbihyZWZzOiBSZWZlcmVuY2VDaGFpbltdLCBiYXNlRGlyOiBzdHJpbmcpOiBHb2xkZW4ge1xuICByZXR1cm4gcmVmcy5tYXAoXG4gICAgICBjaGFpbiA9PiBjaGFpbi5tYXAoKHtmaWxlTmFtZX0pID0+IGNvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2gocmVsYXRpdmUoYmFzZURpciwgZmlsZU5hbWUpKSkpO1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHRoZSBzcGVjaWZpZWQgZ29sZGVucyBhbmQgcmV0dXJucyB0d28gbGlzdHMgdGhhdCBkZXNjcmliZSBuZXdseVxuICogYWRkZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLCBvciBmaXhlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlR29sZGVucyhhY3R1YWw6IEdvbGRlbiwgZXhwZWN0ZWQ6IEdvbGRlbikge1xuICBjb25zdCBuZXdDaXJjdWxhckRlcHM6IENpcmN1bGFyRGVwZW5kZW5jeVtdID0gW107XG4gIGNvbnN0IGZpeGVkQ2lyY3VsYXJEZXBzOiBDaXJjdWxhckRlcGVuZGVuY3lbXSA9IFtdO1xuICBhY3R1YWwuZm9yRWFjaChhID0+IHtcbiAgICBpZiAoIWV4cGVjdGVkLmZpbmQoZSA9PiBpc1NhbWVDaXJjdWxhckRlcGVuZGVuY3koYSwgZSkpKSB7XG4gICAgICBuZXdDaXJjdWxhckRlcHMucHVzaChhKTtcbiAgICB9XG4gIH0pO1xuICBleHBlY3RlZC5mb3JFYWNoKGUgPT4ge1xuICAgIGlmICghYWN0dWFsLmZpbmQoYSA9PiBpc1NhbWVDaXJjdWxhckRlcGVuZGVuY3koZSwgYSkpKSB7XG4gICAgICBmaXhlZENpcmN1bGFyRGVwcy5wdXNoKGUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB7bmV3Q2lyY3VsYXJEZXBzLCBmaXhlZENpcmN1bGFyRGVwc307XG59XG5cbi8qKiBDaGVja3Mgd2hldGhlciB0aGUgc3BlY2lmaWVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBhcmUgZXF1YWwuICovXG5mdW5jdGlvbiBpc1NhbWVDaXJjdWxhckRlcGVuZGVuY3koYWN0dWFsOiBDaXJjdWxhckRlcGVuZGVuY3ksIGV4cGVjdGVkOiBDaXJjdWxhckRlcGVuZGVuY3kpIHtcbiAgaWYgKGFjdHVhbC5sZW5ndGggIT09IGV4cGVjdGVkLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhY3R1YWxbaV0gIT09IGV4cGVjdGVkW2ldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuIl19