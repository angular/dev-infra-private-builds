
import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);

import {
  assertValidReleaseConfig,
  getConfig
} from "../../chunk-SL4O3ID6.mjs";
import "../../chunk-YUSEAZDH.mjs";

// bazel-out/k8-fastbuild/bin/ng-dev/release/build/build-worker.js
main().catch((e) => {
  console.error(e);
  throw e;
});
async function main() {
  if (process.send === void 0) {
    throw Error("This script needs to be invoked as a NodeJS worker.");
  }
  const config = await getConfig();
  assertValidReleaseConfig(config);
  const builtPackages = await config.release.buildPackages();
  process.send(builtPackages);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=build-worker.mjs.map
