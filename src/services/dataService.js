import { APP_CONFIG } from "../config/appConfig.js";
import { seedData } from "../data/seedData.js";
import { createLocalStorageAdapter } from "./localStorageAdapter.js";
import { supabaseService } from "./supabaseService.js";

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
  isSupabaseEnabled() {
    return supabaseService.isConfigured();
  },

  async initialize() {
    if (!this.isSupabaseEnabled()) {
      if (shouldSeedDemoData()) {
        storage.setDemoData(cloneData(seedData));
        storage.setDataSchemaVersion(APP_CONFIG.dataSchemaVersion);
      }
      return storage.getDemoData();
    }
    // Supabase é inicializado automaticamente pelo import,
    // apenas retornamos o perfil do usuário logado se houver.
    return this.getCurrentUser();
  },

  async getMembers() {
    if (this.isSupabaseEnabled()) {
      return supabaseService.getMembers();
    }
    const data = storage.getDemoData();
    return data?.members ?? [];
  },

  async getMemberById(id) {
    if (typeof id !== "string" || id.trim() === "") {
      return null;
    }

    if (this.isSupabaseEnabled()) {
      return supabaseService.getMemberById(id);
    }
    return (await this.getMembers()).find((member) => member.id === id) ?? null;
  },

  getDemoUsers() {
    // Retorna os usuários mockados apenas na ausência do Supabase
    if (this.isSupabaseEnabled()) {
      return [];
    }
    
    const data = storage.getDemoData()?.members ?? [];
    return data.map((member) => ({
      id: member.id,
      name: member.name,
      initials: member.initials,
      city: member.city,
      country: member.country,
      role: member.role === "admin" ? "admin" : "member"
    }));
  },

  getDirectoryFilters(membersList) {
    const members = Array.isArray(membersList) ? membersList : [];
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

  async getCurrentUser() {
    if (this.isSupabaseEnabled()) {
      return supabaseService.getCurrentUser();
    }

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

    // Carrega o perfil completo do usuário simulado para consistência de dados
    const fullProfile = (await this.getMembers()).find((m) => m.id === currentUser.id);
    return fullProfile ?? currentUser;
  },

  async loginDemo(userId) {
    if (this.isSupabaseEnabled()) {
      return null;
    }

    if (typeof userId !== "string" || !userId) {
      return null;
    }

    const user = this.getDemoUsers().find((demoUser) => demoUser.id === userId);

    if (!user) {
      return null;
    }

    storage.setCurrentUser({ id: user.id });
    return this.getCurrentUser();
  },

  async login(email, password) {
    if (this.isSupabaseEnabled()) {
      return supabaseService.signIn(email, password);
    }
    return null;
  },

  async signUp(email, password, profileData) {
    if (this.isSupabaseEnabled()) {
      return supabaseService.signUp(email, password, profileData);
    }
    return null;
  },

  async logout() {
    if (this.isSupabaseEnabled()) {
      await supabaseService.signOut();
    } else {
      storage.removeCurrentUser();
    }
  },

  async getPendingMembers() {
    if (this.isSupabaseEnabled()) {
      return supabaseService.getPendingMembers();
    }
    // No modo simulado, retorna os membros verificados = false
    const members = await this.getMembers();
    return members.filter((m) => !m.verified);
  },

  async approveMember(memberId) {
    if (this.isSupabaseEnabled()) {
      await supabaseService.approveMember(memberId);
      return;
    }

    // No modo simulado, atualiza localmente no localStorage
    const data = storage.getDemoData();
    if (data && data.members) {
      const member = data.members.find((m) => m.id === memberId);
      if (member) {
        member.verified = true;
        storage.setDemoData(data);
      }
    }
  },

  async resetDemoData() {
    if (this.isSupabaseEnabled()) return null;
    storage.setDemoData(cloneData(seedData));
    storage.setDataSchemaVersion(APP_CONFIG.dataSchemaVersion);
    return storage.getDemoData();
  }
};
