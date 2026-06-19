import { dataService } from "../services/dataService.js";
import { renderDirectoryView } from "./directory/directoryView.js";
import { renderAccessView, renderHomeView } from "./home/homeView.js";

const appRoot = document.querySelector("#app");
let currentView = "home";

function renderStartupError() {
  if (!appRoot) {
    return;
  }

  const errorSection = document.createElement("section");
  errorSection.className = "demo-banner";
  errorSection.setAttribute("role", "alert");

  const title = document.createElement("strong");
  title.textContent = "Não foi possível iniciar o ambiente demonstrativo.";

  const message = document.createElement("span");
  message.textContent =
    "Atualize a página ou restaure os dados locais do navegador.";

  errorSection.append(title, message);
  appRoot.replaceChildren(errorSection);
}

function startApp() {
  try {
    if (!appRoot) {
      throw new Error("Elemento raiz da aplicação não encontrado.");
    }

    dataService.initialize();
    renderApplication();
  } catch (error) {
    console.error("Falha ao iniciar o ambiente demonstrativo.", error);
    renderStartupError();
  }
}

function renderApplication() {
  const currentUser = dataService.getCurrentUser();

  if (!currentUser) {
    const demoUsers = dataService.getDemoUsers();
    appRoot.replaceChildren(
      renderAccessView({
        demoUsers,
        onLogin: handleLogin
      })
    );
    return;
  }

  renderAuthenticatedApplication(currentUser);
}

function renderAuthenticatedApplication(currentUser) {
  try {
    const members = dataService.getMembers();

    if (currentView === "directory") {
      const directoryFilters = dataService.getDirectoryFilters();

      appRoot.replaceChildren(
        renderDirectoryView({
          members,
          directoryFilters,
          currentUser,
          onNavigate: handleNavigate,
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
    console.error("Falha ao iniciar o ambiente demonstrativo.", error);
    renderStartupError();
  }
}

function handleLogin(userId) {
  const user = dataService.loginDemo(userId);

  if (!user) {
    return false;
  }

  currentView = "home";
  renderAuthenticatedApplication(user);
  return true;
}

function handleLogout() {
  currentView = "home";
  dataService.logout();
  renderApplication();
}

function handleNavigate(nextView) {
  currentView = nextView === "directory" ? "directory" : "home";
  renderApplication();
}

startApp();
