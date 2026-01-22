// lib/config.ts
import { AppConfigModel } from "./AppConfigModel";
import clientConfig from "./client.json";

let config: AppConfigModel | null = null;
let loadingPromise: Promise<AppConfigModel> | null = null;

export async function getAppConfig(): Promise<AppConfigModel> {
  if (config) return config;

  // prevent multiple parallel loads
  if (!loadingPromise) {
    loadingPromise = loadAppConfig();
  }

  config = await loadingPromise;
  return config;
}

async function loadAppConfig(): Promise<AppConfigModel> {
  const hostName =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  const cfg = Object.assign(new AppConfigModel(), clientConfig);
  cfg.hostName = hostName;

  const isLocal =
    hostName.includes("localhost") || hostName.includes("192.168.1");

  if (cfg.runLocalService && isLocal) {
    cfg.webServicesUrl = cfg.localWebServicesUrl;
    cfg.isConsole = true;
  } else {
    cfg.webServicesUrl = cfg.webServicesUrl;
    cfg.isConsole = false;
  }

  return cfg;
}
