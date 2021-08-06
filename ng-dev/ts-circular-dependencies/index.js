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
        const configPath = path_1.isAbsolute(configArg) ? configArg : path_1.resolve(configArg);
        const config = config_1.loadTestConfig(configPath);
        process.exit(main(false, config, !!warnings));
    })
        .command('approve', 'Approves the current circular dependencies.', (args) => args, (argv) => {
        const { config: configArg, warnings } = argv;
        const configPath = path_1.isAbsolute(configArg) ? configArg : path_1.resolve(configArg);
        const config = config_1.loadTestConfig(configPath);
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
    glob_1.sync(glob, { absolute: true, ignore: ['**/node_modules/**'] }).forEach((filePath) => {
        const sourceFile = analyzer.getSourceFile(filePath);
        cycles.push(...analyzer.findCycles(sourceFile, checkedNodes));
    });
    const actual = golden_1.convertReferenceChainToGolden(cycles, baseDir);
    console_1.info(console_1.green(`   Current number of cycles: ${console_1.yellow(cycles.length.toString())}`));
    if (approve) {
        fs_1.writeFileSync(goldenFile, JSON.stringify(actual, null, 2));
        console_1.info(console_1.green('✅  Updated golden file.'));
        return 0;
    }
    else if (!fs_1.existsSync(goldenFile)) {
        console_1.error(console_1.red(`❌  Could not find golden file: ${goldenFile}`));
        return 1;
    }
    const warningsCount = analyzer.unresolvedFiles.size + analyzer.unresolvedModules.size;
    // By default, warnings for unresolved files or modules are not printed. This is because
    // it's common that third-party modules are not resolved/visited. Also generated files
    // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
    if (printWarnings && warningsCount !== 0) {
        console_1.info(console_1.yellow('⚠  The following imports could not be resolved:'));
        Array.from(analyzer.unresolvedModules)
            .sort()
            .forEach((specifier) => console_1.info(`  • ${specifier}`));
        analyzer.unresolvedFiles.forEach((value, key) => {
            console_1.info(`  • ${getRelativePath(baseDir, key)}`);
            value.sort().forEach((specifier) => console_1.info(`      ${specifier}`));
        });
    }
    else {
        console_1.info(console_1.yellow(`⚠  ${warningsCount} imports could not be resolved.`));
        console_1.info(console_1.yellow(`   Please rerun with "--warnings" to inspect unresolved imports.`));
    }
    const expected = JSON.parse(fs_1.readFileSync(goldenFile, 'utf8'));
    const { fixedCircularDeps, newCircularDeps } = golden_1.compareGoldens(actual, expected);
    const isMatching = fixedCircularDeps.length === 0 && newCircularDeps.length === 0;
    if (isMatching) {
        console_1.info(console_1.green('✅  Golden matches current circular dependencies.'));
        return 0;
    }
    console_1.error(console_1.red('❌  Golden does not match current circular dependencies.'));
    if (newCircularDeps.length !== 0) {
        console_1.error(console_1.yellow(`   New circular dependencies which are not allowed:`));
        newCircularDeps.forEach((c) => console_1.error(`     • ${convertReferenceChainToString(c)}`));
        console_1.error();
    }
    if (fixedCircularDeps.length !== 0) {
        console_1.error(console_1.yellow(`   Fixed circular dependencies that need to be removed from the golden:`));
        fixedCircularDeps.forEach((c) => console_1.error(`     • ${convertReferenceChainToString(c)}`));
        console_1.info(console_1.yellow(`\n   Total: ${newCircularDeps.length} new cycle(s), ${fixedCircularDeps.length} fixed cycle(s). \n`));
        if (approveCommand) {
            console_1.info(console_1.yellow(`   Please approve the new golden with: ${approveCommand}`));
        }
        else {
            console_1.info(console_1.yellow(`   Please update the golden. The following command can be ` +
                `run: yarn ts-circular-deps approve ${getRelativePath(process.cwd(), goldenFile)}.`));
        }
    }
    return 1;
}
exports.main = main;
/** Gets the specified path relative to the base directory. */
function getRelativePath(baseDir, path) {
    return file_system_1.convertPathToForwardSlash(path_1.relative(baseDir, path));
}
/** Converts the given reference chain to its string representation. */
function convertReferenceChainToString(chain) {
    return chain.join(' → ');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUEyRDtBQUMzRCwrQkFBc0M7QUFDdEMsK0JBQW1EO0FBSW5ELDhDQUFpRTtBQUVqRSx5Q0FBb0Q7QUFDcEQscUNBQXdFO0FBQ3hFLCtDQUF3RDtBQUN4RCxxQ0FBK0U7QUFFL0UsU0FBZ0IsNkJBQTZCLENBQUMsVUFBc0I7SUFDbEUsT0FBTyxVQUFVO1NBQ2QsSUFBSSxFQUFFO1NBQ04sTUFBTSxFQUFFO1NBQ1IsYUFBYSxFQUFFO1NBQ2YsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUNoQixJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFdBQVcsRUFBRSxpQ0FBaUM7S0FDL0MsQ0FBQztTQUNELE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBQyxDQUFDO1NBQzFFLE9BQU8sQ0FDTixPQUFPLEVBQ1AsbURBQW1ELEVBQ25ELENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQ2QsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNQLE1BQU0sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBQyxHQUFHLElBQUksQ0FBQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxpQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRSxNQUFNLE1BQU0sR0FBRyx1QkFBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFB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c291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3N5bmMgYXMgZ2xvYlN5bmN9IGZyb20gJ2dsb2InO1xuaW1wb3J0IHtpc0Fic29sdXRlLCByZWxhdGl2ZSwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZCwgeWVsbG93fSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtBbmFseXplciwgUmVmZXJlbmNlQ2hhaW59IGZyb20gJy4vYW5hbHl6ZXInO1xuaW1wb3J0IHtDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWcsIGxvYWRUZXN0Q29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge2NvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2h9IGZyb20gJy4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtjb21wYXJlR29sZGVucywgY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4sIEdvbGRlbn0gZnJvbSAnLi9nb2xkZW4nO1xuXG5leHBvcnQgZnVuY3Rpb24gdHNDaXJjdWxhckRlcGVuZGVuY2llc0J1aWxkZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJnc1xuICAgIC5oZWxwKClcbiAgICAuc3RyaWN0KClcbiAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgLm9wdGlvbignY29uZmlnJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1BhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS4nLFxuICAgIH0pXG4gICAgLm9wdGlvbignd2FybmluZ3MnLCB7dHlwZTogJ2Jvb2xlYW4nLCBkZXNjcmlwdGlvbjogJ1ByaW50cyBhbGwgd2FybmluZ3MuJ30pXG4gICAgLmNvbW1hbmQoXG4gICAgICAnY2hlY2snLFxuICAgICAgJ0NoZWNrcyBpZiB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGhhdmUgY2hhbmdlZC4nLFxuICAgICAgKGFyZ3MpID0+IGFyZ3MsXG4gICAgICAoYXJndikgPT4ge1xuICAgICAgICBjb25zdCB7Y29uZmlnOiBjb25maWdBcmcsIHdhcm5pbmdzfSA9IGFyZ3Y7XG4gICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBpc0Fic29sdXRlKGNvbmZpZ0FyZykgPyBjb25maWdBcmcgOiByZXNvbHZlKGNvbmZpZ0FyZyk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGxvYWRUZXN0Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgICAgICBwcm9jZXNzLmV4aXQobWFpbihmYWxzZSwgY29uZmlnLCAhIXdhcm5pbmdzKSk7XG4gICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICdhcHByb3ZlJyxcbiAgICAgICdBcHByb3ZlcyB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJyxcbiAgICAgIChhcmdzKSA9PiBhcmdzLFxuICAgICAgKGFyZ3YpID0+IHtcbiAgICAgICAgY29uc3Qge2NvbmZpZzogY29uZmlnQXJnLCB3YXJuaW5nc30gPSBhcmd2O1xuICAgICAgICBjb25zdCBjb25maWdQYXRoID0gaXNBYnNvbHV0ZShjb25maWdBcmcpID8gY29uZmlnQXJnIDogcmVzb2x2ZShjb25maWdBcmcpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBsb2FkVGVzdENvbmZpZyhjb25maWdQYXRoKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KG1haW4odHJ1ZSwgY29uZmlnLCAhIXdhcm5pbmdzKSk7XG4gICAgICB9LFxuICAgICk7XG59XG5cbi8qKlxuICogUnVucyB0aGUgdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzIHRvb2wuXG4gKiBAcGFyYW0gYXBwcm92ZSBXaGV0aGVyIHRoZSBkZXRlY3RlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgc2hvdWxkIGJlIGFwcHJvdmVkLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGVzdC5cbiAqIEBwYXJhbSBwcmludFdhcm5pbmdzIFdoZXRoZXIgd2FybmluZ3Mgc2hvdWxkIGJlIHByaW50ZWQgb3V0LlxuICogQHJldHVybnMgU3RhdHVzIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWluKFxuICBhcHByb3ZlOiBib29sZWFuLFxuICBjb25maWc6IENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZyxcbiAgcHJpbnRXYXJuaW5nczogYm9vbGVhbixcbik6IG51bWJlciB7XG4gIGNvbnN0IHtiYXNlRGlyLCBnb2xkZW5GaWxlLCBnbG9iLCByZXNvbHZlTW9kdWxlLCBhcHByb3ZlQ29tbWFuZH0gPSBjb25maWc7XG4gIGNvbnN0IGFuYWx5emVyID0gbmV3IEFuYWx5emVyKHJlc29sdmVNb2R1bGUpO1xuICBjb25zdCBjeWNsZXM6IFJlZmVyZW5jZUNoYWluW10gPSBbXTtcbiAgY29uc3QgY2hlY2tlZE5vZGVzID0gbmV3IFdlYWtTZXQ8dHMuU291cmNlRmlsZT4oKTtcblxuICBnbG9iU3luYyhnbG9iLCB7YWJzb2x1dGU6IHRydWUsIGlnbm9yZTogWycqKi9ub2RlX21vZHVsZXMvKionXX0pLmZvckVhY2goKGZpbGVQYXRoKSA9PiB7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IGFuYWx5emVyLmdldFNvdXJjZUZpbGUoZmlsZVBhdGgpO1xuICAgIGN5Y2xlcy5wdXNoKC4uLmFuYWx5emVyLmZpbmRDeWNsZXMoc291cmNlRmlsZSwgY2hlY2tlZE5vZGVzKSk7XG4gIH0pO1xuXG4gIGNvbnN0IGFjdHVhbCA9IGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuKGN5Y2xlcywgYmFzZURpcik7XG5cbiAgaW5mbyhncmVlbihgICAgQ3VycmVudCBudW1iZXIgb2YgY3ljbGVzOiAke3llbGxvdyhjeWNsZXMubGVuZ3RoLnRvU3RyaW5nKCkpfWApKTtcblxuICBpZiAoYXBwcm92ZSkge1xuICAgIHdyaXRlRmlsZVN5bmMoZ29sZGVuRmlsZSwgSlNPTi5zdHJpbmdpZnkoYWN0dWFsLCBudWxsLCAyKSk7XG4gICAgaW5mbyhncmVlbign4pyFICBVcGRhdGVkIGdvbGRlbiBmaWxlLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfSBlbHNlIGlmICghZXhpc3RzU3luYyhnb2xkZW5GaWxlKSkge1xuICAgIGVycm9yKHJlZChg4p2MICBDb3VsZCBub3QgZmluZCBnb2xkZW4gZmlsZTogJHtnb2xkZW5GaWxlfWApKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IHdhcm5pbmdzQ291bnQgPSBhbmFseXplci51bnJlc29sdmVkRmlsZXMuc2l6ZSArIGFuYWx5emVyLnVucmVzb2x2ZWRNb2R1bGVzLnNpemU7XG5cbiAgLy8gQnkgZGVmYXVsdCwgd2FybmluZ3MgZm9yIHVucmVzb2x2ZWQgZmlsZXMgb3IgbW9kdWxlcyBhcmUgbm90IHByaW50ZWQuIFRoaXMgaXMgYmVjYXVzZVxuICAvLyBpdCdzIGNvbW1vbiB0aGF0IHRoaXJkLXBhcnR5IG1vZHVsZXMgYXJlIG5vdCByZXNvbHZlZC92aXNpdGVkLiBBbHNvIGdlbmVyYXRlZCBmaWxlc1xuICAvLyBmcm9tIHRoZSBWaWV3IEVuZ2luZSBjb21waWxlciAoaS5lLiBmYWN0b3JpZXMsIHN1bW1hcmllcykgY2Fubm90IGJlIHJlc29sdmVkLlxuICBpZiAocHJpbnRXYXJuaW5ncyAmJiB3YXJuaW5nc0NvdW50ICE9PSAwKSB7XG4gICAgaW5mbyh5ZWxsb3coJ+KaoCAgVGhlIGZvbGxvd2luZyBpbXBvcnRzIGNvdWxkIG5vdCBiZSByZXNvbHZlZDonKSk7XG4gICAgQXJyYXkuZnJvbShhbmFseXplci51bnJlc29sdmVkTW9kdWxlcylcbiAgICAgIC5zb3J0KClcbiAgICAgIC5mb3JFYWNoKChzcGVjaWZpZXIpID0+IGluZm8oYCAg4oCiICR7c3BlY2lmaWVyfWApKTtcbiAgICBhbmFseXplci51bnJlc29sdmVkRmlsZXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgaW5mbyhgICDigKIgJHtnZXRSZWxhdGl2ZVBhdGgoYmFzZURpciwga2V5KX1gKTtcbiAgICAgIHZhbHVlLnNvcnQoKS5mb3JFYWNoKChzcGVjaWZpZXIpID0+IGluZm8oYCAgICAgICR7c3BlY2lmaWVyfWApKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKHllbGxvdyhg4pqgICAke3dhcm5pbmdzQ291bnR9IGltcG9ydHMgY291bGQgbm90IGJlIHJlc29sdmVkLmApKTtcbiAgICBpbmZvKHllbGxvdyhgICAgUGxlYXNlIHJlcnVuIHdpdGggXCItLXdhcm5pbmdzXCIgdG8gaW5zcGVjdCB1bnJlc29sdmVkIGltcG9ydHMuYCkpO1xuICB9XG5cbiAgY29uc3QgZXhwZWN0ZWQgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhnb2xkZW5GaWxlLCAndXRmOCcpKSBhcyBHb2xkZW47XG4gIGNvbnN0IHtmaXhlZENpcmN1bGFyRGVwcywgbmV3Q2lyY3VsYXJEZXBzfSA9IGNvbXBhcmVHb2xkZW5zKGFjdHVhbCwgZXhwZWN0ZWQpO1xuICBjb25zdCBpc01hdGNoaW5nID0gZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwICYmIG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggPT09IDA7XG5cbiAgaWYgKGlzTWF0Y2hpbmcpIHtcbiAgICBpbmZvKGdyZWVuKCfinIUgIEdvbGRlbiBtYXRjaGVzIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGVycm9yKHJlZCgn4p2MICBHb2xkZW4gZG9lcyBub3QgbWF0Y2ggY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJykpO1xuICBpZiAobmV3Q2lyY3VsYXJEZXBzLmxlbmd0aCAhPT0gMCkge1xuICAgIGVycm9yKHllbGxvdyhgICAgTmV3IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB3aGljaCBhcmUgbm90IGFsbG93ZWQ6YCkpO1xuICAgIG5ld0NpcmN1bGFyRGVwcy5mb3JFYWNoKChjKSA9PiBlcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gICAgZXJyb3IoKTtcbiAgfVxuICBpZiAoZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IoeWVsbG93KGAgICBGaXhlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGhhdCBuZWVkIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgZ29sZGVuOmApKTtcbiAgICBmaXhlZENpcmN1bGFyRGVwcy5mb3JFYWNoKChjKSA9PiBlcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gICAgaW5mbyhcbiAgICAgIHllbGxvdyhcbiAgICAgICAgYFxcbiAgIFRvdGFsOiAke25ld0NpcmN1bGFyRGVwcy5sZW5ndGh9IG5ldyBjeWNsZShzKSwgJHtmaXhlZENpcmN1bGFyRGVwcy5sZW5ndGh9IGZpeGVkIGN5Y2xlKHMpLiBcXG5gLFxuICAgICAgKSxcbiAgICApO1xuICAgIGlmIChhcHByb3ZlQ29tbWFuZCkge1xuICAgICAgaW5mbyh5ZWxsb3coYCAgIFBsZWFzZSBhcHByb3ZlIHRoZSBuZXcgZ29sZGVuIHdpdGg6ICR7YXBwcm92ZUNvbW1hbmR9YCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmZvKFxuICAgICAgICB5ZWxsb3coXG4gICAgICAgICAgYCAgIFBsZWFzZSB1cGRhdGUgdGhlIGdvbGRlbi4gVGhlIGZvbGxvd2luZyBjb21tYW5kIGNhbiBiZSBgICtcbiAgICAgICAgICAgIGBydW46IHlhcm4gdHMtY2lyY3VsYXItZGVwcyBhcHByb3ZlICR7Z2V0UmVsYXRpdmVQYXRoKHByb2Nlc3MuY3dkKCksIGdvbGRlbkZpbGUpfS5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDE7XG59XG5cbi8qKiBHZXRzIHRoZSBzcGVjaWZpZWQgcGF0aCByZWxhdGl2ZSB0byB0aGUgYmFzZSBkaXJlY3RvcnkuICovXG5mdW5jdGlvbiBnZXRSZWxhdGl2ZVBhdGgoYmFzZURpcjogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2gocmVsYXRpdmUoYmFzZURpciwgcGF0aCkpO1xufVxuXG4vKiogQ29udmVydHMgdGhlIGdpdmVuIHJlZmVyZW5jZSBjaGFpbiB0byBpdHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uLiAqL1xuZnVuY3Rpb24gY29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoY2hhaW46IFJlZmVyZW5jZUNoYWluPHN0cmluZz4pIHtcbiAgcmV0dXJuIGNoYWluLmpvaW4oJyDihpIgJyk7XG59XG4iXX0=