/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import fetch from 'node-fetch';
import { bold, info } from '../../utils/console';
import { BaseModule } from './base';
/** List of services Angular relies on. */
export const services = [
    {
        url: 'https://status.us-west-1.saucelabs.com/api/v2/status.json',
        name: 'Saucelabs',
    },
    {
        url: 'https://status.npmjs.org/api/v2/status.json',
        name: 'Npm',
    },
    {
        url: 'https://status.circleci.com/api/v2/status.json',
        name: 'CircleCi',
    },
    {
        url: 'https://www.githubstatus.com/api/v2/status.json',
        name: 'Github',
    },
];
export class ServicesModule extends BaseModule {
    retrieveData() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(services.map(service => this.getStatusFromStandardApi(service)));
        });
    }
    printToTerminal() {
        return __awaiter(this, void 0, void 0, function* () {
            const statuses = yield this.data;
            const serviceNameMinLength = Math.max(...statuses.map(service => service.name.length));
            info.group(bold('Service Statuses'));
            for (const status of statuses) {
                const name = status.name.padEnd(serviceNameMinLength);
                if (status.status === 'passing') {
                    info(`${name} ✅`);
                }
                else {
                    info.group(`${name} ❌ (Updated: ${status.lastUpdated.toLocaleString()})`);
                    info(`  Details: ${status.description}`);
                    info.groupEnd();
                }
            }
            info.groupEnd();
            info();
        });
    }
    /** Retrieve the status information for a service which uses a standard API response. */
    getStatusFromStandardApi(service) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield fetch(service.url).then(result => result.json());
            const status = result.status.indicator === 'none' ? 'passing' : 'failing';
            return {
                name: service.name,
                status,
                description: result.status.description,
                lastUpdated: new Date(result.page.updated_at)
            };
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssTUFBTSxZQUFZLENBQUM7QUFFL0IsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBZWxDLDBDQUEwQztBQUMxQyxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQW9CO0lBQ3ZDO1FBQ0UsR0FBRyxFQUFFLDJEQUEyRDtRQUNoRSxJQUFJLEVBQUUsV0FBVztLQUNsQjtJQUNEO1FBQ0UsR0FBRyxFQUFFLDZDQUE2QztRQUNsRCxJQUFJLEVBQUUsS0FBSztLQUNaO0lBQ0Q7UUFDRSxHQUFHLEVBQUUsZ0RBQWdEO1FBQ3JELElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxHQUFHLEVBQUUsaURBQWlEO1FBQ3RELElBQUksRUFBRSxRQUFRO0tBQ2Y7Q0FDRixDQUFDO0FBRUYsTUFBTSxPQUFPLGNBQWUsU0FBUSxVQUErQjtJQUMzRCxZQUFZOztZQUNoQixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEYsQ0FBQztLQUFBO0lBRUssZUFBZTs7WUFDbkIsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2pDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLEtBQUssTUFBTSxNQUFNLElBQUksUUFBUSxFQUFFO2dCQUM3QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO2lCQUNuQjtxQkFBTTtvQkFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxnQkFBZ0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQzFFLElBQUksQ0FBQyxjQUFjLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ2pCO2FBQ0Y7WUFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEIsSUFBSSxFQUFFLENBQUM7UUFDVCxDQUFDO0tBQUE7SUFFRCx3RkFBd0Y7SUFDbEYsd0JBQXdCLENBQUMsT0FBc0I7O1lBQ25ELE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN0RSxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzFFLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2dCQUNsQixNQUFNO2dCQUNOLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVc7Z0JBQ3RDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQzthQUM5QyxDQUFDO1FBQ0osQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuXG5pbXBvcnQge2JvbGQsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtCYXNlTW9kdWxlfSBmcm9tICcuL2Jhc2UnO1xuXG5pbnRlcmZhY2UgU2VydmljZUNvbmZpZyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG59XG5cbi8qKiBUaGUgcmVzdWx0cyBvZiBjaGVja2luZyB0aGUgc3RhdHVzIG9mIGEgc2VydmljZSAqL1xuaW50ZXJmYWNlIFN0YXR1c0NoZWNrUmVzdWx0IHtcbiAgbmFtZTogc3RyaW5nO1xuICBzdGF0dXM6ICdwYXNzaW5nJ3wnZmFpbGluZyc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGxhc3RVcGRhdGVkOiBEYXRlO1xufVxuXG4vKiogTGlzdCBvZiBzZXJ2aWNlcyBBbmd1bGFyIHJlbGllcyBvbi4gKi9cbmV4cG9ydCBjb25zdCBzZXJ2aWNlczogU2VydmljZUNvbmZpZ1tdID0gW1xuICB7XG4gICAgdXJsOiAnaHR0cHM6Ly9zdGF0dXMudXMtd2VzdC0xLnNhdWNlbGFicy5jb20vYXBpL3YyL3N0YXR1cy5qc29uJyxcbiAgICBuYW1lOiAnU2F1Y2VsYWJzJyxcbiAgfSxcbiAge1xuICAgIHVybDogJ2h0dHBzOi8vc3RhdHVzLm5wbWpzLm9yZy9hcGkvdjIvc3RhdHVzLmpzb24nLFxuICAgIG5hbWU6ICdOcG0nLFxuICB9LFxuICB7XG4gICAgdXJsOiAnaHR0cHM6Ly9zdGF0dXMuY2lyY2xlY2kuY29tL2FwaS92Mi9zdGF0dXMuanNvbicsXG4gICAgbmFtZTogJ0NpcmNsZUNpJyxcbiAgfSxcbiAge1xuICAgIHVybDogJ2h0dHBzOi8vd3d3LmdpdGh1YnN0YXR1cy5jb20vYXBpL3YyL3N0YXR1cy5qc29uJyxcbiAgICBuYW1lOiAnR2l0aHViJyxcbiAgfSxcbl07XG5cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlc01vZHVsZSBleHRlbmRzIEJhc2VNb2R1bGU8U3RhdHVzQ2hlY2tSZXN1bHRbXT4ge1xuICBhc3luYyByZXRyaWV2ZURhdGEoKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHNlcnZpY2VzLm1hcChzZXJ2aWNlID0+IHRoaXMuZ2V0U3RhdHVzRnJvbVN0YW5kYXJkQXBpKHNlcnZpY2UpKSk7XG4gIH1cblxuICBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3Qgc3RhdHVzZXMgPSBhd2FpdCB0aGlzLmRhdGE7XG4gICAgY29uc3Qgc2VydmljZU5hbWVNaW5MZW5ndGggPSBNYXRoLm1heCguLi5zdGF0dXNlcy5tYXAoc2VydmljZSA9PiBzZXJ2aWNlLm5hbWUubGVuZ3RoKSk7XG4gICAgaW5mby5ncm91cChib2xkKCdTZXJ2aWNlIFN0YXR1c2VzJykpO1xuICAgIGZvciAoY29uc3Qgc3RhdHVzIG9mIHN0YXR1c2VzKSB7XG4gICAgICBjb25zdCBuYW1lID0gc3RhdHVzLm5hbWUucGFkRW5kKHNlcnZpY2VOYW1lTWluTGVuZ3RoKTtcbiAgICAgIGlmIChzdGF0dXMuc3RhdHVzID09PSAncGFzc2luZycpIHtcbiAgICAgICAgaW5mbyhgJHtuYW1lfSDinIVgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZm8uZ3JvdXAoYCR7bmFtZX0g4p2MIChVcGRhdGVkOiAke3N0YXR1cy5sYXN0VXBkYXRlZC50b0xvY2FsZVN0cmluZygpfSlgKTtcbiAgICAgICAgaW5mbyhgICBEZXRhaWxzOiAke3N0YXR1cy5kZXNjcmlwdGlvbn1gKTtcbiAgICAgICAgaW5mby5ncm91cEVuZCgpO1xuICAgICAgfVxuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSBzdGF0dXMgaW5mb3JtYXRpb24gZm9yIGEgc2VydmljZSB3aGljaCB1c2VzIGEgc3RhbmRhcmQgQVBJIHJlc3BvbnNlLiAqL1xuICBhc3luYyBnZXRTdGF0dXNGcm9tU3RhbmRhcmRBcGkoc2VydmljZTogU2VydmljZUNvbmZpZyk6IFByb21pc2U8U3RhdHVzQ2hlY2tSZXN1bHQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmZXRjaChzZXJ2aWNlLnVybCkudGhlbihyZXN1bHQgPT4gcmVzdWx0Lmpzb24oKSk7XG4gICAgY29uc3Qgc3RhdHVzID0gcmVzdWx0LnN0YXR1cy5pbmRpY2F0b3IgPT09ICdub25lJyA/ICdwYXNzaW5nJyA6ICdmYWlsaW5nJztcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogc2VydmljZS5uYW1lLFxuICAgICAgc3RhdHVzLFxuICAgICAgZGVzY3JpcHRpb246IHJlc3VsdC5zdGF0dXMuZGVzY3JpcHRpb24sXG4gICAgICBsYXN0VXBkYXRlZDogbmV3IERhdGUocmVzdWx0LnBhZ2UudXBkYXRlZF9hdClcbiAgICB9O1xuICB9XG59XG4iXX0=