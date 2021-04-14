(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/caretaker/check/base", ["require", "exports", "@angular/dev-infra-private/utils/git/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseModule = void 0;
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    /** The BaseModule to extend modules for caretaker checks from. */
    var BaseModule = /** @class */ (function () {
        function BaseModule(config) {
            this.config = config;
            /** The singleton instance of the GitClient. */
            this.git = index_1.GitClient.getAuthenticatedInstance();
            /** The data for the module. */
            this.data = this.retrieveData();
        }
        return BaseModule;
    }());
    exports.BaseModule = BaseModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jYXJldGFrZXIvY2hlY2svYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFRQSxvRUFBZ0Q7SUFHaEQsa0VBQWtFO0lBQ2xFO1FBTUUsb0JBQXNCLE1BQWlEO1lBQWpELFdBQU0sR0FBTixNQUFNLENBQTJDO1lBTHZFLCtDQUErQztZQUNyQyxRQUFHLEdBQUcsaUJBQVMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ3JELCtCQUErQjtZQUN0QixTQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXNDLENBQUM7UUFPN0UsaUJBQUM7SUFBRCxDQUFDLEFBYkQsSUFhQztJQWJxQixnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8qKiBUaGUgQmFzZU1vZHVsZSB0byBleHRlbmQgbW9kdWxlcyBmb3IgY2FyZXRha2VyIGNoZWNrcyBmcm9tLiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VNb2R1bGU8RGF0YT4ge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgR2l0Q2xpZW50LiAqL1xuICBwcm90ZWN0ZWQgZ2l0ID0gR2l0Q2xpZW50LmdldEF1dGhlbnRpY2F0ZWRJbnN0YW5jZSgpO1xuICAvKiogVGhlIGRhdGEgZm9yIHRoZSBtb2R1bGUuICovXG4gIHJlYWRvbmx5IGRhdGEgPSB0aGlzLnJldHJpZXZlRGF0YSgpO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBjb25maWc6IE5nRGV2Q29uZmlnPHtjYXJldGFrZXI6IENhcmV0YWtlckNvbmZpZ30+KSB7fVxuXG4gIC8qKiBBc3luY3Jvbm91c2x5IHJldHJpZXZlIGRhdGEgZm9yIHRoZSBtb2R1bGUuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZXRyaWV2ZURhdGEoKTogUHJvbWlzZTxEYXRhPjtcblxuICAvKiogUHJpbnQgdGhlIGluZm9ybWF0aW9uIGRpc2NvdmVyZWQgZm9yIHRoZSBtb2R1bGUgdG8gdGhlIHRlcm1pbmFsLiAqL1xuICBhYnN0cmFjdCBwcmludFRvVGVybWluYWwoKTogUHJvbWlzZTx2b2lkPjtcbn1cbiJdfQ==