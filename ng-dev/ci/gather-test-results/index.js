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
    const { stdout, status } = (0, child_process_1.spawnSync)('yarn', ['bazel', 'info', 'bazel-testlogs']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2kvZ2F0aGVyLXRlc3QtcmVzdWx0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx5RUFBMkQ7QUFDM0QsNkRBQW9EO0FBQ3BELCtCQUFtQztBQUNuQywyQkFRWTtBQUNaLGlEQUFnRDtBQUNoRCwyREFBcUQ7QUFFckQsNENBQTRDO0FBQzVDLE1BQU0sY0FBYyxHQUFHLHNCQUFLLENBQUMsY0FBYyxDQUFDO0FBSTVDOzs7O0dBSUc7QUFDSCxNQUFNLGNBQWMsR0FBRzs7Ozs7OztFQU9yQixDQUFDLElBQUksRUFBRSxDQUFDO0FBRVYsU0FBUyx3QkFBd0I7SUFDL0IsTUFBTSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsR0FBRyxJQUFBLHlCQUFTLEVBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFFaEYsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ2hCLE9BQU8sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ3RCO0lBQ0QsTUFBTSxLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztBQUMzRixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxzQkFBc0IsQ0FBQyxPQUFlLEVBQUUsS0FBd0I7SUFDdkUsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFBLGdCQUFXLEVBQUMsT0FBTyxDQUFDLEVBQUU7UUFDdkMsTUFBTSxRQUFRLEdBQUcsSUFBQSxXQUFJLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksSUFBQSxhQUFRLEVBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDcEMsS0FBSyxHQUFHLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNqRDthQUFNO1lBQ0wsMkZBQTJGO1lBQzNGLElBQUksSUFBQSxjQUFPLEVBQUMsSUFBSSxDQUFDLEtBQUssTUFBTSxFQUFFO2dCQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1RDtTQUNGO0tBQ0Y7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRCxTQUFnQixtQkFBbUI7SUFDakMsaUZBQWlGO0lBQ2pGLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztJQUN4QixnRkFBZ0Y7SUFDaEYsTUFBTSxXQUFXLEdBQUcsd0JBQXdCLEVBQUUsQ0FBQztJQUMvQyxpQ0FBaUM7SUFDakMsTUFBTSxlQUFlLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLHdEQUF3RDtJQUN4RCxNQUFNLGNBQWMsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUMvQzs7Ozs7T0FLRztJQUNILE1BQU0sV0FBVyxHQUFHLElBQUEsV0FBSSxFQUFDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTNELHdGQUF3RjtJQUN4RixJQUFBLFdBQU0sRUFBQyxXQUFXLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3BELElBQUEsY0FBUyxFQUFDLFdBQVcsRUFBRSxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBRTFDLG1HQUFtRztJQUNuRyxtR0FBbUc7SUFDbkcsNEZBQTRGO0lBQzVGLG9HQUFvRztJQUNwRyxPQUFPO0lBQ1AsSUFBQSxrQkFBYSxFQUFDLElBQUEsV0FBSSxFQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNoRSxJQUFBLGVBQUssRUFBQyxtREFBbUQsQ0FBQyxDQUFDO0lBRTNELG1HQUFtRztJQUNuRyxtQkFBbUI7SUFDbkIsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLG1CQUFtQixDQUFDLEVBQUUsRUFBRTtRQUM3RCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakUsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFBLGlCQUFZLEVBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBRWhGLElBQUksY0FBYyxDQUFDLGNBQWMsSUFBSSxjQUFjLENBQUMsVUFBVSxFQUFFO1lBQzlELElBQUEsZUFBSyxFQUFDLG9CQUFvQixhQUFhLHVDQUF1QyxDQUFDLENBQUM7U0FDakY7YUFBTTtZQUNMLE1BQU0sWUFBWSxHQUFHLElBQUEsV0FBSSxFQUFDLFdBQVcsRUFBRSxXQUFXLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzRSxJQUFBLGlCQUFZLEVBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3hDLElBQUEsZUFBSyxFQUFDLFdBQVcsYUFBYSxFQUFFLENBQUMsQ0FBQztTQUNuQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxjQUFJLEVBQUMsVUFBVSxlQUFlLGtDQUFrQyxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQTdDRCxrREE2Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtibGF6ZX0gZnJvbSAnLi4vLi4vLi4vYmF6ZWwvcHJvdG9zL3Rlc3Rfc3RhdHVzX3BiJztcbmltcG9ydCB7c3Bhd25TeW5jfSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7am9pbiwgZXh0bmFtZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1xuICBta2RpclN5bmMsXG4gIHJtU3luYyxcbiAgcmVhZEZpbGVTeW5jLFxuICBzdGF0U3luYyxcbiAgcmVhZGRpclN5bmMsXG4gIGNvcHlGaWxlU3luYyxcbiAgd3JpdGVGaWxlU3luYyxcbn0gZnJvbSAnZnMnO1xuaW1wb3J0IHtkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG4vKiogQmF6ZWwncyBUZXN0UmVzdWx0RGF0YSBwcm90byBNZXNzYWdlLiAqL1xuY29uc3QgVGVzdFJlc3VsdERhdGEgPSBibGF6ZS5UZXN0UmVzdWx0RGF0YTtcblxudHlwZSBUZXN0UmVzdWx0RmlsZXMgPSBbeG1sRmlsZTogc3RyaW5nLCBjYWNoZVByb3RvRmlsZTogc3RyaW5nXTtcblxuLyoqXG4gKiBBIEpVbml0IHRlc3QgcmVwb3J0IHRvIGFsd2F5cyBpbmNsdWRlIHNpZ25hbGluZyB0byBDaXJjbGVDSSB0aGF0IHRlc3RzIHdlcmUgcmVxdWVzdGVkLlxuICpcbiAqIGB0ZXN0c3VpdGVgIGFuZCBgdGVzdGNhc2VgIGVsZW1lbnRzIGFyZSByZXF1aXJlZCBmb3IgQ2lyY2xlQ0kgdG8gcHJvcGVybHkgcGFyc2UgdGhlIHJlcG9ydC5cbiAqL1xuY29uc3QgYmFzZVRlc3RSZXBvcnQgPSBgXG4gPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwiVVRGLThcIiA/PlxuIDx0ZXN0c3VpdGVzIGRpc2FibGVkPVwiMFwiIGVycm9ycz1cIjBcIiBmYWlsdXJlcz1cIjBcIiB0ZXN0cz1cIjBcIiB0aW1lPVwiMFwiPlxuICAgPHRlc3RzdWl0ZSBuYW1lPVwiXCI+XG4gICAgIDx0ZXN0Y2FzZSBuYW1lPVwiXCIvPlxuICAgPC90ZXN0c3VpdGU+XG4gPC90ZXN0c3VpdGVzPlxuIGAudHJpbSgpO1xuXG5mdW5jdGlvbiBnZXRUZXN0TG9nc0RpcmVjdG9yeVBhdGgoKSB7XG4gIGNvbnN0IHtzdGRvdXQsIHN0YXR1c30gPSBzcGF3blN5bmMoJ3lhcm4nLCBbJ2JhemVsJywgJ2luZm8nLCAnYmF6ZWwtdGVzdGxvZ3MnXSk7XG5cbiAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgIHJldHVybiBzdGRvdXQudHJpbSgpO1xuICB9XG4gIHRocm93IEVycm9yKGBVbmFibGUgdG8gZGV0ZXJtaW5lIHRoZSBwYXRoIHRvIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyBCYXplbCdzIHRlc3Rsb2cuYCk7XG59XG5cbi8qKlxuICogRGlzY292ZXIgYWxsIHRlc3QgcmVzdWx0cywgd2hpY2ggQGJhemVsL2phc21pbmUgc3RvcmVzIGFzIGB0ZXN0LnhtbGAgZmlsZXMsIGluIHRoZSBkaXJlY3RvcnkgYW5kXG4gKiByZXR1cm4gYmFjayB0aGUgbGlzdCBvZiBhYnNvbHV0ZSBmaWxlIHBhdGhzLlxuICovXG5mdW5jdGlvbiBmaW5kQWxsVGVzdFJlc3VsdEZpbGVzKGRpclBhdGg6IHN0cmluZywgZmlsZXM6IFRlc3RSZXN1bHRGaWxlc1tdKSB7XG4gIGZvciAoY29uc3QgZmlsZSBvZiByZWFkZGlyU3luYyhkaXJQYXRoKSkge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihkaXJQYXRoLCBmaWxlKTtcbiAgICBpZiAoc3RhdFN5bmMoZmlsZVBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIGZpbGVzID0gZmluZEFsbFRlc3RSZXN1bHRGaWxlcyhmaWxlUGF0aCwgZmlsZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBPbmx5IHRoZSB0ZXN0IHJlc3VsdCBmaWxlcywgd2hpY2ggYXJlIFhNTCB3aXRoIHRoZSAueG1sIGV4dGVuc2lvbiwgc2hvdWxkIGJlIGRpc2NvdmVyZWQuXG4gICAgICBpZiAoZXh0bmFtZShmaWxlKSA9PT0gJy54bWwnKSB7XG4gICAgICAgIGZpbGVzLnB1c2goW2ZpbGVQYXRoLCBqb2luKGRpclBhdGgsICd0ZXN0LmNhY2hlX3N0YXR1cycpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmaWxlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlUZXN0UmVzdWx0RmlsZXMoKSB7XG4gIC8qKiBUb3RhbCBudW1iZXIgb2YgZmlsZXMgY29waWVkLCBhbHNvIHVzZWQgYXMgYSBpbmRleCB0byBudW1iZXIgY29waWVkIGZpbGVzLiAqL1xuICBsZXQgY29waWVkRmlsZUNvdW50ID0gMDtcbiAgLyoqIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0ZXN0IGxvZ3MgZnJvbSBiYXplbCB0ZXN0cy4gKi9cbiAgY29uc3QgdGVzdExvZ3NEaXIgPSBnZXRUZXN0TG9nc0RpcmVjdG9yeVBhdGgoKTtcbiAgLyoqIExpc3Qgb2YgdGVzdCByZXN1bHQgZmlsZXMuICovXG4gIGNvbnN0IHRlc3RSZXN1bHRQYXRocyA9IGZpbmRBbGxUZXN0UmVzdWx0RmlsZXModGVzdExvZ3NEaXIsIFtdKTtcbiAgLyoqIFRoZSBmdWxsIHBhdGggdG8gdGhlIHJvb3Qgb2YgdGhlIHJlcG9zaXRvcnkgYmFzZS4gKi9cbiAgY29uc3QgcHJvamVjdEJhc2VEaXIgPSBHaXRDbGllbnQuZ2V0KCkuYmFzZURpcjtcbiAgLyoqXG4gICAqIEFic29sdXRlIHBhdGggdG8gYSBkaXJlY3RvcnkgdG8gY29udGFpbiB0aGUgSlVuaXQgdGVzdCByZXN1bHQgZmlsZXMuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBkaXJlY3RvcnkgY3JlYXRlZCBuZWVkcyB0byBjb250YWluIGEgc3ViZGlyZWN0b3J5IHdoaWNoIGNvbnRhaW5zIHRoZSB0ZXN0IHJlc3VsdHMgaW5cbiAgICogb3JkZXIgZm9yIENpcmNsZUNJIHRvIHByb3Blcmx5IGRpc2NvdmVyIHRoZSB0ZXN0IHJlc3VsdHMuXG4gICAqL1xuICBjb25zdCBkZXN0RGlyUGF0aCA9IGpvaW4ocHJvamVjdEJhc2VEaXIsICd0ZXN0LXJlc3VsdHMvXycpO1xuXG4gIC8vIEVuc3VyZSB0aGF0IGFuIGVtcHR5IGRpcmVjdG9yeSBleGlzdHMgdG8gY29udGFpbiB0aGUgdGVzdCByZXN1bHRzIHJlcG9ydHMgZm9yIHVwbG9hZC5cbiAgcm1TeW5jKGRlc3REaXJQYXRoLCB7cmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZX0pO1xuICBta2RpclN5bmMoZGVzdERpclBhdGgsIHtyZWN1cnNpdmU6IHRydWV9KTtcblxuICAvLyBCeSBhbHdheXMgdXBsb2FkaW5nIGF0IGxlYXN0IG9uZSByZXN1bHQgZmlsZSwgQ2lyY2xlQ0kgd2lsbCB1bmRlcnN0YW5kIHRoYXQgYSB0ZXN0cyBhY3Rpb25zIHdlcmVcbiAgLy8gY2FsbGVkIGZvciBpbiB0aGUgYmF6ZWwgdGVzdCBydW4sIGV2ZW4gaWYgbm90IHRlc3RzIHdlcmUgYWN0dWFsbHkgZXhlY3V0ZWQgZHVlIHRvIGNhY2hlIGhpdHMuIEJ5XG4gIC8vIGFsd2F5cyBtYWtpbmcgc3VyZSB0byB1cGxvYWQgYXQgbGVhc3Qgb25lIHRlc3QgcmVzdWx0IHJlcG9ydCwgQ2lyY2xlQ0kgYWx3YXlzIGluY2x1ZGUgdGhlXG4gIC8vIHdvcmtmbG93IGluIGl0cyBhZ2dyZWdhdGVkIGRhdGEgYW5kIHByb3ZpZGUgYmV0dGVyIG1ldHJpY3MgYWJvdXQgdGhlIG51bWJlciBvZiBleGVjdXRlZCB0ZXN0cyBwZXJcbiAgLy8gcnVuLlxuICB3cml0ZUZpbGVTeW5jKGpvaW4oZGVzdERpclBhdGgsIGByZXN1bHRzLnhtbGApLCBiYXNlVGVzdFJlcG9ydCk7XG4gIGRlYnVnKCdBZGRlZCBiYXNlIHRlc3QgcmVwb3J0IHRvIHRlc3QtcmVzdWx0cyBkaXJlY3RvcnkuJyk7XG5cbiAgLy8gQ29weSBlYWNoIG9mIHRoZSB0ZXN0IHJlc3VsdCBmaWxlcyB0byB0aGUgY2VudHJhbCB0ZXN0IHJlc3VsdCBkaXJlY3Rvcnkgd2hpY2ggQ2lyY2xlQ0kgZGlzY292ZXJzXG4gIC8vIHRlc3QgcmVzdWx0cyBpbi5cbiAgdGVzdFJlc3VsdFBhdGhzLmZvckVhY2goKFt4bWxGaWxlUGF0aCwgY2FjaGVTdGF0dXNGaWxlUGF0aF0pID0+IHtcbiAgICBjb25zdCBzaG9ydEZpbGVQYXRoID0geG1sRmlsZVBhdGguc3Vic3RyKHRlc3RMb2dzRGlyLmxlbmd0aCArIDEpO1xuICAgIGNvbnN0IHRlc3RSZXN1bHREYXRhID0gVGVzdFJlc3VsdERhdGEuZGVjb2RlKHJlYWRGaWxlU3luYyhjYWNoZVN0YXR1c0ZpbGVQYXRoKSk7XG5cbiAgICBpZiAodGVzdFJlc3VsdERhdGEucmVtb3RlbHlDYWNoZWQgJiYgdGVzdFJlc3VsdERhdGEudGVzdFBhc3NlZCkge1xuICAgICAgZGVidWcoYFNraXBwaW5nIGNvcHkgb2YgJHtzaG9ydEZpbGVQYXRofSBhcyBpdCB3YXMgYSBwYXNzaW5nIHJlbW90ZSBjYWNoZSBoaXRgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGVzdEZpbGVQYXRoID0gam9pbihkZXN0RGlyUGF0aCwgYHJlc3VsdHMtJHtjb3BpZWRGaWxlQ291bnQrK30ueG1sYCk7XG4gICAgICBjb3B5RmlsZVN5bmMoeG1sRmlsZVBhdGgsIGRlc3RGaWxlUGF0aCk7XG4gICAgICBkZWJ1ZyhgQ29weWluZyAke3Nob3J0RmlsZVBhdGh9YCk7XG4gICAgfVxuICB9KTtcblxuICBpbmZvKGBDb3BpZWQgJHtjb3BpZWRGaWxlQ291bnR9IHRlc3QgcmVzdWx0IGZpbGUocykgZm9yIHVwbG9hZC5gKTtcbn1cbiJdfQ==