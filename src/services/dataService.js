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
  getDemoUsers() {
    return this.getMembers().map((member) => ({
      id: member.id,
      name: member.name,
      initials: member.initials,
      city: member.city,
      country: member.country,
      role: member.role === "admin" ? "admin" : "member"
    }));
  },
  getDirectoryFilters() {
    const members = this.getMembers();
    const countries = [...new Set(members.map((member) => member.country).filter(Boolean))];
    const cities = [...new Set(members.map((member) => member.city).filter(Boolean))];
    const languages = [
      ...new Set(members.flatMap((member) => member.languages ?? []).filter(Boolean))
    ];

    return {
      countries: countries.sort((a, b) => a.localeCompare(b, "pt-BR")),
      cities: cities.sort((a, b) => a.localeCompare(b, "pt-BR")),
      languages: languages.sort((a, b) => a.localeCompare(b, "pt-BR"))
    };
  },
  getCurrentUser() {
    const session = storage.getCurrentUser();

    if (!session || typeof session !== "object" || typeof session.id !== "string") {
      storage.removeCurrentUser();
      return null;
    }

    const currentUser =
      this.getDemoUsers().find((user) => user.id === session.id) ?? null;

    if (!currentUser) {
      storage.removeCurrentUser();
      return null;
    }

    return currentUser;
  },
  loginDemo(userId) {
    if (typeof userId !== "string" || !userId) {
      return null;
    }

    const user = this.getDemoUsers().find((demoUser) => demoUser.id === userId);

    if (!user) {
      return null;
    }

    storage.setCurrentUser({ id: user.id });
    return user;
  },
  logout() {
    storage.removeCurrentUser();
  },
  isAuthenticated() {
    return Boolean(this.getCurrentUser());
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
