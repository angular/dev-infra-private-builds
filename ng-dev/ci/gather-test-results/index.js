"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyTestResultFiles = void 0;
const test_status_pb_1 = require("../../../bazel/protos/test_status_pb");
const child_process_1 = require("../../utils/child-process");
const path_1 = require("path");
const fs_1 = require("fs");
const console_1 = require("../../utils/console");
const git_client_1 = require("../../utils/git/git-client");
/** Bazel's TestResultData proto Message. */
const TestResultData = test_status_pb_1.blaze.TestResultData;
/**
 * A JUnit test report to always include signaling to CircleCI that tests were requested.
 *
 * `testsuite` and `testcase` elements are required for CircleCI to properly parse the report.
 */
const baseTestReport = `
 <?xml version="1.0" encoding="UTF-8" ?>
 <testsuites disabled="0" errors="0" failures="0" tests="0" time="0">
   <testsuite name="">
     <testcase name=""/>
   </testsuite>
 </testsuites>
 `.trim();
function getTestLogsDirectoryPath() {
    const { stdout, status } = (0, child_process_1.spawnSync)('yarn', ['-s', 'bazel', 'info', 'bazel-testlogs']);
    if (status === 0) {
        return stdout.trim();
    }
    throw Error(`Unable to determine the path to the directory containing Bazel's testlog.`);
}
/**
 * Discover all test results, which @bazel/jasmine stores as `test.xml` files, in the directory and
 * return back the list of absolute file paths.
 */
function findAllTestResultFiles(dirPath, files) {
    for (const file of (0, fs_1.readdirSync)(dirPath)) {
        const filePath = (0, path_1.join)(dirPath, file);
        if ((0, fs_1.statSync)(filePath).isDirectory()) {
            files = findAllTestResultFiles(filePath, files);
        }
        else {
            // Only the test result files, which are XML with the .xml extension, should be discovered.
            if ((0, path_1.extname)(file) === '.xml') {
                files.push([filePath, (0, path_1.join)(dirPath, 'test.cache_status')]);
            }
        }
    }
    return files;
}
function copyTestResultFiles() {
    /** Total number of files copied, also used as a index to number copied files. */
    let copiedFileCount = 0;
    /** The absolute path to the directory containing test logs from bazel tests. */
    const testLogsDir = getTestLogsDirectoryPath();
    /** List of test result files. */
    const testResultPaths = findAllTestResultFiles(testLogsDir, []);
    /** The full path to the root of the repository base. */
    const projectBaseDir = git_client_1.GitClient.get().baseDir;
    /**
     * Absolute path to a directory to contain the JUnit test result files.
     *
     * Note: The directory created needs to contain a subdirectory which contains the test results in
     * order for CircleCI to properly discover the test results.
     */
    const destDirPath = (0, path_1.join)(projectBaseDir, 'test-results/_');
    // Ensure that an empty directory exists to contain the test results reports for upload.
    (0, fs_1.rmSync)(destDirPath, { recursive: true, force: true });
    (0, fs_1.mkdirSync)(destDirPath, { recursive: true });
    // By always uploading at least one result file, CircleCI will understand that a tests actions were
    // called for in the bazel test run, even if not tests were actually executed due to cache hits. By
    // always making sure to upload at least one test result report, CircleCI always include the
    // workflow in its aggregated data and provide better metrics about the number of executed tests per
    // run.
    (0, fs_1.writeFileSync)((0, path_1.join)(destDirPath, `results.xml`), baseTestReport);
    (0, console_1.debug)('Added base test report to test-results directory.');
    // Copy each of the test result files to the central test result directory which CircleCI discovers
    // test results in.
    testResultPaths.forEach(([xmlFilePath, cacheStatusFilePath]) => {
        const shortFilePath = xmlFilePath.substr(testLogsDir.length + 1);
        const testResultData = TestResultData.decode((0, fs_1.readFileSync)(cacheStatusFilePath));
        if (testResultData.remotelyCached && testResultData.testPassed) {
            (0, console_1.debug)(`Skipping copy of ${shortFilePath} as it was a passing remote cache hit`);
        }
        else {
            const destFilePath = (0, path_1.join)(destDirPath, `results-${copiedFileCount++}.xml`);
            (0, fs_1.copyFileSync)(xmlFilePath, destFilePath);
            (0, console_1.debug)(`Copying ${shortFilePath}`);
        }
    });
    (0, console_1.info)(`Copied ${copiedFileCount} test result file(s) for upload.`);
}
exports.copyTestResultFiles = copyTestResultFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2kvZ2F0aGVyLXRlc3QtcmVzdWx0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx5RUFBMkQ7QUFDM0QsNkRBQW9EO0FBQ3BELCtCQUFtQztBQUNuQywyQkFRWTtBQUNaLGlEQUFnRDtBQUNoRCwyREFBcUQ7QUFFckQsNENBQTRDO0FBQzVDLE1BQU0sY0FBYyxHQUFHLHNCQUFLLENBQUMsY0FBYyxDQUFDO0FBSTVDOzs7O0dBSUc7QUFDSCxNQUFNLGNBQWMsR0FBRzs7Ozs7OztFQU9yQixDQUFDLElBQUksRUFBRSxDQUFDO0FBRVYsU0FBUyx3QkFBd0I7SUFDL0IsTUFBTSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsR0FBRyxJQUFBLHlCQUFTLEVBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0lBRXRGLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNoQixPQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN0QjtJQUNELE1BQU0sS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7QUFDM0YsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsc0JBQXNCLENBQUMsT0FBZSxFQUFFLEtBQXdCO0lBQ3ZFLEtBQUssTUFBTSxJQUFJLElBQUksSUFBQSxnQkFBVyxFQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3ZDLE1BQU0sUUFBUSxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLElBQUEsYUFBUSxFQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3BDLEtBQUssR0FBRyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDakQ7YUFBTTtZQUNMLDJGQUEyRjtZQUMzRixJQUFJLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxLQUFLLE1BQU0sRUFBRTtnQkFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUQ7U0FDRjtLQUNGO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsU0FBZ0IsbUJBQW1CO0lBQ2pDLGlGQUFpRjtJQUNqRixJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7SUFDeEIsZ0ZBQWdGO0lBQ2hGLE1BQU0sV0FBVyxHQUFHLHdCQUF3QixFQUFFLENBQUM7SUFDL0MsaUNBQWlDO0lBQ2pDLE1BQU0sZUFBZSxHQUFHLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRSx3REFBd0Q7SUFDeEQsTUFBTSxjQUFjLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7SUFDL0M7Ozs7O09BS0c7SUFDSCxNQUFNLFdBQVcsR0FBRyxJQUFBLFdBQUksRUFBQyxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUUzRCx3RkFBd0Y7SUFDeEYsSUFBQSxXQUFNLEVBQUMsV0FBVyxFQUFFLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUNwRCxJQUFBLGNBQVMsRUFBQyxXQUFXLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUUxQyxtR0FBbUc7SUFDbkcsbUdBQW1HO0lBQ25HLDRGQUE0RjtJQUM1RixvR0FBb0c7SUFDcEcsT0FBTztJQUNQLElBQUEsa0JBQWEsRUFBQyxJQUFBLFdBQUksRUFBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDaEUsSUFBQSxlQUFLLEVBQUMsbURBQW1ELENBQUMsQ0FBQztJQUUzRCxtR0FBbUc7SUFDbkcsbUJBQW1CO0lBQ25CLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUU7UUFDN0QsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBQSxpQkFBWSxFQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUVoRixJQUFJLGNBQWMsQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLFVBQVUsRUFBRTtZQUM5RCxJQUFBLGVBQUssRUFBQyxvQkFBb0IsYUFBYSx1Q0FBdUMsQ0FBQyxDQUFDO1NBQ2pGO2FBQU07WUFDTCxNQUFNLFlBQVksR0FBRyxJQUFBLFdBQUksRUFBQyxXQUFXLEVBQUUsV0FBVyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDM0UsSUFBQSxpQkFBWSxFQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN4QyxJQUFBLGVBQUssRUFBQyxXQUFXLGFBQWEsRUFBRSxDQUFDLENBQUM7U0FDbkM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUEsY0FBSSxFQUFDLFVBQVUsZUFBZSxrQ0FBa0MsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUE3Q0Qsa0RBNkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YmxhemV9IGZyb20gJy4uLy4uLy4uL2JhemVsL3Byb3Rvcy90ZXN0X3N0YXR1c19wYic7XG5pbXBvcnQge3NwYXduU3luY30gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2pvaW4sIGV4dG5hbWV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtcbiAgbWtkaXJTeW5jLFxuICBybVN5bmMsXG4gIHJlYWRGaWxlU3luYyxcbiAgc3RhdFN5bmMsXG4gIHJlYWRkaXJTeW5jLFxuICBjb3B5RmlsZVN5bmMsXG4gIHdyaXRlRmlsZVN5bmMsXG59IGZyb20gJ2ZzJztcbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcblxuLyoqIEJhemVsJ3MgVGVzdFJlc3VsdERhdGEgcHJvdG8gTWVzc2FnZS4gKi9cbmNvbnN0IFRlc3RSZXN1bHREYXRhID0gYmxhemUuVGVzdFJlc3VsdERhdGE7XG5cbnR5cGUgVGVzdFJlc3VsdEZpbGVzID0gW3htbEZpbGU6IHN0cmluZywgY2FjaGVQcm90b0ZpbGU6IHN0cmluZ107XG5cbi8qKlxuICogQSBKVW5pdCB0ZXN0IHJlcG9ydCB0byBhbHdheXMgaW5jbHVkZSBzaWduYWxpbmcgdG8gQ2lyY2xlQ0kgdGhhdCB0ZXN0cyB3ZXJlIHJlcXVlc3RlZC5cbiAqXG4gKiBgdGVzdHN1aXRlYCBhbmQgYHRlc3RjYXNlYCBlbGVtZW50cyBhcmUgcmVxdWlyZWQgZm9yIENpcmNsZUNJIHRvIHByb3Blcmx5IHBhcnNlIHRoZSByZXBvcnQuXG4gKi9cbmNvbnN0IGJhc2VUZXN0UmVwb3J0ID0gYFxuIDw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCIgPz5cbiA8dGVzdHN1aXRlcyBkaXNhYmxlZD1cIjBcIiBlcnJvcnM9XCIwXCIgZmFpbHVyZXM9XCIwXCIgdGVzdHM9XCIwXCIgdGltZT1cIjBcIj5cbiAgIDx0ZXN0c3VpdGUgbmFtZT1cIlwiPlxuICAgICA8dGVzdGNhc2UgbmFtZT1cIlwiLz5cbiAgIDwvdGVzdHN1aXRlPlxuIDwvdGVzdHN1aXRlcz5cbiBgLnRyaW0oKTtcblxuZnVuY3Rpb24gZ2V0VGVzdExvZ3NEaXJlY3RvcnlQYXRoKCkge1xuICBjb25zdCB7c3Rkb3V0LCBzdGF0dXN9ID0gc3Bhd25TeW5jKCd5YXJuJywgWyctcycsICdiYXplbCcsICdpbmZvJywgJ2JhemVsLXRlc3Rsb2dzJ10pO1xuXG4gIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICByZXR1cm4gc3Rkb3V0LnRyaW0oKTtcbiAgfVxuICB0aHJvdyBFcnJvcihgVW5hYmxlIHRvIGRldGVybWluZSB0aGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgQmF6ZWwncyB0ZXN0bG9nLmApO1xufVxuXG4vKipcbiAqIERpc2NvdmVyIGFsbCB0ZXN0IHJlc3VsdHMsIHdoaWNoIEBiYXplbC9qYXNtaW5lIHN0b3JlcyBhcyBgdGVzdC54bWxgIGZpbGVzLCBpbiB0aGUgZGlyZWN0b3J5IGFuZFxuICogcmV0dXJuIGJhY2sgdGhlIGxpc3Qgb2YgYWJzb2x1dGUgZmlsZSBwYXRocy5cbiAqL1xuZnVuY3Rpb24gZmluZEFsbFRlc3RSZXN1bHRGaWxlcyhkaXJQYXRoOiBzdHJpbmcsIGZpbGVzOiBUZXN0UmVzdWx0RmlsZXNbXSkge1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgcmVhZGRpclN5bmMoZGlyUGF0aCkpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGpvaW4oZGlyUGF0aCwgZmlsZSk7XG4gICAgaWYgKHN0YXRTeW5jKGZpbGVQYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBmaWxlcyA9IGZpbmRBbGxUZXN0UmVzdWx0RmlsZXMoZmlsZVBhdGgsIGZpbGVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT25seSB0aGUgdGVzdCByZXN1bHQgZmlsZXMsIHdoaWNoIGFyZSBYTUwgd2l0aCB0aGUgLnhtbCBleHRlbnNpb24sIHNob3VsZCBiZSBkaXNjb3ZlcmVkLlxuICAgICAgaWYgKGV4dG5hbWUoZmlsZSkgPT09ICcueG1sJykge1xuICAgICAgICBmaWxlcy5wdXNoKFtmaWxlUGF0aCwgam9pbihkaXJQYXRoLCAndGVzdC5jYWNoZV9zdGF0dXMnKV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmlsZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5VGVzdFJlc3VsdEZpbGVzKCkge1xuICAvKiogVG90YWwgbnVtYmVyIG9mIGZpbGVzIGNvcGllZCwgYWxzbyB1c2VkIGFzIGEgaW5kZXggdG8gbnVtYmVyIGNvcGllZCBmaWxlcy4gKi9cbiAgbGV0IGNvcGllZEZpbGVDb3VudCA9IDA7XG4gIC8qKiBUaGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGVzdCBsb2dzIGZyb20gYmF6ZWwgdGVzdHMuICovXG4gIGNvbnN0IHRlc3RMb2dzRGlyID0gZ2V0VGVzdExvZ3NEaXJlY3RvcnlQYXRoKCk7XG4gIC8qKiBMaXN0IG9mIHRlc3QgcmVzdWx0IGZpbGVzLiAqL1xuICBjb25zdCB0ZXN0UmVzdWx0UGF0aHMgPSBmaW5kQWxsVGVzdFJlc3VsdEZpbGVzKHRlc3RMb2dzRGlyLCBbXSk7XG4gIC8qKiBUaGUgZnVsbCBwYXRoIHRvIHRoZSByb290IG9mIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG4gIGNvbnN0IHByb2plY3RCYXNlRGlyID0gR2l0Q2xpZW50LmdldCgpLmJhc2VEaXI7XG4gIC8qKlxuICAgKiBBYnNvbHV0ZSBwYXRoIHRvIGEgZGlyZWN0b3J5IHRvIGNvbnRhaW4gdGhlIEpVbml0IHRlc3QgcmVzdWx0IGZpbGVzLlxuICAgKlxuICAgKiBOb3RlOiBUaGUgZGlyZWN0b3J5IGNyZWF0ZWQgbmVlZHMgdG8gY29udGFpbiBhIHN1YmRpcmVjdG9yeSB3aGljaCBjb250YWlucyB0aGUgdGVzdCByZXN1bHRzIGluXG4gICAqIG9yZGVyIGZvciBDaXJjbGVDSSB0byBwcm9wZXJseSBkaXNjb3ZlciB0aGUgdGVzdCByZXN1bHRzLlxuICAgKi9cbiAgY29uc3QgZGVzdERpclBhdGggPSBqb2luKHByb2plY3RCYXNlRGlyLCAndGVzdC1yZXN1bHRzL18nKTtcblxuICAvLyBFbnN1cmUgdGhhdCBhbiBlbXB0eSBkaXJlY3RvcnkgZXhpc3RzIHRvIGNvbnRhaW4gdGhlIHRlc3QgcmVzdWx0cyByZXBvcnRzIGZvciB1cGxvYWQuXG4gIHJtU3luYyhkZXN0RGlyUGF0aCwge3JlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWV9KTtcbiAgbWtkaXJTeW5jKGRlc3REaXJQYXRoLCB7cmVjdXJzaXZlOiB0cnVlfSk7XG5cbiAgLy8gQnkgYWx3YXlzIHVwbG9hZGluZyBhdCBsZWFzdCBvbmUgcmVzdWx0IGZpbGUsIENpcmNsZUNJIHdpbGwgdW5kZXJzdGFuZCB0aGF0IGEgdGVzdHMgYWN0aW9ucyB3ZXJlXG4gIC8vIGNhbGxlZCBmb3IgaW4gdGhlIGJhemVsIHRlc3QgcnVuLCBldmVuIGlmIG5vdCB0ZXN0cyB3ZXJlIGFjdHVhbGx5IGV4ZWN1dGVkIGR1ZSB0byBjYWNoZSBoaXRzLiBCeVxuICAvLyBhbHdheXMgbWFraW5nIHN1cmUgdG8gdXBsb2FkIGF0IGxlYXN0IG9uZSB0ZXN0IHJlc3VsdCByZXBvcnQsIENpcmNsZUNJIGFsd2F5cyBpbmNsdWRlIHRoZVxuICAvLyB3b3JrZmxvdyBpbiBpdHMgYWdncmVnYXRlZCBkYXRhIGFuZCBwcm92aWRlIGJldHRlciBtZXRyaWNzIGFib3V0IHRoZSBudW1iZXIgb2YgZXhlY3V0ZWQgdGVzdHMgcGVyXG4gIC8vIHJ1bi5cbiAgd3JpdGVGaWxlU3luYyhqb2luKGRlc3REaXJQYXRoLCBgcmVzdWx0cy54bWxgKSwgYmFzZVRlc3RSZXBvcnQpO1xuICBkZWJ1ZygnQWRkZWQgYmFzZSB0ZXN0IHJlcG9ydCB0byB0ZXN0LXJlc3VsdHMgZGlyZWN0b3J5LicpO1xuXG4gIC8vIENvcHkgZWFjaCBvZiB0aGUgdGVzdCByZXN1bHQgZmlsZXMgdG8gdGhlIGNlbnRyYWwgdGVzdCByZXN1bHQgZGlyZWN0b3J5IHdoaWNoIENpcmNsZUNJIGRpc2NvdmVyc1xuICAvLyB0ZXN0IHJlc3VsdHMgaW4uXG4gIHRlc3RSZXN1bHRQYXRocy5mb3JFYWNoKChbeG1sRmlsZVBhdGgsIGNhY2hlU3RhdHVzRmlsZVBhdGhdKSA9PiB7XG4gICAgY29uc3Qgc2hvcnRGaWxlUGF0aCA9IHhtbEZpbGVQYXRoLnN1YnN0cih0ZXN0TG9nc0Rpci5sZW5ndGggKyAxKTtcbiAgICBjb25zdCB0ZXN0UmVzdWx0RGF0YSA9IFRlc3RSZXN1bHREYXRhLmRlY29kZShyZWFkRmlsZVN5bmMoY2FjaGVTdGF0dXNGaWxlUGF0aCkpO1xuXG4gICAgaWYgKHRlc3RSZXN1bHREYXRhLnJlbW90ZWx5Q2FjaGVkICYmIHRlc3RSZXN1bHREYXRhLnRlc3RQYXNzZWQpIHtcbiAgICAgIGRlYnVnKGBTa2lwcGluZyBjb3B5IG9mICR7c2hvcnRGaWxlUGF0aH0gYXMgaXQgd2FzIGEgcGFzc2luZyByZW1vdGUgY2FjaGUgaGl0YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRlc3RGaWxlUGF0aCA9IGpvaW4oZGVzdERpclBhdGgsIGByZXN1bHRzLSR7Y29waWVkRmlsZUNvdW50Kyt9LnhtbGApO1xuICAgICAgY29weUZpbGVTeW5jKHhtbEZpbGVQYXRoLCBkZXN0RmlsZVBhdGgpO1xuICAgICAgZGVidWcoYENvcHlpbmcgJHtzaG9ydEZpbGVQYXRofWApO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5mbyhgQ29waWVkICR7Y29waWVkRmlsZUNvdW50fSB0ZXN0IHJlc3VsdCBmaWxlKHMpIGZvciB1cGxvYWQuYCk7XG59XG4iXX0=