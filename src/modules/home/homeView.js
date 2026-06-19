import { APP_CONFIG } from "../../config/appConfig.js";
import { formatList } from "../../utils/helpers.js";

function getVerifiedCount(members) {
  return members.filter((member) => member.verified).length;
}

function getRoleLabel(role) {
  return role === "admin" ? "Administrador demonstrativo" : "Membro demonstrativo";
}

function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text == null ? "" : String(text);
  return element;
}

function createDemoUserCard(user, selectedUserId, onSelect) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "demo-user-card";
  button.setAttribute("aria-pressed", user.id === selectedUserId ? "true" : "false");

  if (user.id === selectedUserId) {
    button.classList.add("is-selected");
  }

  const avatar = createTextElement("span", user.initials, "member-avatar");
  avatar.setAttribute("aria-hidden", "true");

  const content = document.createElement("span");
  content.className = "demo-user-content";

  const name = createTextElement("strong", user.name);
  const location = createTextElement("small", `${user.city}, ${user.country}`);
  const role = createTextElement("span", getRoleLabel(user.role), "status-pill");
  role.classList.add(user.role === "admin" ? "is-pending" : "is-verified");

  content.append(name, location, role);
  button.append(avatar, content);

  button.addEventListener("click", () => onSelect(user.id));

  return button;
}

function populateDemoUsers(container, users, selectedUserId, onSelect) {
  const fragment = document.createDocumentFragment();

  users.forEach((user) => {
    fragment.append(createDemoUserCard(user, selectedUserId, onSelect));
  });

  container.replaceChildren(fragment);
}

function renderMemberPreview(member) {
  const statusLabel = member.verified ? "Verificado" : "Pendente";
  const statusClass = member.verified ? "is-verified" : "is-pending";
  const article = document.createElement("article");
  article.className = "member-preview-card";

  const avatar = createTextElement("div", member.initials, "member-avatar");
  avatar.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  const header = document.createElement("div");
  header.className = "member-card-header";

  const name = createTextElement("h3", member.name);
  const status = createTextElement("span", statusLabel, `status-pill ${statusClass}`);

  const location = createTextElement("p", `${member.city}, ${member.country}`);
  const languages = createTextElement(
    "p",
    formatList(Array.isArray(member.languages) ? member.languages : [])
  );

  header.append(name, status);
  content.append(header, location, languages);
  article.append(avatar, content);

  return article;
}

function populateMemberPreviewList(container, members) {
  const fragment = document.createDocumentFragment();

  members.forEach((member) => {
    fragment.append(renderMemberPreview(member));
  });

  container.replaceChildren(fragment);
}

export function renderAccessView({ demoUsers, onLogin }) {
  const safeUsers = Array.isArray(demoUsers) ? demoUsers : [];
  const page = document.createElement("div");
  let selectedUserId = "";

  page.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#acesso" aria-label="International Alliance">
        <span class="brand-mark" aria-hidden="true">IA</span>
        <span>
          <strong>International Alliance</strong>
          <small>MVP demonstrativo</small>
        </span>
      </a>
    </header>

    <main id="acesso">
      <section class="demo-banner" aria-label="Aviso de acesso demonstrativo">
        <strong>Ambiente demonstrativo</strong>
        <span>Acesso demonstrativo — nenhuma autenticação real é realizada.</span>
      </section>

      <section class="access-section" aria-labelledby="access-title">
        <div class="access-copy">
          <span class="eyebrow">Entrada demonstrativa</span>
          <h1 id="access-title">International Alliance</h1>
          <p>
            Escolha um perfil fictício para conhecer o ambiente interno do MVP.
            Não existe senha, cadastro, e-mail ou autenticação de produção.
          </p>
        </div>

        <div class="access-panel" aria-label="Seleção de perfil demonstrativo">
          <div class="access-panel-header">
            <h2>Selecionar perfil</h2>
            <p>Nenhuma senha será solicitada.</p>
          </div>

          <div class="demo-user-list" data-demo-user-list></div>

          <p class="form-message" data-login-message aria-live="polite"></p>
          <button class="button primary access-submit" type="button" data-login-button disabled>
            Entrar no ambiente demonstrativo
          </button>
        </div>
      </section>
    </main>
  `;

  const userList = page.querySelector("[data-demo-user-list]");
  const message = page.querySelector("[data-login-message]");
  const loginButton = page.querySelector("[data-login-button]");

  function selectUser(userId) {
    selectedUserId = userId;
    message.textContent = "";
    loginButton.disabled = false;
    populateDemoUsers(userList, safeUsers, selectedUserId, selectUser);
  }

  loginButton.addEventListener("click", () => {
    if (!selectedUserId) {
      message.textContent = "Selecione um perfil demonstrativo para continuar.";
      return;
    }

    const success = onLogin(selectedUserId);

    if (!success) {
      selectedUserId = "";
      loginButton.disabled = true;
      message.textContent = "Perfil demonstrativo inválido. Selecione outro perfil.";
      populateDemoUsers(userList, safeUsers, selectedUserId, selectUser);
    }
  });

  populateDemoUsers(userList, safeUsers, selectedUserId, selectUser);

  return page;
}

export function renderHomeView({ members, currentUser, onLogout }) {
  const safeMembers = Array.isArray(members) ? members : [];
  const verifiedCount = getVerifiedCount(safeMembers);
  const page = document.createElement("div");

  page.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#inicio" aria-label="International Alliance">
        <span class="brand-mark" aria-hidden="true">IA</span>
        <span>
          <strong>International Alliance</strong>
          <small>MVP demonstrativo</small>
        </span>
      </a>

      <nav class="main-nav" aria-label="Navegação principal">
        <a href="#inicio">Início</a>
        <span class="nav-disabled" aria-disabled="true">Diretório <small>Em breve</small></span>
        <span class="nav-disabled" aria-disabled="true">Admin <small>Em breve</small></span>
      </nav>

      <div class="active-user-panel" aria-label="Usuário ativo">
        <span class="active-user-avatar" data-current-user-initials aria-hidden="true"></span>
        <span>
          <strong data-current-user-name></strong>
          <small data-current-user-role></small>
        </span>
        <button class="logout-button" type="button" data-logout-button>Sair</button>
      </div>
    </header>

    <main id="inicio">
      <section class="demo-banner" aria-label="Aviso de ambiente demonstrativo">
        <strong>Ambiente demonstrativo</strong>
        <span>Dados fictícios, sem uso de informações reais.</span>
      </section>

      <section class="hero-section">
        <div class="hero-copy">
          <span class="eyebrow">Conexão internacional com privacidade</span>
          <h1>International Alliance</h1>
          <p>
            Conexão internacional para aproximar Maçons verificados em
            diferentes países, cidades e idiomas, com uma experiência discreta,
            institucional e preparada para evolução futura.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="#funcionamento">Conhecer o funcionamento</a>
            <a class="button secondary" href="#estrutura">Ver estrutura do MVP</a>
          </div>
        </div>

        <div class="flow-panel" aria-label="Resumo visual do fluxo internacional">
          <div class="flow-node active">
            <span>1</span>
            <strong>Membro verificado</strong>
            <small>Identidade demonstrativa</small>
          </div>
          <div class="flow-line" aria-hidden="true"></div>
          <div class="flow-node">
            <span>2</span>
            <strong>Busca por destino</strong>
            <small>Países, cidades e idiomas</small>
          </div>
          <div class="flow-line" aria-hidden="true"></div>
          <div class="flow-node">
            <span>3</span>
            <strong>Solicitação segura</strong>
            <small>Contato simulado</small>
          </div>
        </div>
      </section>

      <section class="section-grid" id="funcionamento" aria-labelledby="beneficios-title">
        <div class="section-heading">
          <span class="eyebrow">Proposta da Fase 1</span>
          <h2 id="beneficios-title">Base clara para um MVP internacional</h2>
          <p>
            Esta etapa cria a fundação visual e técnica, sem simular funcionalidades
            que ainda não foram implementadas.
          </p>
        </div>

        <div class="benefit-grid">
          <article class="benefit-card">
            <span class="card-icon" aria-hidden="true">✓</span>
            <h3>Confiança</h3>
            <p>Status de verificação previsto desde a estrutura dos dados.</p>
          </article>
          <article class="benefit-card">
            <span class="card-icon" aria-hidden="true">⌕</span>
            <h3>Busca internacional</h3>
            <p>Modelo preparado para pesquisa por países, cidades e idiomas.</p>
          </article>
          <article class="benefit-card">
            <span class="card-icon" aria-hidden="true">↔</span>
            <h3>Informações protegidas</h3>
            <p>Camada pronta para futuras solicitações entre Irmãos.</p>
          </article>
        </div>
      </section>

      <section class="preview-section" id="estrutura" aria-labelledby="estrutura-title">
        <div class="section-heading">
          <span class="eyebrow">Dados fictícios mínimos</span>
          <h2 id="estrutura-title">Estrutura demonstrativa inicial</h2>
          <p data-members-summary></p>
        </div>

        <div class="member-preview-list" data-member-preview-list></div>
      </section>

      <section class="future-nav" aria-labelledby="future-nav-title">
        <div>
          <span class="eyebrow">Navegação preparada</span>
          <h2 id="future-nav-title">Próximas áreas do MVP</h2>
        </div>
        <div class="future-nav-grid">
          <button type="button" disabled>Login demonstrativo <span>Em breve</span></button>
          <button type="button" disabled>Diretório internacional <span>Em breve</span></button>
          <button type="button" disabled>Perfil de membro <span>Em breve</span></button>
          <button type="button" disabled>Solicitações <span>Em breve</span></button>
          <button type="button" disabled>Painel administrativo <span>Em breve</span></button>
          <button type="button" disabled>Português / Inglês <span>Em breve</span></button>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span data-footer-version></span>
      <span data-footer-mode></span>
    </footer>
  `;

  page.querySelector("[data-members-summary]").textContent =
    `${safeMembers.length} perfis fictícios carregados, com ${verifiedCount} ` +
    "verificados para demonstrar o modelo de dados.";
  page.querySelector("[data-footer-mode]").textContent =
    `Modo ${APP_CONFIG.mode} · esquema de dados ${APP_CONFIG.dataSchemaVersion}`;
  page.querySelector("[data-footer-version]").textContent =
    `International Alliance ${APP_CONFIG.version}`;
  page.querySelector("[data-current-user-initials]").textContent = currentUser?.initials ?? "";
  page.querySelector("[data-current-user-name]").textContent = currentUser?.name ?? "";
  page.querySelector("[data-current-user-role]").textContent =
    getRoleLabel(currentUser?.role);
  page.querySelector("[data-logout-button]").addEventListener("click", onLogout);
  populateMemberPreviewList(page.querySelector("[data-member-preview-list]"), safeMembers);

  return page;
}
