/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Class describing a release-train. */
export class ReleaseTrain {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS10cmFpbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL3JlbGVhc2UtdHJhaW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILHdDQUF3QztBQUN4QyxNQUFNLE9BQU8sWUFBWTtJQUl2QjtJQUNJLGlEQUFpRDtJQUMxQyxVQUFrQjtJQUN6QixrREFBa0Q7SUFDM0MsT0FBc0I7UUFGdEIsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUVsQixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBUGpDLGdFQUFnRTtRQUNoRSxZQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztJQU0zQixDQUFDO0NBQ3RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG4vKiogQ2xhc3MgZGVzY3JpYmluZyBhIHJlbGVhc2UtdHJhaW4uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZVRyYWluIHtcbiAgLyoqIFdoZXRoZXIgdGhlIHJlbGVhc2UgdHJhaW4gaXMgY3VycmVudGx5IHRhcmdldGluZyBhIG1ham9yLiAqL1xuICBpc01ham9yID0gdGhpcy52ZXJzaW9uLm1pbm9yID09PSAwICYmIHRoaXMudmVyc2lvbi5wYXRjaCA9PT0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBOYW1lIG9mIHRoZSBicmFuY2ggZm9yIHRoaXMgcmVsZWFzZS10cmFpbi4gKi9cbiAgICAgIHB1YmxpYyBicmFuY2hOYW1lOiBzdHJpbmcsXG4gICAgICAvKiogTW9zdCByZWNlbnQgdmVyc2lvbiBmb3IgdGhpcyByZWxlYXNlIHRyYWluLiAqL1xuICAgICAgcHVibGljIHZlcnNpb246IHNlbXZlci5TZW1WZXIpIHt9XG59XG4iXX0=