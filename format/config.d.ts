/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/config" />
export interface FormatConfig {
    [keyof: string]: boolean | {
        matchers: string[];
    };
}
