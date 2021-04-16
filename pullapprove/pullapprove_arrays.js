(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/pullapprove_arrays", ["require", "exports", "tslib", "@angular/dev-infra-private/pullapprove/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PullApproveGroupArray = exports.PullApproveStringArray = exports.PullApproveGroupStateDependencyError = void 0;
    var tslib_1 = require("tslib");
    var utils_1 = require("@angular/dev-infra-private/pullapprove/utils");
    var PullApproveGroupStateDependencyError = /** @class */ (function (_super) {
        tslib_1.__extends(PullApproveGroupStateDependencyError, _super);
        function PullApproveGroupStateDependencyError(message) {
            var _this = _super.call(this, message) || this;
            // Set the prototype explicitly because in ES5, the prototype is accidentally
            // lost due to a limitation in down-leveling.
            // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
            Object.setPrototypeOf(_this, PullApproveGroupStateDependencyError.prototype);
            // Error names are displayed in their stack but can't be set in the constructor.
            _this.name = PullApproveGroupStateDependencyError.name;
            return _this;
        }
        return PullApproveGroupStateDependencyError;
    }(Error));
    exports.PullApproveGroupStateDependencyError = PullApproveGroupStateDependencyError;
    /**
     * Superset of a native array. The superset provides methods which mimic the
     * list data structure used in PullApprove for files in conditions.
     */
    var PullApproveStringArray = /** @class */ (function (_super) {
        tslib_1.__extends(PullApproveStringArray, _super);
        function PullApproveStringArray() {
            var elements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                elements[_i] = arguments[_i];
            }
            var _this = _super.apply(this, tslib_1.__spreadArray([], tslib_1.__read(elements))) || this;
            // Set the prototype explicitly because in ES5, the prototype is accidentally
            // lost due to a limitation in down-leveling.
            // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
            Object.setPrototypeOf(_this, PullApproveStringArray.prototype);
            return _this;
        }
        /** Returns a new array which only includes files that match the given pattern. */
        PullApproveStringArray.prototype.include = function (pattern) {
            return new (PullApproveStringArray.bind.apply(PullApproveStringArray, tslib_1.__spreadArray([void 0], tslib_1.__read(this.filter(function (s) { return utils_1.getOrCreateGlob(pattern).match(s); })))))();
        };
        /** Returns a new array which only includes files that did not match the given pattern. */
        PullApproveStringArray.prototype.exclude = function (pattern) {
            return new (PullApproveStringArray.bind.apply(PullApproveStringArray, tslib_1.__spreadArray([void 0], tslib_1.__read(this.filter(function (s) { return !utils_1.getOrCreateGlob(pattern).match(s); })))))();
        };
        return PullApproveStringArray;
    }(Array));
    exports.PullApproveStringArray = PullApproveStringArray;
    /**
     * Superset of a native array. The superset provides methods which mimic the
     * list data structure used in PullApprove for groups in conditions.
     */
    var PullApproveGroupArray = /** @class */ (function (_super) {
        tslib_1.__extends(PullApproveGroupArray, _super);
        function PullApproveGroupArray() {
            var elements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                elements[_i] = arguments[_i];
            }
            var _this = _super.apply(this, tslib_1.__spreadArray([], tslib_1.__read(elements))) || this;
            // Set the prototype explicitly because in ES5, the prototype is accidentally
            // lost due to a limitation in down-leveling.
            // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
            Object.setPrototypeOf(_this, PullApproveGroupArray.prototype);
            return _this;
        }
        PullApproveGroupArray.prototype.include = function (pattern) {
            return new (PullApproveGroupArray.bind.apply(PullApproveGroupArray, tslib_1.__spreadArray([void 0], tslib_1.__read(this.filter(function (s) { return s.groupName.match(pattern); })))))();
        };
        /** Returns a new array which only includes files that did not match the given pattern. */
        PullApproveGroupArray.prototype.exclude = function (pattern) {
            return new (PullApproveGroupArray.bind.apply(PullApproveGroupArray, tslib_1.__spreadArray([void 0], tslib_1.__read(this.filter(function (s) { return s.groupName.match(pattern); })))))();
        };
        Object.defineProperty(PullApproveGroupArray.prototype, "pending", {
            get: function () {
                throw new PullApproveGroupStateDependencyError();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PullApproveGroupArray.prototype, "active", {
            get: function () {
                throw new PullApproveGroupStateDependencyError();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PullApproveGroupArray.prototype, "inactive", {
            get: function () {
                throw new PullApproveGroupStateDependencyError();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PullApproveGroupArray.prototype, "rejected", {
            get: function () {
                throw new PullApproveGroupStateDependencyError();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PullApproveGroupArray.prototype, "names", {
            get: function () {
                return this.map(function (g) { return g.groupName; });
            },
            enumerable: false,
            configurable: true
        });
        return PullApproveGroupArray;
    }(Array));
    exports.PullApproveGroupArray = PullApproveGroupArray;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbGFwcHJvdmVfYXJyYXlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3B1bGxhcHByb3ZlX2FycmF5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBUUEsc0VBQXdDO0lBRXhDO1FBQTBELGdFQUFLO1FBQzdELDhDQUFZLE9BQWdCO1lBQTVCLFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBT2Y7WUFOQyw2RUFBNkU7WUFDN0UsNkNBQTZDO1lBQzdDLGlIQUFpSDtZQUNqSCxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSxvQ0FBb0MsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1RSxnRkFBZ0Y7WUFDaEYsS0FBSSxDQUFDLElBQUksR0FBRyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUM7O1FBQ3hELENBQUM7UUFDSCwyQ0FBQztJQUFELENBQUMsQUFWRCxDQUEwRCxLQUFLLEdBVTlEO0lBVlksb0ZBQW9DO0lBWWpEOzs7T0FHRztJQUNIO1FBQTRDLGtEQUFhO1FBQ3ZEO1lBQVksa0JBQXFCO2lCQUFyQixVQUFxQixFQUFyQixxQkFBcUIsRUFBckIsSUFBcUI7Z0JBQXJCLDZCQUFxQjs7WUFBakMsd0VBQ1csUUFBUSxZQU1sQjtZQUpDLDZFQUE2RTtZQUM3RSw2Q0FBNkM7WUFDN0MsaUhBQWlIO1lBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUNoRSxDQUFDO1FBQ0Qsa0ZBQWtGO1FBQ2xGLHdDQUFPLEdBQVAsVUFBUSxPQUFlO1lBQ3JCLFlBQVcsc0JBQXNCLFlBQXRCLHNCQUFzQixpREFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsdUJBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQWpDLENBQWlDLENBQUMsT0FBRTtRQUM1RixDQUFDO1FBRUQsMEZBQTBGO1FBQzFGLHdDQUFPLEdBQVAsVUFBUSxPQUFlO1lBQ3JCLFlBQVcsc0JBQXNCLFlBQXRCLHNCQUFzQixpREFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyx1QkFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBbEMsQ0FBa0MsQ0FBQyxPQUFFO1FBQzdGLENBQUM7UUFDSCw2QkFBQztJQUFELENBQUMsQUFsQkQsQ0FBNEMsS0FBSyxHQWtCaEQ7SUFsQlksd0RBQXNCO0lBb0JuQzs7O09BR0c7SUFDSDtRQUEyQyxpREFBdUI7UUFDaEU7WUFBWSxrQkFBK0I7aUJBQS9CLFVBQStCLEVBQS9CLHFCQUErQixFQUEvQixJQUErQjtnQkFBL0IsNkJBQStCOztZQUEzQyx3RUFDVyxRQUFRLFlBTWxCO1lBSkMsNkVBQTZFO1lBQzdFLDZDQUE2QztZQUM3QyxpSEFBaUg7WUFDakgsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFJLEVBQUUscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUM7O1FBQy9ELENBQUM7UUFFRCx1Q0FBTyxHQUFQLFVBQVEsT0FBZTtZQUNyQixZQUFXLHFCQUFxQixZQUFyQixxQkFBcUIsaURBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUExQixDQUEwQixDQUFDLE9BQUU7UUFDcEYsQ0FBQztRQUVELDBGQUEwRjtRQUMxRix1Q0FBTyxHQUFQLFVBQVEsT0FBZTtZQUNyQixZQUFXLHFCQUFxQixZQUFyQixxQkFBcUIsaURBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUExQixDQUEwQixDQUFDLE9BQUU7UUFDcEYsQ0FBQztRQUVELHNCQUFJLDBDQUFPO2lCQUFYO2dCQUNFLE1BQU0sSUFBSSxvQ0FBb0MsRUFBRSxDQUFDO1lBQ25ELENBQUM7OztXQUFBO1FBRUQsc0JBQUkseUNBQU07aUJBQVY7Z0JBQ0UsTUFBTSxJQUFJLG9DQUFvQyxFQUFFLENBQUM7WUFDbkQsQ0FBQzs7O1dBQUE7UUFFRCxzQkFBSSwyQ0FBUTtpQkFBWjtnQkFDRSxNQUFNLElBQUksb0NBQW9DLEVBQUUsQ0FBQztZQUNuRCxDQUFDOzs7V0FBQTtRQUVELHNCQUFJLDJDQUFRO2lCQUFaO2dCQUNFLE1BQU0sSUFBSSxvQ0FBb0MsRUFBRSxDQUFDO1lBQ25ELENBQUM7OztXQUFBO1FBRUQsc0JBQUksd0NBQUs7aUJBQVQ7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFNBQVMsRUFBWCxDQUFXLENBQUMsQ0FBQztZQUNwQyxDQUFDOzs7V0FBQTtRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQXRDRCxDQUEyQyxLQUFLLEdBc0MvQztJQXRDWSxzREFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cH0gZnJvbSAnLi9ncm91cCc7XG5pbXBvcnQge2dldE9yQ3JlYXRlR2xvYn0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5IGJlY2F1c2UgaW4gRVM1LCB0aGUgcHJvdG90eXBlIGlzIGFjY2lkZW50YWxseVxuICAgIC8vIGxvc3QgZHVlIHRvIGEgbGltaXRhdGlvbiBpbiBkb3duLWxldmVsaW5nLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmsuXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFB1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvci5wcm90b3R5cGUpO1xuICAgIC8vIEVycm9yIG5hbWVzIGFyZSBkaXNwbGF5ZWQgaW4gdGhlaXIgc3RhY2sgYnV0IGNhbid0IGJlIHNldCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAgdGhpcy5uYW1lID0gUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yLm5hbWU7XG4gIH1cbn1cblxuLyoqXG4gKiBTdXBlcnNldCBvZiBhIG5hdGl2ZSBhcnJheS4gVGhlIHN1cGVyc2V0IHByb3ZpZGVzIG1ldGhvZHMgd2hpY2ggbWltaWMgdGhlXG4gKiBsaXN0IGRhdGEgc3RydWN0dXJlIHVzZWQgaW4gUHVsbEFwcHJvdmUgZm9yIGZpbGVzIGluIGNvbmRpdGlvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZVN0cmluZ0FycmF5IGV4dGVuZHMgQXJyYXk8c3RyaW5nPiB7XG4gIGNvbnN0cnVjdG9yKC4uLmVsZW1lbnRzOiBzdHJpbmdbXSkge1xuICAgIHN1cGVyKC4uLmVsZW1lbnRzKTtcblxuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkgYmVjYXVzZSBpbiBFUzUsIHRoZSBwcm90b3R5cGUgaXMgYWNjaWRlbnRhbGx5XG4gICAgLy8gbG9zdCBkdWUgdG8gYSBsaW1pdGF0aW9uIGluIGRvd24tbGV2ZWxpbmcuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3dpa2kvRkFRI3doeS1kb2VzbnQtZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtd29yay5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgUHVsbEFwcHJvdmVTdHJpbmdBcnJheS5wcm90b3R5cGUpO1xuICB9XG4gIC8qKiBSZXR1cm5zIGEgbmV3IGFycmF5IHdoaWNoIG9ubHkgaW5jbHVkZXMgZmlsZXMgdGhhdCBtYXRjaCB0aGUgZ2l2ZW4gcGF0dGVybi4gKi9cbiAgaW5jbHVkZShwYXR0ZXJuOiBzdHJpbmcpOiBQdWxsQXBwcm92ZVN0cmluZ0FycmF5IHtcbiAgICByZXR1cm4gbmV3IFB1bGxBcHByb3ZlU3RyaW5nQXJyYXkoLi4udGhpcy5maWx0ZXIocyA9PiBnZXRPckNyZWF0ZUdsb2IocGF0dGVybikubWF0Y2gocykpKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgbmV3IGFycmF5IHdoaWNoIG9ubHkgaW5jbHVkZXMgZmlsZXMgdGhhdCBkaWQgbm90IG1hdGNoIHRoZSBnaXZlbiBwYXR0ZXJuLiAqL1xuICBleGNsdWRlKHBhdHRlcm46IHN0cmluZyk6IFB1bGxBcHByb3ZlU3RyaW5nQXJyYXkge1xuICAgIHJldHVybiBuZXcgUHVsbEFwcHJvdmVTdHJpbmdBcnJheSguLi50aGlzLmZpbHRlcihzID0+ICFnZXRPckNyZWF0ZUdsb2IocGF0dGVybikubWF0Y2gocykpKTtcbiAgfVxufVxuXG4vKipcbiAqIFN1cGVyc2V0IG9mIGEgbmF0aXZlIGFycmF5LiBUaGUgc3VwZXJzZXQgcHJvdmlkZXMgbWV0aG9kcyB3aGljaCBtaW1pYyB0aGVcbiAqIGxpc3QgZGF0YSBzdHJ1Y3R1cmUgdXNlZCBpbiBQdWxsQXBwcm92ZSBmb3IgZ3JvdXBzIGluIGNvbmRpdGlvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwQXJyYXkgZXh0ZW5kcyBBcnJheTxQdWxsQXBwcm92ZUdyb3VwPiB7XG4gIGNvbnN0cnVjdG9yKC4uLmVsZW1lbnRzOiBQdWxsQXBwcm92ZUdyb3VwW10pIHtcbiAgICBzdXBlciguLi5lbGVtZW50cyk7XG5cbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5IGJlY2F1c2UgaW4gRVM1LCB0aGUgcHJvdG90eXBlIGlzIGFjY2lkZW50YWxseVxuICAgIC8vIGxvc3QgZHVlIHRvIGEgbGltaXRhdGlvbiBpbiBkb3duLWxldmVsaW5nLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmsuXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFB1bGxBcHByb3ZlR3JvdXBBcnJheS5wcm90b3R5cGUpO1xuICB9XG5cbiAgaW5jbHVkZShwYXR0ZXJuOiBzdHJpbmcpOiBQdWxsQXBwcm92ZUdyb3VwQXJyYXkge1xuICAgIHJldHVybiBuZXcgUHVsbEFwcHJvdmVHcm91cEFycmF5KC4uLnRoaXMuZmlsdGVyKHMgPT4gcy5ncm91cE5hbWUubWF0Y2gocGF0dGVybikpKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgbmV3IGFycmF5IHdoaWNoIG9ubHkgaW5jbHVkZXMgZmlsZXMgdGhhdCBkaWQgbm90IG1hdGNoIHRoZSBnaXZlbiBwYXR0ZXJuLiAqL1xuICBleGNsdWRlKHBhdHRlcm46IHN0cmluZyk6IFB1bGxBcHByb3ZlR3JvdXBBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBQdWxsQXBwcm92ZUdyb3VwQXJyYXkoLi4udGhpcy5maWx0ZXIocyA9PiBzLmdyb3VwTmFtZS5tYXRjaChwYXR0ZXJuKSkpO1xuICB9XG5cbiAgZ2V0IHBlbmRpbmcoKSB7XG4gICAgdGhyb3cgbmV3IFB1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcigpO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZSgpIHtcbiAgICB0aHJvdyBuZXcgUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yKCk7XG4gIH1cblxuICBnZXQgaW5hY3RpdmUoKSB7XG4gICAgdGhyb3cgbmV3IFB1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcigpO1xuICB9XG5cbiAgZ2V0IHJlamVjdGVkKCkge1xuICAgIHRocm93IG5ldyBQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3IoKTtcbiAgfVxuXG4gIGdldCBuYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZyA9PiBnLmdyb3VwTmFtZSk7XG4gIH1cbn1cbiJdfQ==