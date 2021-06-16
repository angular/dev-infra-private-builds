/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import fetch from 'node-fetch';
import { fetchActiveReleaseTrains } from '../../release/versioning/index';
import { bold, debug, info } from '../../utils/console';
import { BaseModule } from './base';
export class CiModule extends BaseModule {
    retrieveData() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitRepoWithApi = Object.assign({ api: this.git.github }, this.git.remoteConfig);
            const releaseTrains = yield fetchActiveReleaseTrains(gitRepoWithApi);
            const ciResultPromises = Object.entries(releaseTrains).map(([trainName, train]) => __awaiter(this, void 0, void 0, function* () {
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
                    status: yield this.getBranchStatusFromCi(train.branchName),
                };
            }));
            return yield Promise.all(ciResultPromises);
        });
    }
    printToTerminal() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.data;
            const minLabelLength = Math.max(...data.map(result => result.label.length));
            info.group(bold(`CI`));
            data.forEach(result => {
                if (result.active === false) {
                    debug(`No active release train for ${result.name}`);
                    return;
                }
                const label = result.label.padEnd(minLabelLength);
                if (result.status === 'not found') {
                    info(`${result.name} was not found on CircleCI`);
                }
                else if (result.status === 'success') {
                    info(`${label} ✅`);
                }
                else {
                    info(`${label} ❌`);
                }
            });
            info.groupEnd();
            info();
        });
    }
    /** Get the CI status of a given branch from CircleCI. */
    getBranchStatusFromCi(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, name } = this.git.remoteConfig;
            const url = `https://circleci.com/gh/${owner}/${name}/tree/${branch}.svg?style=shield`;
            const result = yield fetch(url).then(result => result.text());
            if (result && !result.includes('no builds')) {
                return result.includes('passing') ? 'success' : 'failed';
            }
            return 'not found';
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssTUFBTSxZQUFZLENBQUM7QUFDL0IsT0FBTyxFQUFDLHdCQUF3QixFQUFlLE1BQU0sZ0NBQWdDLENBQUM7QUFFdEYsT0FBTyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQWNsQyxNQUFNLE9BQU8sUUFBUyxTQUFRLFVBQWtCO0lBQ3hDLFlBQVk7O1lBQ2hCLE1BQU0sY0FBYyxtQkFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN4RSxNQUFNLGFBQWEsR0FBRyxNQUFNLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRXJFLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBRXZCLEVBQUUsRUFBRTtnQkFDOUQsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO29CQUNsQixPQUFPO3dCQUNMLE1BQU0sRUFBRSxLQUFLO3dCQUNiLElBQUksRUFBRSxTQUFTO3dCQUNmLEtBQUssRUFBRSxFQUFFO3dCQUNULE1BQU0sRUFBRSxXQUFvQjtxQkFDN0IsQ0FBQztpQkFDSDtnQkFFRCxPQUFPO29CQUNMLE1BQU0sRUFBRSxJQUFJO29CQUNaLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVTtvQkFDdEIsS0FBSyxFQUFFLEdBQUcsU0FBUyxLQUFLLEtBQUssQ0FBQyxVQUFVLEdBQUc7b0JBQzNDLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO2lCQUMzRCxDQUFDO1lBQ0osQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUFBO0lBRUssZUFBZTs7WUFDbkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzdCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDcEIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtvQkFDM0IsS0FBSyxDQUFDLCtCQUErQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDcEQsT0FBTztpQkFDUjtnQkFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtvQkFDakMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksNEJBQTRCLENBQUMsQ0FBQztpQkFDbEQ7cUJBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDdEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQztpQkFDcEI7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQztpQkFDcEI7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixJQUFJLEVBQUUsQ0FBQztRQUNULENBQUM7S0FBQTtJQUVELHlEQUF5RDtJQUMzQyxxQkFBcUIsQ0FBQyxNQUFjOztZQUNoRCxNQUFNLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1lBQzVDLE1BQU0sR0FBRyxHQUFHLDJCQUEyQixLQUFLLElBQUksSUFBSSxTQUFTLE1BQU0sbUJBQW1CLENBQUM7WUFDdkYsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFOUQsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUMzQyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO2FBQzFEO1lBQ0QsT0FBTyxXQUFXLENBQUM7UUFDckIsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuaW1wb3J0IHtmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMsIFJlbGVhc2VUcmFpbn0gZnJvbSAnLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nL2luZGV4JztcblxuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0Jhc2VNb2R1bGV9IGZyb20gJy4vYmFzZSc7XG5cblxuLyoqIFRoZSByZXN1bHQgb2YgY2hlY2tpbmcgYSBicmFuY2ggb24gQ0kuICovXG50eXBlIENpQnJhbmNoU3RhdHVzID0gJ3N1Y2Nlc3MnfCdmYWlsZWQnfCdub3QgZm91bmQnO1xuXG4vKiogQSBsaXN0IG9mIHJlc3VsdHMgZm9yIGNoZWNraW5nIENJIGJyYW5jaGVzLiAqL1xudHlwZSBDaURhdGEgPSB7XG4gIGFjdGl2ZTogYm9vbGVhbixcbiAgbmFtZTogc3RyaW5nLFxuICBsYWJlbDogc3RyaW5nLFxuICBzdGF0dXM6IENpQnJhbmNoU3RhdHVzLFxufVtdO1xuXG5leHBvcnQgY2xhc3MgQ2lNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPENpRGF0YT4ge1xuICBhc3luYyByZXRyaWV2ZURhdGEoKSB7XG4gICAgY29uc3QgZ2l0UmVwb1dpdGhBcGkgPSB7YXBpOiB0aGlzLmdpdC5naXRodWIsIC4uLnRoaXMuZ2l0LnJlbW90ZUNvbmZpZ307XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhnaXRSZXBvV2l0aEFwaSk7XG5cbiAgICBjb25zdCBjaVJlc3VsdFByb21pc2VzID0gT2JqZWN0LmVudHJpZXMocmVsZWFzZVRyYWlucykubWFwKGFzeW5jIChbdHJhaW5OYW1lLCB0cmFpbl06IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nLCBSZWxlYXNlVHJhaW58bnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgPT4ge1xuICAgICAgaWYgKHRyYWluID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICBuYW1lOiB0cmFpbk5hbWUsXG4gICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgIHN0YXR1czogJ25vdCBmb3VuZCcgYXMgY29uc3QsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgbmFtZTogdHJhaW4uYnJhbmNoTmFtZSxcbiAgICAgICAgbGFiZWw6IGAke3RyYWluTmFtZX0gKCR7dHJhaW4uYnJhbmNoTmFtZX0pYCxcbiAgICAgICAgc3RhdHVzOiBhd2FpdCB0aGlzLmdldEJyYW5jaFN0YXR1c0Zyb21DaSh0cmFpbi5icmFuY2hOYW1lKSxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoY2lSZXN1bHRQcm9taXNlcyk7XG4gIH1cblxuICBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZGF0YTtcbiAgICBjb25zdCBtaW5MYWJlbExlbmd0aCA9IE1hdGgubWF4KC4uLmRhdGEubWFwKHJlc3VsdCA9PiByZXN1bHQubGFiZWwubGVuZ3RoKSk7XG4gICAgaW5mby5ncm91cChib2xkKGBDSWApKTtcbiAgICBkYXRhLmZvckVhY2gocmVzdWx0ID0+IHtcbiAgICAgIGlmIChyZXN1bHQuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICBkZWJ1ZyhgTm8gYWN0aXZlIHJlbGVhc2UgdHJhaW4gZm9yICR7cmVzdWx0Lm5hbWV9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxhYmVsID0gcmVzdWx0LmxhYmVsLnBhZEVuZChtaW5MYWJlbExlbmd0aCk7XG4gICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ25vdCBmb3VuZCcpIHtcbiAgICAgICAgaW5mbyhgJHtyZXN1bHQubmFtZX0gd2FzIG5vdCBmb3VuZCBvbiBDaXJjbGVDSWApO1xuICAgICAgfSBlbHNlIGlmIChyZXN1bHQuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgaW5mbyhgJHtsYWJlbH0g4pyFYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmZvKGAke2xhYmVsfSDinYxgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgQ0kgc3RhdHVzIG9mIGEgZ2l2ZW4gYnJhbmNoIGZyb20gQ2lyY2xlQ0kuICovXG4gIHByaXZhdGUgYXN5bmMgZ2V0QnJhbmNoU3RhdHVzRnJvbUNpKGJyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxDaUJyYW5jaFN0YXR1cz4ge1xuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vY2lyY2xlY2kuY29tL2doLyR7b3duZXJ9LyR7bmFtZX0vdHJlZS8ke2JyYW5jaH0uc3ZnP3N0eWxlPXNoaWVsZGA7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2godXJsKS50aGVuKHJlc3VsdCA9PiByZXN1bHQudGV4dCgpKTtcblxuICAgIGlmIChyZXN1bHQgJiYgIXJlc3VsdC5pbmNsdWRlcygnbm8gYnVpbGRzJykpIHtcbiAgICAgIHJldHVybiByZXN1bHQuaW5jbHVkZXMoJ3Bhc3NpbmcnKSA/ICdzdWNjZXNzJyA6ICdmYWlsZWQnO1xuICAgIH1cbiAgICByZXR1cm4gJ25vdCBmb3VuZCc7XG4gIH1cbn1cbiJdfQ==