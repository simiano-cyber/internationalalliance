export function createLocalStorageAdapter(config) {
  const keys = {
    demoData: `${config.storagePrefix}_demoData`,
    dataSchemaVersion: `${config.storagePrefix}_dataSchemaVersion`,
    currentUser: `${config.storagePrefix}_currentUser`
  };

  function readJson(key) {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  return {
    keys,
    getDemoData() {
      return readJson(keys.demoData);
    },
    setDemoData(data) {
      writeJson(keys.demoData, data);
    },
    getDataSchemaVersion() {
      return Number(localStorage.getItem(keys.dataSchemaVersion));
    },
    setDataSchemaVersion(version) {
      localStorage.setItem(keys.dataSchemaVersion, String(version));
    },
    getCurrentUser() {
      return readJson(keys.currentUser);
    },
    setCurrentUser(user) {
      writeJson(keys.currentUser, user);
    },
    removeCurrentUser() {
      localStorage.removeItem(keys.currentUser);
    }
  };
}
