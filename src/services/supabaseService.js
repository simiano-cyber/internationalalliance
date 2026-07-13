import { SUPABASE_CONFIG } from "../config/supabase.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let supabase = null;

if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
  try {
    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (error) {
    console.error("Falha ao inicializar o cliente do Supabase:", error);
  }
} else {
  console.warn(
    "Supabase não configurado em src/config/supabase.js. Preencha os campos para ativar o banco de dados real."
  );
}

export const supabaseService = {
  isConfigured() {
    return supabase !== null;
  },

  async signIn(email, password) {
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return this.getCurrentUser();
  },

  async signUp(email, password, profileData) {
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar usuário.");

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        name: profileData.name,
        initials: profileData.initials,
        phone: profileData.phone,
        country: profileData.country,
        country_code: profileData.countryCode,
        city: profileData.city,
        languages: profileData.languages,
        lodge: profileData.lodge,
        lodge_number: profileData.lodgeNumber,
        obedience: profileData.obedience,
        cim: profileData.cim,
        semestral_phrase: profileData.semestralPhrase,
        degree: profileData.degree || "Mestre Maçom",
        verified: false,
        role: "member",
        bio: profileData.bio || "",
        available_for_contact: profileData.availableForContact ?? true,
        privacy: profileData.privacy || {
          showLodge: true,
          showObedience: true,
          showCity: true
        }
      }
    ]);

    if (profileError) {
      throw profileError;
    }

    return data.user;
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    if (!supabase) return null;
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();
    
    if (sessionError || !session) return null;

    const user = session.user;
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      return null;
    }

    return profile;
  },

  async getMembers() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("verified", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getPendingMembers() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("verified", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async approveMember(memberId) {
    if (!supabase) throw new Error("Supabase não configurado.");
    const { error } = await supabase
      .from("profiles")
      .update({ verified: true })
      .eq("id", memberId);

    if (error) throw error;
  },

  async getMemberById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar membro:", error);
      return null;
    }
    return data;
  }
};
