"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseTrain = void 0;
/** Class describing a release-train. */
class ReleaseTrain {
    constructor(
    /** Name of the branch for this release-train. */
    branchName, 
    /** Most recent version for this release train. */
    version) {
        this.branchName = branchName;
        this.version = version;
        /** Whether the release train is currently targeting a major. */
        this.isMajor = this.version.minor === 0 && this.version.patch === 0;
    }
}
exports.ReleaseTrain = ReleaseTrain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS10cmFpbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS92ZXJzaW9uaW5nL3JlbGVhc2UtdHJhaW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILHdDQUF3QztBQUN4QyxNQUFhLFlBQVk7SUFJdkI7SUFDRSxpREFBaUQ7SUFDMUMsVUFBa0I7SUFDekIsa0RBQWtEO0lBQzNDLE9BQXNCO1FBRnRCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFFbEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQVAvQixnRUFBZ0U7UUFDaEUsWUFBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7SUFPNUQsQ0FBQztDQUNMO0FBVkQsb0NBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbi8qKiBDbGFzcyBkZXNjcmliaW5nIGEgcmVsZWFzZS10cmFpbi4gKi9cbmV4cG9ydCBjbGFzcyBSZWxlYXNlVHJhaW4ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSB0cmFpbiBpcyBjdXJyZW50bHkgdGFyZ2V0aW5nIGEgbWFqb3IuICovXG4gIGlzTWFqb3IgPSB0aGlzLnZlcnNpb24ubWlub3IgPT09IDAgJiYgdGhpcy52ZXJzaW9uLnBhdGNoID09PSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBOYW1lIG9mIHRoZSBicmFuY2ggZm9yIHRoaXMgcmVsZWFzZS10cmFpbi4gKi9cbiAgICBwdWJsaWMgYnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIC8qKiBNb3N0IHJlY2VudCB2ZXJzaW9uIGZvciB0aGlzIHJlbGVhc2UgdHJhaW4uICovXG4gICAgcHVibGljIHZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4gICkge31cbn1cbiJdfQ==