(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/caretaker/check/base", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseModule = void 0;
    /** The BaseModule to extend modules for caretaker checks from. */
    var BaseModule = /** @class */ (function () {
        function BaseModule(git, config) {
            this.git = git;
            this.config = config;
            /** The data for the module. */
            this.data = this.retrieveData();
        }
        return BaseModule;
    }());
    exports.BaseModule = BaseModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jYXJldGFrZXIvY2hlY2svYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFXQSxrRUFBa0U7SUFDbEU7UUFJRSxvQkFDYyxHQUFjLEVBQVksTUFBaUQ7WUFBM0UsUUFBRyxHQUFILEdBQUcsQ0FBVztZQUFZLFdBQU0sR0FBTixNQUFNLENBQTJDO1lBSnpGLCtCQUErQjtZQUN0QixTQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBR3dELENBQUM7UUFPL0YsaUJBQUM7SUFBRCxDQUFDLEFBWkQsSUFZQztJQVpxQixnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8qKiBUaGUgQmFzZU1vZHVsZSB0byBleHRlbmQgbW9kdWxlcyBmb3IgY2FyZXRha2VyIGNoZWNrcyBmcm9tLiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VNb2R1bGU8RGF0YT4ge1xuICAvKiogVGhlIGRhdGEgZm9yIHRoZSBtb2R1bGUuICovXG4gIHJlYWRvbmx5IGRhdGEgPSB0aGlzLnJldHJpZXZlRGF0YSgpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIGdpdDogR2l0Q2xpZW50LCBwcm90ZWN0ZWQgY29uZmlnOiBOZ0RldkNvbmZpZzx7Y2FyZXRha2VyOiBDYXJldGFrZXJDb25maWd9Pikge31cblxuICAvKiogQXN5bmNyb25vdXNseSByZXRyaWV2ZSBkYXRhIGZvciB0aGUgbW9kdWxlLiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgYXN5bmMgcmV0cmlldmVEYXRhKCk6IFByb21pc2U8RGF0YT47XG5cbiAgLyoqIFByaW50IHRoZSBpbmZvcm1hdGlvbiBkaXNjb3ZlcmVkIGZvciB0aGUgbW9kdWxlIHRvIHRoZSB0ZXJtaW5hbC4gKi9cbiAgYWJzdHJhY3QgYXN5bmMgcHJpbnRUb1Rlcm1pbmFsKCk6IFByb21pc2U8dm9pZD47XG59XG4iXX0=