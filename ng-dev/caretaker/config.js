"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidCaretakerConfig = void 0;
const config_1 = require("../utils/config");
/** Retrieve and validate the config as `CaretakerConfig`. */
function assertValidCaretakerConfig(config) {
    if (config.caretaker === undefined) {
        throw new config_1.ConfigValidationError(`No configuration defined for "caretaker"`);
    }
}
exports.assertValidCaretakerConfig = assertValidCaretakerConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsNENBQWlGO0FBWWpGLDZEQUE2RDtBQUM3RCxTQUFnQiwwQkFBMEIsQ0FDeEMsTUFBaUQ7SUFFakQsSUFBSSxNQUFNLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTtRQUNsQyxNQUFNLElBQUksOEJBQXFCLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUM3RTtBQUNILENBQUM7QUFORCxnRUFNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydE5vRXJyb3JzLCBDb25maWdWYWxpZGF0aW9uRXJyb3IsIGdldENvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuZXhwb3J0IGludGVyZmFjZSBDYXJldGFrZXJDb25maWcge1xuICAvKiogR2l0aHViIHF1ZXJpZXMgc2hvd2luZyBhIHNuYXBzaG90IG9mIHB1bGxzL2lzc3VlcyBjYXJldGFrZXJzIG5lZWQgdG8gbW9uaXRvci4gKi9cbiAgZ2l0aHViUXVlcmllcz86IHtuYW1lOiBzdHJpbmc7IHF1ZXJ5OiBzdHJpbmd9W107XG4gIC8qKlxuICAgKiBUaGUgR2l0aHViIGdyb3VwIHVzZWQgdG8gdHJhY2sgY3VycmVudCBjYXJldGFrZXJzLiBBIHNlY29uZCBncm91cCBpcyBhc3N1bWVkIHRvIGV4aXN0IHdpdGggdGhlXG4gICAqIG5hbWUgXCI8Z3JvdXAtbmFtZT4tcm9zdGVyXCIgY29udGFpbmluZyBhIGxpc3Qgb2YgYWxsIHVzZXJzIGVsaWdpYmxlIGZvciB0aGUgY2FyZXRha2VyIGdyb3VwLlxuICAgKiAqL1xuICBjYXJldGFrZXJHcm91cD86IHN0cmluZztcbn1cblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBDYXJldGFrZXJDb25maWdgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkQ2FyZXRha2VyQ29uZmlnPFQ+KFxuICBjb25maWc6IFQgJiBQYXJ0aWFsPHtjYXJldGFrZXI6IENhcmV0YWtlckNvbmZpZ30+LFxuKTogYXNzZXJ0cyBjb25maWcgaXMgVCAmIHtjYXJldGFrZXI6IENhcmV0YWtlckNvbmZpZ30ge1xuICBpZiAoY29uZmlnLmNhcmV0YWtlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IENvbmZpZ1ZhbGlkYXRpb25FcnJvcihgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImNhcmV0YWtlclwiYCk7XG4gIH1cbn1cbiJdfQ==