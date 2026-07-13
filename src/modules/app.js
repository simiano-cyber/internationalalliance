import { dataService } from "../services/dataService.js";
import { renderDirectoryView } from "./directory/directoryView.js";
import { renderAccessView, renderHomeView } from "./home/homeView.js";
import { renderAdminView } from "./admin/adminView.js";
import {
  renderMemberProfileNotFoundView,
  renderMemberProfileView
} from "./profile/memberProfileView.js";

const appRoot = document.querySelector("#app");
let currentView = "home";
let selectedMemberId = null;

function renderStartupError() {
  if (!appRoot) {
    return;
  }

  const errorSection = document.createElement("section");
  errorSection.className = "demo-banner";
  errorSection.setAttribute("role", "alert");

  const title = document.createElement("strong");
  title.textContent = "Não foi possível iniciar o ambiente.";

  const message = document.createElement("span");
  message.textContent =
    "Atualize a página ou verifique a conexão com o banco de dados.";

  errorSection.append(title, message);
  appRoot.replaceChildren(errorSection);
}

function startApp() {
  try {
    if (!appRoot) {
      throw new Error("Elemento raiz da aplicação não encontrado.");
    }

    dataService.initialize().then(() => {
      renderApplication();
    }).catch(error => {
      console.error("Falha ao iniciar os dados.", error);
      renderStartupError();
    });
  } catch (error) {
    console.error("Falha ao iniciar o ambiente.", error);
    renderStartupError();
  }
}

async function renderApplication() {
  try {
    const currentUser = await dataService.getCurrentUser();

    if (!currentUser) {
      const demoUsers = dataService.getDemoUsers();
      appRoot.replaceChildren(
        renderAccessView({
          demoUsers,
          onLogin: handleLogin,
          onLoginEmail: handleLoginEmail,
          onRegister: handleRegister,
          isSupabase: dataService.isSupabaseEnabled()
        })
      );
      return;
    }

    await renderAuthenticatedApplication(currentUser);
  } catch (error) {
    console.error("Erro na renderização da aplicação:", error);
    renderStartupError();
  }
}

async function renderAuthenticatedApplication(currentUser) {
  try {
    const members = await dataService.getMembers();

    // Bloqueia acesso a diretório/perfil para usuários comuns que não estejam verificados
    const isVerified = currentUser.verified === true;
    const isAdmin = currentUser.role === "admin";

    if (!isVerified && !isAdmin) {
      if (currentView === "directory" || currentView === "memberProfile" || currentView === "admin") {
        currentView = "home";
      }
    }

    if (currentView === "admin" && isAdmin) {
      await renderAdmin(currentUser);
      return;
    }

    if (currentView === "memberProfile") {
      await renderMemberProfile(currentUser);
      return;
    }

    if (currentView === "directory") {
      const directoryFilters = dataService.getDirectoryFilters(members);

      appRoot.replaceChildren(
        renderDirectoryView({
          members,
          directoryFilters,
          currentUser,
          onNavigate: handleNavigate,
          onViewProfile: handleOpenMemberProfile,
          onLogout: handleLogout
        })
      );
      return;
    }

    appRoot.replaceChildren(
      renderHomeView({
        members,
        currentUser,
        activeView: currentView,
        onNavigate: handleNavigate,
        onLogout: handleLogout
      })
    );
  } catch (error) {
    console.error("Falha ao carregar a página interna.", error);
    renderStartupError();
  }
}

function focusProfileTitle() {
  appRoot.querySelector("[data-profile-focus]")?.focus();
}

async function renderAdmin(currentUser) {
  try {
    const pendingMembers = await dataService.getPendingMembers();
    appRoot.replaceChildren(
      renderAdminView({
        pendingMembers,
        onApprove: handleApproveMember,
        onNavigate: handleNavigate,
        onLogout: handleLogout,
        currentUser
      })
    );
  } catch (error) {
    console.error("Erro ao renderizar painel de administração:", error);
  }
}

async function handleApproveMember(memberId) {
  try {
    await dataService.approveMember(memberId);
    const currentUser = await dataService.getCurrentUser();
    await renderAuthenticatedApplication(currentUser);
  } catch (error) {
    console.error("Erro ao aprovar membro:", error);
  }
}

async function renderMemberProfile(currentUser) {
  const member = await dataService.getMemberById(selectedMemberId);
  const profileOptions = {
    onBackToDirectory: handleBackToDirectory,
    onHome: handleNavigateHome,
    onLogout: handleLogout
  };

  if (!member) {
    appRoot.replaceChildren(renderMemberProfileNotFoundView(profileOptions));
    focusProfileTitle();
    return;
  }

  appRoot.replaceChildren(
    renderMemberProfileView({
      member,
      isOwnProfile: currentUser.id === member.id,
      ...profileOptions
    })
  );
  focusProfileTitle();
}

async function handleLogin(userId) {
  const user = await dataService.loginDemo(userId);

  if (!user) {
    return false;
  }

  currentView = "home";
  selectedMemberId = null;
  await renderAuthenticatedApplication(user);
  return true;
}

async function handleLoginEmail(email, password) {
  try {
    const user = await dataService.login(email, password);
    if (!user) {
      return { success: false, error: "E-mail ou senha incorretos." };
    }
    currentView = "home";
    selectedMemberId = null;
    await renderAuthenticatedApplication(user);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Falha na autenticação." };
  }
}

async function handleRegister(email, password, profileData) {
  try {
    await dataService.signUp(email, password, profileData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Falha no cadastro." };
  }
}

async function handleLogout() {
  currentView = "home";
  selectedMemberId = null;
  await dataService.logout();
  await renderApplication();
}

async function handleNavigate(nextView) {
  currentView = nextView === "directory" ? "directory" : nextView === "admin" ? "admin" : "home";
  selectedMemberId = null;
  await renderApplication();
}

async function handleNavigateHome() {
  currentView = "home";
  selectedMemberId = null;
  await renderApplication();
}

async function handleBackToDirectory() {
  currentView = "directory";
  selectedMemberId = null;
  await renderApplication();
}

async function handleOpenMemberProfile(memberId) {
  selectedMemberId = memberId;
  currentView = "memberProfile";
  await renderApplication();
}

startApp();
