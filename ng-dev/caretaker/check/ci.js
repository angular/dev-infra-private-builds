"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CiModule = void 0;
const node_fetch_1 = require("node-fetch");
const index_1 = require("../../release/versioning/index");
const console_1 = require("../../utils/console");
const base_1 = require("./base");
class CiModule extends base_1.BaseModule {
    async retrieveData() {
        const nextBranchName = (0, index_1.getNextBranchName)(this.config.github);
        const repo = {
            api: this.git.github,
            ...this.git.remoteConfig,
            nextBranchName,
        };
        const releaseTrains = await (0, index_1.fetchActiveReleaseTrains)(repo);
        const ciResultPromises = Object.entries(releaseTrains).map(async ([trainName, train]) => {
            if (train === null) {
                return {
                    active: false,
                    name: trainName,
                    label: '',
                    status: 'not found',
                };
            }
            return {
                active: true,
                name: train.branchName,
                label: `${trainName} (${train.branchName})`,
                status: await this.getBranchStatusFromCi(train.branchName),
            };
        });
        return await Promise.all(ciResultPromises);
    }
    async printToTerminal() {
        const data = await this.data;
        const minLabelLength = Math.max(...data.map((result) => result.label.length));
        console_1.info.group((0, console_1.bold)(`CI`));
        data.forEach((result) => {
            if (result.active === false) {
                (0, console_1.debug)(`No active release train for ${result.name}`);
                return;
            }
            const label = result.label.padEnd(minLabelLength);
            if (result.status === 'not found') {
                (0, console_1.info)(`${result.name} was not found on CircleCI`);
            }
            else if (result.status === 'success') {
                (0, console_1.info)(`${label} ✅`);
            }
            else {
                (0, console_1.info)(`${label} ❌`);
            }
        });
        console_1.info.groupEnd();
        (0, console_1.info)();
    }
    /** Get the CI status of a given branch from CircleCI. */
    async getBranchStatusFromCi(branch) {
        const { owner, name } = this.git.remoteConfig;
        const url = `https://circleci.com/gh/${owner}/${name}/tree/${branch}.svg?style=shield`;
        const result = await (0, node_fetch_1.default)(url).then((result) => result.text());
        if (result && !result.includes('no builds')) {
            return result.includes('passing') ? 'success' : 'failed';
        }
        return 'not found';
    }
}
exports.CiModule = CiModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL2NpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJDQUErQjtBQUMvQiwwREFLd0M7QUFFeEMsaURBQXNEO0FBQ3RELGlDQUFrQztBQWFsQyxNQUFhLFFBQVMsU0FBUSxpQkFBa0I7SUFDckMsS0FBSyxDQUFDLFlBQVk7UUFDekIsTUFBTSxjQUFjLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELE1BQU0sSUFBSSxHQUF1QjtZQUMvQixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNO1lBQ3BCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO1lBQ3hCLGNBQWM7U0FDZixDQUFDO1FBQ0YsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFBLGdDQUF3QixFQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQ3hELEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQWdDLEVBQUUsRUFBRTtZQUMxRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLE9BQU87b0JBQ0wsTUFBTSxFQUFFLEtBQUs7b0JBQ2IsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsS0FBSyxFQUFFLEVBQUU7b0JBQ1QsTUFBTSxFQUFFLFdBQW9CO2lCQUM3QixDQUFDO2FBQ0g7WUFFRCxPQUFPO2dCQUNMLE1BQU0sRUFBRSxJQUFJO2dCQUNaLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVTtnQkFDdEIsS0FBSyxFQUFFLEdBQUcsU0FBUyxLQUFLLEtBQUssQ0FBQyxVQUFVLEdBQUc7Z0JBQzNDLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO2FBQzNELENBQUM7UUFDSixDQUFDLENBQ0YsQ0FBQztRQUVGLE9BQU8sTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVRLEtBQUssQ0FBQyxlQUFlO1FBQzVCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQztRQUM3QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzlFLGNBQUksQ0FBQyxLQUFLLENBQUMsSUFBQSxjQUFJLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDdEIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtnQkFDM0IsSUFBQSxlQUFLLEVBQUMsK0JBQStCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxPQUFPO2FBQ1I7WUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNsRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFO2dCQUNqQyxJQUFBLGNBQUksRUFBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLDRCQUE0QixDQUFDLENBQUM7YUFDbEQ7aUJBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDdEMsSUFBQSxjQUFJLEVBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDO2FBQ3BCO2lCQUFNO2dCQUNMLElBQUEsY0FBSSxFQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQzthQUNwQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQUEsY0FBSSxHQUFFLENBQUM7SUFDVCxDQUFDO0lBRUQseURBQXlEO0lBQ2pELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxNQUFjO1FBQ2hELE1BQU0sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7UUFDNUMsTUFBTSxHQUFHLEdBQUcsMkJBQTJCLEtBQUssSUFBSSxJQUFJLFNBQVMsTUFBTSxtQkFBbUIsQ0FBQztRQUN2RixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsb0JBQUssRUFBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWhFLElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMzQyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztDQUNGO0FBbEVELDRCQWtFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5pbXBvcnQge1xuICBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMsXG4gIGdldE5leHRCcmFuY2hOYW1lLFxuICBSZWxlYXNlUmVwb1dpdGhBcGksXG4gIFJlbGVhc2VUcmFpbixcbn0gZnJvbSAnLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nL2luZGV4JztcblxuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0Jhc2VNb2R1bGV9IGZyb20gJy4vYmFzZSc7XG5cbi8qKiBUaGUgcmVzdWx0IG9mIGNoZWNraW5nIGEgYnJhbmNoIG9uIENJLiAqL1xudHlwZSBDaUJyYW5jaFN0YXR1cyA9ICdzdWNjZXNzJyB8ICdmYWlsZWQnIHwgJ25vdCBmb3VuZCc7XG5cbi8qKiBBIGxpc3Qgb2YgcmVzdWx0cyBmb3IgY2hlY2tpbmcgQ0kgYnJhbmNoZXMuICovXG50eXBlIENpRGF0YSA9IHtcbiAgYWN0aXZlOiBib29sZWFuO1xuICBuYW1lOiBzdHJpbmc7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHN0YXR1czogQ2lCcmFuY2hTdGF0dXM7XG59W107XG5cbmV4cG9ydCBjbGFzcyBDaU1vZHVsZSBleHRlbmRzIEJhc2VNb2R1bGU8Q2lEYXRhPiB7XG4gIG92ZXJyaWRlIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICBjb25zdCBuZXh0QnJhbmNoTmFtZSA9IGdldE5leHRCcmFuY2hOYW1lKHRoaXMuY29uZmlnLmdpdGh1Yik7XG4gICAgY29uc3QgcmVwbzogUmVsZWFzZVJlcG9XaXRoQXBpID0ge1xuICAgICAgYXBpOiB0aGlzLmdpdC5naXRodWIsXG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICBuZXh0QnJhbmNoTmFtZSxcbiAgICB9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgICBjb25zdCBjaVJlc3VsdFByb21pc2VzID0gT2JqZWN0LmVudHJpZXMocmVsZWFzZVRyYWlucykubWFwKFxuICAgICAgYXN5bmMgKFt0cmFpbk5hbWUsIHRyYWluXTogW3N0cmluZywgUmVsZWFzZVRyYWluIHwgbnVsbF0pID0+IHtcbiAgICAgICAgaWYgKHRyYWluID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICBuYW1lOiB0cmFpbk5hbWUsXG4gICAgICAgICAgICBsYWJlbDogJycsXG4gICAgICAgICAgICBzdGF0dXM6ICdub3QgZm91bmQnIGFzIGNvbnN0LFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICBuYW1lOiB0cmFpbi5icmFuY2hOYW1lLFxuICAgICAgICAgIGxhYmVsOiBgJHt0cmFpbk5hbWV9ICgke3RyYWluLmJyYW5jaE5hbWV9KWAsXG4gICAgICAgICAgc3RhdHVzOiBhd2FpdCB0aGlzLmdldEJyYW5jaFN0YXR1c0Zyb21DaSh0cmFpbi5icmFuY2hOYW1lKSxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChjaVJlc3VsdFByb21pc2VzKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHByaW50VG9UZXJtaW5hbCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5kYXRhO1xuICAgIGNvbnN0IG1pbkxhYmVsTGVuZ3RoID0gTWF0aC5tYXgoLi4uZGF0YS5tYXAoKHJlc3VsdCkgPT4gcmVzdWx0LmxhYmVsLmxlbmd0aCkpO1xuICAgIGluZm8uZ3JvdXAoYm9sZChgQ0lgKSk7XG4gICAgZGF0YS5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgIGlmIChyZXN1bHQuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICBkZWJ1ZyhgTm8gYWN0aXZlIHJlbGVhc2UgdHJhaW4gZm9yICR7cmVzdWx0Lm5hbWV9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxhYmVsID0gcmVzdWx0LmxhYmVsLnBhZEVuZChtaW5MYWJlbExlbmd0aCk7XG4gICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ25vdCBmb3VuZCcpIHtcbiAgICAgICAgaW5mbyhgJHtyZXN1bHQubmFtZX0gd2FzIG5vdCBmb3VuZCBvbiBDaXJjbGVDSWApO1xuICAgICAgfSBlbHNlIGlmIChyZXN1bHQuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgaW5mbyhgJHtsYWJlbH0g4pyFYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmZvKGAke2xhYmVsfSDinYxgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgQ0kgc3RhdHVzIG9mIGEgZ2l2ZW4gYnJhbmNoIGZyb20gQ2lyY2xlQ0kuICovXG4gIHByaXZhdGUgYXN5bmMgZ2V0QnJhbmNoU3RhdHVzRnJvbUNpKGJyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxDaUJyYW5jaFN0YXR1cz4ge1xuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vY2lyY2xlY2kuY29tL2doLyR7b3duZXJ9LyR7bmFtZX0vdHJlZS8ke2JyYW5jaH0uc3ZnP3N0eWxlPXNoaWVsZGA7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2godXJsKS50aGVuKChyZXN1bHQpID0+IHJlc3VsdC50ZXh0KCkpO1xuXG4gICAgaWYgKHJlc3VsdCAmJiAhcmVzdWx0LmluY2x1ZGVzKCdubyBidWlsZHMnKSkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5pbmNsdWRlcygncGFzc2luZycpID8gJ3N1Y2Nlc3MnIDogJ2ZhaWxlZCc7XG4gICAgfVxuICAgIHJldHVybiAnbm90IGZvdW5kJztcbiAgfVxufVxuIl19