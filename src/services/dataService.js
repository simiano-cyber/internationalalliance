import { APP_CONFIG } from "../config/appConfig.js";
import { seedData } from "../data/seedData.js";
import { createLocalStorageAdapter } from "./localStorageAdapter.js";

const storage = createLocalStorageAdapter(APP_CONFIG);

function cloneData(data) {
  return structuredClone(data);
}

function shouldSeedDemoData() {
  const storedData = storage.getDemoData();
  const storedVersion = storage.getDataSchemaVersion();

  return !storedData || storedVersion !== APP_CONFIG.dataSchemaVersion;
}

export const dataService = {
  initialize() {
    if (shouldSeedDemoData()) {
      storage.setDemoData(cloneData(seedData));
      storage.setDataSchemaVersion(APP_CONFIG.dataSchemaVersion);
    }

    return storage.getDemoData();
  },
  getMembers() {
    const data = storage.getDemoData();
    return data?.members ?? [];
  },
  getMemberById(id) {
    return this.getMembers().find((member) => member.id === id) ?? null;
  },
  getCurrentUser() {
    return storage.getCurrentUser();
  },
  getContactRequests() {
    const data = storage.getDemoData();
    return data?.contactRequests ?? [];
  },
  getPendingVerifications() {
    const data = storage.getDemoData();
    return data?.pendingVerifications ?? [];
  },
  resetDemoData() {
    storage.setDemoData(cloneData(seedData));
    storage.setDataSchemaVersion(APP_CONFIG.dataSchemaVersion);
    return storage.getDemoData();
  }
};
