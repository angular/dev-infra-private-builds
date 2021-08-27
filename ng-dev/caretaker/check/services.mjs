"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesModule = exports.services = void 0;
const node_fetch_1 = require("node-fetch");
const console_1 = require("../../utils/console");
const base_1 = require("./base");
/** List of services Angular relies on. */
exports.services = [
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
class ServicesModule extends base_1.BaseModule {
    async retrieveData() {
        return Promise.all(exports.services.map((service) => this.getStatusFromStandardApi(service)));
    }
    async printToTerminal() {
        const statuses = await this.data;
        const serviceNameMinLength = Math.max(...statuses.map((service) => service.name.length));
        console_1.info.group((0, console_1.bold)('Service Statuses'));
        for (const status of statuses) {
            const name = status.name.padEnd(serviceNameMinLength);
            if (status.status === 'passing') {
                (0, console_1.info)(`${name} ✅`);
            }
            else {
                console_1.info.group(`${name} ❌ (Updated: ${status.lastUpdated.toLocaleString()})`);
                (0, console_1.info)(`  Details: ${status.description}`);
                console_1.info.groupEnd();
            }
        }
        console_1.info.groupEnd();
        (0, console_1.info)();
    }
    /** Retrieve the status information for a service which uses a standard API response. */
    async getStatusFromStandardApi(service) {
        const result = await (0, node_fetch_1.default)(service.url).then((result) => result.json());
        const status = result.status.indicator === 'none' ? 'passing' : 'failing';
        return {
            name: service.name,
            status,
            description: result.status.description,
            lastUpdated: new Date(result.page.updated_at),
        };
    }
}
exports.ServicesModule = ServicesModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJDQUErQjtBQUUvQixpREFBK0M7QUFDL0MsaUNBQWtDO0FBZWxDLDBDQUEwQztBQUM3QixRQUFBLFFBQVEsR0FBb0I7SUFDdkM7UUFDRSxHQUFHLEVBQUUsMkRBQTJEO1FBQ2hFLElBQUksRUFBRSxXQUFXO0tBQ2xCO0lBQ0Q7UUFDRSxHQUFHLEVBQUUsNkNBQTZDO1FBQ2xELElBQUksRUFBRSxLQUFLO0tBQ1o7SUFDRDtRQUNFLEdBQUcsRUFBRSxnREFBZ0Q7UUFDckQsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLEdBQUcsRUFBRSxpREFBaUQ7UUFDdEQsSUFBSSxFQUFFLFFBQVE7S0FDZjtDQUNGLENBQUM7QUFFRixNQUFhLGNBQWUsU0FBUSxpQkFBK0I7SUFDeEQsS0FBSyxDQUFDLFlBQVk7UUFDekIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFUSxLQUFLLENBQUMsZUFBZTtRQUM1QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDakMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLGNBQUksQ0FBQyxLQUFLLENBQUMsSUFBQSxjQUFJLEVBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLEtBQUssTUFBTSxNQUFNLElBQUksUUFBUSxFQUFFO1lBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDdEQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDL0IsSUFBQSxjQUFJLEVBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO2FBQ25CO2lCQUFNO2dCQUNMLGNBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLGdCQUFnQixNQUFNLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDMUUsSUFBQSxjQUFJLEVBQUMsY0FBYyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDekMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2pCO1NBQ0Y7UUFDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsSUFBQSxjQUFJLEdBQUUsQ0FBQztJQUNULENBQUM7SUFFRCx3RkFBd0Y7SUFDeEYsS0FBSyxDQUFDLHdCQUF3QixDQUFDLE9BQXNCO1FBQ25ELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxvQkFBSyxFQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDMUUsT0FBTztZQUNMLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixNQUFNO1lBQ04sV0FBVyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVztZQUN0QyxXQUFXLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDOUMsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQWxDRCx3Q0FrQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuXG5pbXBvcnQge2JvbGQsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtCYXNlTW9kdWxlfSBmcm9tICcuL2Jhc2UnO1xuXG5pbnRlcmZhY2UgU2VydmljZUNvbmZpZyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG59XG5cbi8qKiBUaGUgcmVzdWx0cyBvZiBjaGVja2luZyB0aGUgc3RhdHVzIG9mIGEgc2VydmljZSAqL1xuaW50ZXJmYWNlIFN0YXR1c0NoZWNrUmVzdWx0IHtcbiAgbmFtZTogc3RyaW5nO1xuICBzdGF0dXM6ICdwYXNzaW5nJyB8ICdmYWlsaW5nJztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgbGFzdFVwZGF0ZWQ6IERhdGU7XG59XG5cbi8qKiBMaXN0IG9mIHNlcnZpY2VzIEFuZ3VsYXIgcmVsaWVzIG9uLiAqL1xuZXhwb3J0IGNvbnN0IHNlcnZpY2VzOiBTZXJ2aWNlQ29uZmlnW10gPSBbXG4gIHtcbiAgICB1cmw6ICdodHRwczovL3N0YXR1cy51cy13ZXN0LTEuc2F1Y2VsYWJzLmNvbS9hcGkvdjIvc3RhdHVzLmpzb24nLFxuICAgIG5hbWU6ICdTYXVjZWxhYnMnLFxuICB9LFxuICB7XG4gICAgdXJsOiAnaHR0cHM6Ly9zdGF0dXMubnBtanMub3JnL2FwaS92Mi9zdGF0dXMuanNvbicsXG4gICAgbmFtZTogJ05wbScsXG4gIH0sXG4gIHtcbiAgICB1cmw6ICdodHRwczovL3N0YXR1cy5jaXJjbGVjaS5jb20vYXBpL3YyL3N0YXR1cy5qc29uJyxcbiAgICBuYW1lOiAnQ2lyY2xlQ2knLFxuICB9LFxuICB7XG4gICAgdXJsOiAnaHR0cHM6Ly93d3cuZ2l0aHVic3RhdHVzLmNvbS9hcGkvdjIvc3RhdHVzLmpzb24nLFxuICAgIG5hbWU6ICdHaXRodWInLFxuICB9LFxuXTtcblxuZXhwb3J0IGNsYXNzIFNlcnZpY2VzTW9kdWxlIGV4dGVuZHMgQmFzZU1vZHVsZTxTdGF0dXNDaGVja1Jlc3VsdFtdPiB7XG4gIG92ZXJyaWRlIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoc2VydmljZXMubWFwKChzZXJ2aWNlKSA9PiB0aGlzLmdldFN0YXR1c0Zyb21TdGFuZGFyZEFwaShzZXJ2aWNlKSkpO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcHJpbnRUb1Rlcm1pbmFsKCkge1xuICAgIGNvbnN0IHN0YXR1c2VzID0gYXdhaXQgdGhpcy5kYXRhO1xuICAgIGNvbnN0IHNlcnZpY2VOYW1lTWluTGVuZ3RoID0gTWF0aC5tYXgoLi4uc3RhdHVzZXMubWFwKChzZXJ2aWNlKSA9PiBzZXJ2aWNlLm5hbWUubGVuZ3RoKSk7XG4gICAgaW5mby5ncm91cChib2xkKCdTZXJ2aWNlIFN0YXR1c2VzJykpO1xuICAgIGZvciAoY29uc3Qgc3RhdHVzIG9mIHN0YXR1c2VzKSB7XG4gICAgICBjb25zdCBuYW1lID0gc3RhdHVzLm5hbWUucGFkRW5kKHNlcnZpY2VOYW1lTWluTGVuZ3RoKTtcbiAgICAgIGlmIChzdGF0dXMuc3RhdHVzID09PSAncGFzc2luZycpIHtcbiAgICAgICAgaW5mbyhgJHtuYW1lfSDinIVgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZm8uZ3JvdXAoYCR7bmFtZX0g4p2MIChVcGRhdGVkOiAke3N0YXR1cy5sYXN0VXBkYXRlZC50b0xvY2FsZVN0cmluZygpfSlgKTtcbiAgICAgICAgaW5mbyhgICBEZXRhaWxzOiAke3N0YXR1cy5kZXNjcmlwdGlvbn1gKTtcbiAgICAgICAgaW5mby5ncm91cEVuZCgpO1xuICAgICAgfVxuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSBzdGF0dXMgaW5mb3JtYXRpb24gZm9yIGEgc2VydmljZSB3aGljaCB1c2VzIGEgc3RhbmRhcmQgQVBJIHJlc3BvbnNlLiAqL1xuICBhc3luYyBnZXRTdGF0dXNGcm9tU3RhbmRhcmRBcGkoc2VydmljZTogU2VydmljZUNvbmZpZyk6IFByb21pc2U8U3RhdHVzQ2hlY2tSZXN1bHQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmZXRjaChzZXJ2aWNlLnVybCkudGhlbigocmVzdWx0KSA9PiByZXN1bHQuanNvbigpKTtcbiAgICBjb25zdCBzdGF0dXMgPSByZXN1bHQuc3RhdHVzLmluZGljYXRvciA9PT0gJ25vbmUnID8gJ3Bhc3NpbmcnIDogJ2ZhaWxpbmcnO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBzZXJ2aWNlLm5hbWUsXG4gICAgICBzdGF0dXMsXG4gICAgICBkZXNjcmlwdGlvbjogcmVzdWx0LnN0YXR1cy5kZXNjcmlwdGlvbixcbiAgICAgIGxhc3RVcGRhdGVkOiBuZXcgRGF0ZShyZXN1bHQucGFnZS51cGRhdGVkX2F0KSxcbiAgICB9O1xuICB9XG59XG4iXX0=