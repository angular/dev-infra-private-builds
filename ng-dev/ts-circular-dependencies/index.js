"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.tsCircularDependenciesBuilder = void 0;
const fs_1 = require("fs");
const glob_1 = require("glob");
const path_1 = require("path");
const console_1 = require("../utils/console");
const analyzer_1 = require("./analyzer");
const config_1 = require("./config");
const file_system_1 = require("./file_system");
const golden_1 = require("./golden");
function tsCircularDependenciesBuilder(localYargs) {
    return localYargs
        .help()
        .strict()
        .demandCommand()
        .option('config', {
        type: 'string',
        demandOption: true,
        description: 'Path to the configuration file.',
    })
        .option('warnings', { type: 'boolean', description: 'Prints all warnings.' })
        .command('check', 'Checks if the circular dependencies have changed.', (args) => args, (argv) => {
        const { config: configArg, warnings } = argv;
        const configPath = (0, path_1.isAbsolute)(configArg) ? configArg : (0, path_1.resolve)(configArg);
        const config = (0, config_1.loadTestConfig)(configPath);
        process.exit(main(false, config, !!warnings));
    })
        .command('approve', 'Approves the current circular dependencies.', (args) => args, (argv) => {
        const { config: configArg, warnings } = argv;
        const configPath = (0, path_1.isAbsolute)(configArg) ? configArg : (0, path_1.resolve)(configArg);
        const config = (0, config_1.loadTestConfig)(configPath);
        process.exit(main(true, config, !!warnings));
    });
}
exports.tsCircularDependenciesBuilder = tsCircularDependenciesBuilder;
/**
 * Runs the ts-circular-dependencies tool.
 * @param approve Whether the detected circular dependencies should be approved.
 * @param config Configuration for the current circular dependencies test.
 * @param printWarnings Whether warnings should be printed out.
 * @returns Status code.
 */
function main(approve, config, printWarnings) {
    const { baseDir, goldenFile, glob, resolveModule, approveCommand } = config;
    const analyzer = new analyzer_1.Analyzer(resolveModule);
    const cycles = [];
    const checkedNodes = new WeakSet();
    (0, glob_1.sync)(glob, { absolute: true, ignore: ['**/node_modules/**'] }).forEach((filePath) => {
        const sourceFile = analyzer.getSourceFile(filePath);
        cycles.push(...analyzer.findCycles(sourceFile, checkedNodes));
    });
    const actual = (0, golden_1.convertReferenceChainToGolden)(cycles, baseDir);
    (0, console_1.info)((0, console_1.green)(`   Current number of cycles: ${(0, console_1.yellow)(cycles.length.toString())}`));
    if (approve) {
        (0, fs_1.writeFileSync)(goldenFile, JSON.stringify(actual, null, 2));
        (0, console_1.info)((0, console_1.green)('✅  Updated golden file.'));
        return 0;
    }
    else if (!(0, fs_1.existsSync)(goldenFile)) {
        (0, console_1.error)((0, console_1.red)(`❌  Could not find golden file: ${goldenFile}`));
        return 1;
    }
    const warningsCount = analyzer.unresolvedFiles.size + analyzer.unresolvedModules.size;
    // By default, warnings for unresolved files or modules are not printed. This is because
    // it's common that third-party modules are not resolved/visited. Also generated files
    // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
    if (printWarnings && warningsCount !== 0) {
        (0, console_1.info)((0, console_1.yellow)('⚠  The following imports could not be resolved:'));
        Array.from(analyzer.unresolvedModules)
            .sort()
            .forEach((specifier) => (0, console_1.info)(`  • ${specifier}`));
        analyzer.unresolvedFiles.forEach((value, key) => {
            (0, console_1.info)(`  • ${getRelativePath(baseDir, key)}`);
            value.sort().forEach((specifier) => (0, console_1.info)(`      ${specifier}`));
        });
    }
    else {
        (0, console_1.info)((0, console_1.yellow)(`⚠  ${warningsCount} imports could not be resolved.`));
        (0, console_1.info)((0, console_1.yellow)(`   Please rerun with "--warnings" to inspect unresolved imports.`));
    }
    const expected = JSON.parse((0, fs_1.readFileSync)(goldenFile, 'utf8'));
    const { fixedCircularDeps, newCircularDeps } = (0, golden_1.compareGoldens)(actual, expected);
    const isMatching = fixedCircularDeps.length === 0 && newCircularDeps.length === 0;
    if (isMatching) {
        (0, console_1.info)((0, console_1.green)('✅  Golden matches current circular dependencies.'));
        return 0;
    }
    (0, console_1.error)((0, console_1.red)('❌  Golden does not match current circular dependencies.'));
    if (newCircularDeps.length !== 0) {
        (0, console_1.error)((0, console_1.yellow)(`   New circular dependencies which are not allowed:`));
        newCircularDeps.forEach((c) => (0, console_1.error)(`     • ${convertReferenceChainToString(c)}`));
        (0, console_1.error)();
    }
    if (fixedCircularDeps.length !== 0) {
        (0, console_1.error)((0, console_1.yellow)(`   Fixed circular dependencies that need to be removed from the golden:`));
        fixedCircularDeps.forEach((c) => (0, console_1.error)(`     • ${convertReferenceChainToString(c)}`));
        (0, console_1.info)((0, console_1.yellow)(`\n   Total: ${newCircularDeps.length} new cycle(s), ${fixedCircularDeps.length} fixed cycle(s). \n`));
        if (approveCommand) {
            (0, console_1.info)((0, console_1.yellow)(`   Please approve the new golden with: ${approveCommand}`));
        }
        else {
            (0, console_1.info)((0, console_1.yellow)(`   Please update the golden. The following command can be ` +
                `run: yarn ts-circular-deps approve ${getRelativePath(process.cwd(), goldenFile)}.`));
        }
    }
    return 1;
}
exports.main = main;
/** Gets the specified path relative to the base directory. */
function getRelativePath(baseDir, path) {
    return (0, file_system_1.convertPathToForwardSlash)((0, path_1.relative)(baseDir, path));
}
/** Converts the given reference chain to its string representation. */
function convertReferenceChainToString(chain) {
    return chain.join(' → ');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUEyRDtBQUMzRCwrQkFBc0M7QUFDdEMsK0JBQW1EO0FBSW5ELDhDQUFpRTtBQUVqRSx5Q0FBb0Q7QUFDcEQscUNBQXdFO0FBQ3hFLCtDQUF3RDtBQUN4RCxxQ0FBK0U7QUFFL0UsU0FBZ0IsNkJBQTZCLENBQUMsVUFBc0I7SUFDbEUsT0FBTyxVQUFVO1NBQ2QsSUFBSSxFQUFFO1NBQ04sTUFBTSxFQUFFO1NBQ1IsYUFBYSxFQUFFO1NBQ2YsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUNoQixJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFdBQVcsRUFBRSxpQ0FBaUM7S0FDL0MsQ0FBQztTQUNELE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBQyxDQUFDO1NBQzFFLE9BQU8sQ0FDTixPQUFPLEVBQ1AsbURBQW1ELEVBQ25ELENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQ2QsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNQLE1BQU0sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBQyxHQUFHLElBQUksQ0FBQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFBLGlCQUFVLEVBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFPLEVBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUUsTUFBTSxNQUFNLEdBQUcsSUFBQSx1QkFBYyxFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVB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RkM7QUFFRCw4REFBOEQ7QUFDOUQsU0FBUyxlQUFlLENBQUMsT0FBZSxFQUFFLElBQVk7SUFDcEQsT0FBTyxJQUFBLHVDQUF5QixFQUFDLElBQUEsZUFBUSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRCx1RUFBdUU7QUFDdkUsU0FBUyw2QkFBNkIsQ0FBQyxLQUE2QjtJQUNsRSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtzeW5jIGFzIGdsb2JTeW5jfSBmcm9tICdnbG9iJztcbmltcG9ydCB7aXNBYnNvbHV0ZSwgcmVsYXRpdmUsIHJlc29sdmV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWQsIHllbGxvd30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7QW5hbHl6ZXIsIFJlZmVyZW5jZUNoYWlufSBmcm9tICcuL2FuYWx5emVyJztcbmltcG9ydCB7Q2lyY3VsYXJEZXBlbmRlbmNpZXNUZXN0Q29uZmlnLCBsb2FkVGVzdENvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNofSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Y29tcGFyZUdvbGRlbnMsIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuLCBHb2xkZW59IGZyb20gJy4vZ29sZGVuJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3NcbiAgICAuaGVscCgpXG4gICAgLnN0cmljdCgpXG4gICAgLmRlbWFuZENvbW1hbmQoKVxuICAgIC5vcHRpb24oJ2NvbmZpZycsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdQYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuJyxcbiAgICB9KVxuICAgIC5vcHRpb24oJ3dhcm5pbmdzJywge3R5cGU6ICdib29sZWFuJywgZGVzY3JpcHRpb246ICdQcmludHMgYWxsIHdhcm5pbmdzLid9KVxuICAgIC5jb21tYW5kKFxuICAgICAgJ2NoZWNrJyxcbiAgICAgICdDaGVja3MgaWYgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBoYXZlIGNoYW5nZWQuJyxcbiAgICAgIChhcmdzKSA9PiBhcmdzLFxuICAgICAgKGFyZ3YpID0+IHtcbiAgICAgICAgY29uc3Qge2NvbmZpZzogY29uZmlnQXJnLCB3YXJuaW5nc30gPSBhcmd2O1xuICAgICAgICBjb25zdCBjb25maWdQYXRoID0gaXNBYnNvbHV0ZShjb25maWdBcmcpID8gY29uZmlnQXJnIDogcmVzb2x2ZShjb25maWdBcmcpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBsb2FkVGVzdENvbmZpZyhjb25maWdQYXRoKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KG1haW4oZmFsc2UsIGNvbmZpZywgISF3YXJuaW5ncykpO1xuICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAnYXBwcm92ZScsXG4gICAgICAnQXBwcm92ZXMgdGhlIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicsXG4gICAgICAoYXJncykgPT4gYXJncyxcbiAgICAgIChhcmd2KSA9PiB7XG4gICAgICAgIGNvbnN0IHtjb25maWc6IGNvbmZpZ0FyZywgd2FybmluZ3N9ID0gYXJndjtcbiAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9IGlzQWJzb2x1dGUoY29uZmlnQXJnKSA/IGNvbmZpZ0FyZyA6IHJlc29sdmUoY29uZmlnQXJnKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gbG9hZFRlc3RDb25maWcoY29uZmlnUGF0aCk7XG4gICAgICAgIHByb2Nlc3MuZXhpdChtYWluKHRydWUsIGNvbmZpZywgISF3YXJuaW5ncykpO1xuICAgICAgfSxcbiAgICApO1xufVxuXG4vKipcbiAqIFJ1bnMgdGhlIHRzLWNpcmN1bGFyLWRlcGVuZGVuY2llcyB0b29sLlxuICogQHBhcmFtIGFwcHJvdmUgV2hldGhlciB0aGUgZGV0ZWN0ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHNob3VsZCBiZSBhcHByb3ZlZC5cbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRlc3QuXG4gKiBAcGFyYW0gcHJpbnRXYXJuaW5ncyBXaGV0aGVyIHdhcm5pbmdzIHNob3VsZCBiZSBwcmludGVkIG91dC5cbiAqIEByZXR1cm5zIFN0YXR1cyBjb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihcbiAgYXBwcm92ZTogYm9vbGVhbixcbiAgY29uZmlnOiBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWcsXG4gIHByaW50V2FybmluZ3M6IGJvb2xlYW4sXG4pOiBudW1iZXIge1xuICBjb25zdCB7YmFzZURpciwgZ29sZGVuRmlsZSwgZ2xvYiwgcmVzb2x2ZU1vZHVsZSwgYXBwcm92ZUNvbW1hbmR9ID0gY29uZmlnO1xuICBjb25zdCBhbmFseXplciA9IG5ldyBBbmFseXplcihyZXNvbHZlTW9kdWxlKTtcbiAgY29uc3QgY3ljbGVzOiBSZWZlcmVuY2VDaGFpbltdID0gW107XG4gIGNvbnN0IGNoZWNrZWROb2RlcyA9IG5ldyBXZWFrU2V0PHRzLlNvdXJjZUZpbGU+KCk7XG5cbiAgZ2xvYlN5bmMoZ2xvYiwge2Fic29sdXRlOiB0cnVlLCBpZ25vcmU6IFsnKiovbm9kZV9tb2R1bGVzLyoqJ119KS5mb3JFYWNoKChmaWxlUGF0aCkgPT4ge1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBhbmFseXplci5nZXRTb3VyY2VGaWxlKGZpbGVQYXRoKTtcbiAgICBjeWNsZXMucHVzaCguLi5hbmFseXplci5maW5kQ3ljbGVzKHNvdXJjZUZpbGUsIGNoZWNrZWROb2RlcykpO1xuICB9KTtcblxuICBjb25zdCBhY3R1YWwgPSBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbihjeWNsZXMsIGJhc2VEaXIpO1xuXG4gIGluZm8oZ3JlZW4oYCAgIEN1cnJlbnQgbnVtYmVyIG9mIGN5Y2xlczogJHt5ZWxsb3coY3ljbGVzLmxlbmd0aC50b1N0cmluZygpKX1gKSk7XG5cbiAgaWYgKGFwcHJvdmUpIHtcbiAgICB3cml0ZUZpbGVTeW5jKGdvbGRlbkZpbGUsIEpTT04uc3RyaW5naWZ5KGFjdHVhbCwgbnVsbCwgMikpO1xuICAgIGluZm8oZ3JlZW4oJ+KchSAgVXBkYXRlZCBnb2xkZW4gZmlsZS4nKSk7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoIWV4aXN0c1N5bmMoZ29sZGVuRmlsZSkpIHtcbiAgICBlcnJvcihyZWQoYOKdjCAgQ291bGQgbm90IGZpbmQgZ29sZGVuIGZpbGU6ICR7Z29sZGVuRmlsZX1gKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCB3YXJuaW5nc0NvdW50ID0gYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLnNpemUgKyBhbmFseXplci51bnJlc29sdmVkTW9kdWxlcy5zaXplO1xuXG4gIC8vIEJ5IGRlZmF1bHQsIHdhcm5pbmdzIGZvciB1bnJlc29sdmVkIGZpbGVzIG9yIG1vZHVsZXMgYXJlIG5vdCBwcmludGVkLiBUaGlzIGlzIGJlY2F1c2VcbiAgLy8gaXQncyBjb21tb24gdGhhdCB0aGlyZC1wYXJ0eSBtb2R1bGVzIGFyZSBub3QgcmVzb2x2ZWQvdmlzaXRlZC4gQWxzbyBnZW5lcmF0ZWQgZmlsZXNcbiAgLy8gZnJvbSB0aGUgVmlldyBFbmdpbmUgY29tcGlsZXIgKGkuZS4gZmFjdG9yaWVzLCBzdW1tYXJpZXMpIGNhbm5vdCBiZSByZXNvbHZlZC5cbiAgaWYgKHByaW50V2FybmluZ3MgJiYgd2FybmluZ3NDb3VudCAhPT0gMCkge1xuICAgIGluZm8oeWVsbG93KCfimqAgIFRoZSBmb2xsb3dpbmcgaW1wb3J0cyBjb3VsZCBub3QgYmUgcmVzb2x2ZWQ6JykpO1xuICAgIEFycmF5LmZyb20oYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMpXG4gICAgICAuc29ydCgpXG4gICAgICAuZm9yRWFjaCgoc3BlY2lmaWVyKSA9PiBpbmZvKGAgIOKAoiAke3NwZWNpZmllcn1gKSk7XG4gICAgYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGluZm8oYCAg4oCiICR7Z2V0UmVsYXRpdmVQYXRoKGJhc2VEaXIsIGtleSl9YCk7XG4gICAgICB2YWx1ZS5zb3J0KCkuZm9yRWFjaCgoc3BlY2lmaWVyKSA9PiBpbmZvKGAgICAgICAke3NwZWNpZmllcn1gKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyh5ZWxsb3coYOKaoCAgJHt3YXJuaW5nc0NvdW50fSBpbXBvcnRzIGNvdWxkIG5vdCBiZSByZXNvbHZlZC5gKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgIFBsZWFzZSByZXJ1biB3aXRoIFwiLS13YXJuaW5nc1wiIHRvIGluc3BlY3QgdW5yZXNvbHZlZCBpbXBvcnRzLmApKTtcbiAgfVxuXG4gIGNvbnN0IGV4cGVjdGVkID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoZ29sZGVuRmlsZSwgJ3V0ZjgnKSkgYXMgR29sZGVuO1xuICBjb25zdCB7Zml4ZWRDaXJjdWxhckRlcHMsIG5ld0NpcmN1bGFyRGVwc30gPSBjb21wYXJlR29sZGVucyhhY3R1YWwsIGV4cGVjdGVkKTtcbiAgY29uc3QgaXNNYXRjaGluZyA9IGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCA9PT0gMCAmJiBuZXdDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwO1xuXG4gIGlmIChpc01hdGNoaW5nKSB7XG4gICAgaW5mbyhncmVlbign4pyFICBHb2xkZW4gbWF0Y2hlcyBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBlcnJvcihyZWQoJ+KdjCAgR29sZGVuIGRvZXMgbm90IG1hdGNoIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgaWYgKG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBlcnJvcih5ZWxsb3coYCAgIE5ldyBjaXJjdWxhciBkZXBlbmRlbmNpZXMgd2hpY2ggYXJlIG5vdCBhbGxvd2VkOmApKTtcbiAgICBuZXdDaXJjdWxhckRlcHMuZm9yRWFjaCgoYykgPT4gZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICAgIGVycm9yKCk7XG4gIH1cbiAgaWYgKGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCAhPT0gMCkge1xuICAgIGVycm9yKHllbGxvdyhgICAgRml4ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRoYXQgbmVlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIGdvbGRlbjpgKSk7XG4gICAgZml4ZWRDaXJjdWxhckRlcHMuZm9yRWFjaCgoYykgPT4gZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICAgIGluZm8oXG4gICAgICB5ZWxsb3coXG4gICAgICAgIGBcXG4gICBUb3RhbDogJHtuZXdDaXJjdWxhckRlcHMubGVuZ3RofSBuZXcgY3ljbGUocyksICR7Zml4ZWRDaXJjdWxhckRlcHMubGVuZ3RofSBmaXhlZCBjeWNsZShzKS4gXFxuYCxcbiAgICAgICksXG4gICAgKTtcbiAgICBpZiAoYXBwcm92ZUNvbW1hbmQpIHtcbiAgICAgIGluZm8oeWVsbG93KGAgICBQbGVhc2UgYXBwcm92ZSB0aGUgbmV3IGdvbGRlbiB3aXRoOiAke2FwcHJvdmVDb21tYW5kfWApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5mbyhcbiAgICAgICAgeWVsbG93KFxuICAgICAgICAgIGAgICBQbGVhc2UgdXBkYXRlIHRoZSBnb2xkZW4uIFRoZSBmb2xsb3dpbmcgY29tbWFuZCBjYW4gYmUgYCArXG4gICAgICAgICAgICBgcnVuOiB5YXJuIHRzLWNpcmN1bGFyLWRlcHMgYXBwcm92ZSAke2dldFJlbGF0aXZlUGF0aChwcm9jZXNzLmN3ZCgpLCBnb2xkZW5GaWxlKX0uYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHJldHVybiAxO1xufVxuXG4vKiogR2V0cyB0aGUgc3BlY2lmaWVkIHBhdGggcmVsYXRpdmUgdG8gdGhlIGJhc2UgZGlyZWN0b3J5LiAqL1xuZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoKGJhc2VEaXI6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiBjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNoKHJlbGF0aXZlKGJhc2VEaXIsIHBhdGgpKTtcbn1cblxuLyoqIENvbnZlcnRzIHRoZSBnaXZlbiByZWZlcmVuY2UgY2hhaW4gdG8gaXRzIHN0cmluZyByZXByZXNlbnRhdGlvbi4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGNoYWluOiBSZWZlcmVuY2VDaGFpbjxzdHJpbmc+KSB7XG4gIHJldHVybiBjaGFpbi5qb2luKCcg4oaSICcpO1xufVxuIl19