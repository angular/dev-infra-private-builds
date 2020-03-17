#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/cli", ["require", "exports", "@angular/dev-infra-private/pullapprove/verify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var verify_1 = require("@angular/dev-infra-private/pullapprove/verify");
    var args = process.argv.slice(2);
    // TODO(josephperrott): Set up proper cli flag/command handling
    switch (args[0]) {
        case 'pullapprove:verify':
            verify_1.verify();
            break;
        default:
            console.info('No commands were matched');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7O09BTUc7SUFDSCx3RUFBNEM7SUFFNUMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHbkMsK0RBQStEO0lBQy9ELFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2YsS0FBSyxvQkFBb0I7WUFDdkIsZUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNO1FBQ1I7WUFDRSxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7S0FDNUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3ZlcmlmeX0gZnJvbSAnLi9wdWxsYXBwcm92ZS92ZXJpZnknO1xuXG5jb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKDIpO1xuXG5cbi8vIFRPRE8oam9zZXBocGVycm90dCk6IFNldCB1cCBwcm9wZXIgY2xpIGZsYWcvY29tbWFuZCBoYW5kbGluZ1xuc3dpdGNoIChhcmdzWzBdKSB7XG4gIGNhc2UgJ3B1bGxhcHByb3ZlOnZlcmlmeSc6XG4gICAgdmVyaWZ5KCk7XG4gICAgYnJlYWs7XG4gIGRlZmF1bHQ6XG4gICAgY29uc29sZS5pbmZvKCdObyBjb21tYW5kcyB3ZXJlIG1hdGNoZWQnKTtcbn1cbiJdfQ==