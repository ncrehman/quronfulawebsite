

// lib/config.ts
import { AppConfigModel } from './AppConfigModel';

let config: AppConfigModel | null = null;
import clientConfig from './client.json';
export async function loadAppConfig(): Promise<AppConfigModel> {
    if (config) return config; // avoid reloading if already set
    const hostName = typeof window !== "undefined" ? window.location.hostname : "localhost";
    config = Object.assign(new AppConfigModel(), clientConfig);

    config.hostName = hostName;
    const isLocal = hostName.includes("localhost") || hostName.includes("192.168.1");
    if (config.runLocalService && isLocal) {
        config.webServicesUrl = config.localWebServicesUrl;
        // config.isConsole = false;
    } else if (!config.runLocalService && isLocal) {
          config.webServicesUrl = config.webServicesUrl;
        // config.isConsole = false;
    } else {
        config.isConsole = false;
    }
    return config;
}

export function getAppConfig(): AppConfigModel | null {
    return config;
}
