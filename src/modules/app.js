import { dataService } from "../services/dataService.js";
import { renderHomeView } from "./home/homeView.js";

const appRoot = document.querySelector("#app");

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

    const members = dataService.getMembers();
    appRoot.replaceChildren(renderHomeView({ members }));
  } catch (error) {
    console.error("Falha ao iniciar o ambiente demonstrativo.", error);
    renderStartupError();
  }
}

startApp();
