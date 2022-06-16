#!/usr/bin/env node
"use strict";

import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);


// bazel-out/k8-fastbuild/bin/ng-dev/pr/merge/strategies/commit-message-filter.js
main();
function main() {
  const [prNumber] = process.argv.slice(2);
  if (!prNumber) {
    console.error("No pull request number specified.");
    process.exit(1);
  }
  let commitMessage = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("readable", () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      commitMessage += chunk;
    }
  });
  process.stdin.on("end", () => {
    console.info(rewriteCommitMessage(commitMessage, prNumber));
  });
}
function rewriteCommitMessage(message, prNumber) {
  const lines = message.split(/\n/);
  lines[0] += ` (#${prNumber})`;
  lines.push(`PR Close #${prNumber}`);
  return lines.join("\n");
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=commit-message-filter.mjs.map
