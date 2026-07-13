import { APP_CONFIG } from "../../config/appConfig.js";
import { formatList } from "../../utils/helpers.js";

function getVerifiedCount(members) {
  return members.filter((member) => member.verified).length;
}

function getRoleLabel(role) {
  return role === "admin" ? "Administrador" : "Membro";
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

  const avatar = createTextElement("div", member.initials || "??", "member-avatar");
  avatar.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  const header = document.createElement("div");
  header.className = "member-card-header";

  const name = createTextElement("h3", member.name);
  const status = createTextElement("span", statusLabel, `status-pill ${statusClass}`);

  const canShowCity = member.privacy?.showCity !== false;
  const locationText = canShowCity ? `${member.city}, ${member.country}` : member.country;
  const location = createTextElement("p", locationText);
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

export function renderAccessView({ demoUsers, onLogin, onLoginEmail, onRegister, isSupabase }) {
  const page = document.createElement("div");
  
  if (isSupabase) {
    page.innerHTML = `
      <header class="site-header">
        <a class="brand" href="#acesso" aria-label="International Alliance">
          <span class="brand-mark" aria-hidden="true">IA</span>
          <span>
            <strong>International Alliance</strong>
            <small>Portal Maçônico</small>
          </span>
        </a>
      </header>

      <main id="acesso">
        <section class="access-section" aria-labelledby="access-title">
          <div class="access-copy">
            <span class="eyebrow">Afiliação Internacional</span>
            <h1 id="access-title">International Alliance</h1>
            <p>
              Uma plataforma global e restrita para conectar maçons regulares do mundo inteiro. 
              Para ingressar, realize o cadastro fornecendo suas credenciais maçônicas. 
              Sua filiação será revisada e homologada por um administrador antes da inclusão no diretório.
            </p>
          </div>

          <div class="access-panel">
            <div class="auth-tabs">
              <button class="auth-tab-btn active" type="button" data-btn-login>Entrar</button>
              <button class="auth-tab-btn" type="button" data-btn-register>Criar Conta</button>
            </div>

            <!-- Formulário de Login -->
            <form class="auth-form" data-form-login>
              <div class="form-field">
                <label for="login-email">E-mail</label>
                <input type="email" id="login-email" required placeholder="seu.email@exemplo.com">
              </div>
              <div class="form-field">
                <label for="login-password">Senha</label>
                <input type="password" id="login-password" required placeholder="••••••••">
              </div>
              <p class="form-message error" data-login-error aria-live="polite"></p>
              <button class="button primary access-submit" type="submit">Entrar na Aliança</button>
            </form>

            <!-- Formulário de Cadastro -->
            <form class="auth-form" data-form-register hidden style="max-height: 62vh; overflow-y: auto; padding-right: 8px;">
              <h3 style="margin: 4px 0 8px; color: var(--color-navy); border-bottom: 1px solid var(--color-border); padding-bottom: 4px; font-size: 1.1rem;">Informações Pessoais</h3>
              <div class="auth-form-grid">
                <div class="form-field full-width">
                  <label for="reg-name">Nome Completo</label>
                  <input type="text" id="reg-name" required placeholder="Seu nome completo">
                </div>
                <div class="form-field">
                  <label for="reg-email">E-mail</label>
                  <input type="email" id="reg-email" required placeholder="seu.email@exemplo.com">
                </div>
                <div class="form-field">
                  <label for="reg-password">Senha (Min. 6 chars)</label>
                  <input type="password" id="reg-password" required placeholder="••••••••" minlength="6">
                </div>
                <div class="form-field full-width">
                  <label for="reg-phone">Telefone / WhatsApp</label>
                  <input type="tel" id="reg-phone" required placeholder="+55 11 99999-9999">
                </div>
              </div>

              <h3 style="margin: 18px 0 8px; color: var(--color-navy); border-bottom: 1px solid var(--color-border); padding-bottom: 4px; font-size: 1.1rem;">Localização e Idiomas</h3>
              <div class="auth-form-grid">
                <div class="form-field">
                  <label for="reg-country">País</label>
                  <input type="text" id="reg-country" required placeholder="Ex: Brasil">
                </div>
                <div class="form-field">
                  <label for="reg-city">Cidade</label>
                  <input type="text" id="reg-city" required placeholder="Ex: São Paulo">
                </div>
                <div class="form-field full-width">
                  <label for="reg-languages">Idiomas que Fala (Separados por vírgula)</label>
                  <input type="text" id="reg-languages" required placeholder="Ex: Português, Inglês">
                </div>
              </div>

              <h3 style="margin: 18px 0 8px; color: var(--color-navy); border-bottom: 1px solid var(--color-border); padding-bottom: 4px; font-size: 1.1rem;">Credenciais Maçônicas</h3>
              <div class="auth-form-grid">
                <div class="form-field">
                  <label for="reg-lodge">Nome da Loja</label>
                  <input type="text" id="reg-lodge" required placeholder="Ex: Aurora Azul">
                </div>
                <div class="form-field">
                  <label for="reg-lodge-number">Número da Loja</label>
                  <input type="text" id="reg-lodge-number" required placeholder="Ex: 1234">
                </div>
                <div class="form-field full-width">
                  <label for="reg-obedience">Potência / Obediência Maçônica</label>
                  <input type="text" id="reg-obedience" required placeholder="Ex: Grande Oriente do Brasil">
                </div>
                <div class="form-field">
                  <label for="reg-cim">CIM (Membro ID)</label>
                  <input type="text" id="reg-cim" required placeholder="Ex: 987654">
                </div>
                <div class="form-field">
                  <label for="reg-degree">Grau Maçônico</label>
                  <select id="reg-degree">
                    <option value="Aprendiz">Aprendiz</option>
                    <option value="Companheiro">Companheiro</option>
                    <option value="Mestre Maçom" selected>Mestre Maçom</option>
                  </select>
                </div>
                <div class="form-field full-width">
                  <label for="reg-phrase">Escreva a Frase com a Palavra Semestral</label>
                  <input type="text" id="reg-phrase" required placeholder="Digite a frase para validação do ritual">
                </div>
                <div class="form-field full-width">
                  <label for="reg-bio">Breve Apresentação (Bio)</label>
                  <textarea id="reg-bio" placeholder="Fale um pouco sobre sua trajetória profissional e maçônica..."></textarea>
                </div>
              </div>

              <h3 style="margin: 18px 0 8px; color: var(--color-navy); border-bottom: 1px solid var(--color-border); padding-bottom: 4px; font-size: 1.1rem;">Privacidade do Perfil</h3>
              <div class="checkbox-field" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                <label style="display: flex; gap: 8px; font-weight: normal;">
                  <input type="checkbox" id="reg-priv-lodge" checked> Mostrar minha Loja no diretório
                </label>
                <label style="display: flex; gap: 8px; font-weight: normal;">
                  <input type="checkbox" id="reg-priv-obedience" checked> Mostrar minha Potência no diretório
                </label>
                <label style="display: flex; gap: 8px; font-weight: normal;">
                  <input type="checkbox" id="reg-priv-city" checked> Mostrar minha Cidade no diretório
                </label>
              </div>

              <p class="form-message" data-register-message aria-live="polite"></p>
              <button class="button primary access-submit" type="submit">Cadastrar Candidatura</button>
            </form>

          </div>
        </section>
      </main>
    `;

    const tabLogin = page.querySelector("[data-btn-login]");
    const tabRegister = page.querySelector("[data-btn-register]");
    const formLogin = page.querySelector("[data-form-login]");
    const formRegister = page.querySelector("[data-form-register]");

    const loginError = page.querySelector("[data-login-error]");
    const registerMessage = page.querySelector("[data-register-message]");

    // Alternar entre abas
    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      formLogin.hidden = false;
      formRegister.hidden = true;
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      formRegister.hidden = false;
      formLogin.hidden = true;
    });

    // Enviar formulário de Login
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginError.textContent = "";
      const email = page.querySelector("#login-email").value.trim();
      const password = page.querySelector("#login-password").value;

      const submitBtn = formLogin.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Acessando...";

      const res = await onLoginEmail(email, password);
      if (!res.success) {
        loginError.textContent = res.error;
        submitBtn.disabled = false;
        submitBtn.textContent = "Entrar na Aliança";
      }
    });

    // Enviar formulário de Cadastro
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      registerMessage.textContent = "";
      registerMessage.className = "form-message";

      const email = page.querySelector("#reg-email").value.trim();
      const password = page.querySelector("#reg-password").value;
      const name = page.querySelector("#reg-name").value.trim();
      const phone = page.querySelector("#reg-phone").value.trim();
      const country = page.querySelector("#reg-country").value.trim();
      const city = page.querySelector("#reg-city").value.trim();
      const lodge = page.querySelector("#reg-lodge").value.trim();
      const lodgeNumber = page.querySelector("#reg-lodge-number").value.trim();
      const obedience = page.querySelector("#reg-obedience").value.trim();
      const cim = page.querySelector("#reg-cim").value.trim();
      const degree = page.querySelector("#reg-degree").value;
      const semestralPhrase = page.querySelector("#reg-phrase").value.trim();
      const bio = page.querySelector("#reg-bio").value.trim();

      const showLodge = page.querySelector("#reg-priv-lodge").checked;
      const showObedience = page.querySelector("#reg-priv-obedience").checked;
      const showCity = page.querySelector("#reg-priv-city").checked;

      // Gera iniciais simples
      const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("");

      // Idiomas separados por vírgula
      const languages = page.querySelector("#reg-languages").value
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean);

      const profileData = {
        name,
        initials,
        phone,
        country,
        countryCode: country.slice(0, 2).toUpperCase(),
        city,
        languages,
        lodge,
        lodgeNumber,
        obedience,
        cim,
        degree,
        semestralPhrase,
        bio,
        privacy: { showLodge, showObedience, showCity }
      };

      const submitBtn = formRegister.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Registrando...";

      const res = await onRegister(email, password, profileData);
      if (res.success) {
        registerMessage.className = "form-message success";
        registerMessage.innerHTML = "<strong>Candidatura enviada!</strong> Seu perfil foi cadastrado e está sob análise de um administrador.";
        formRegister.reset();
        submitBtn.textContent = "Enviar Nova Candidatura";
        submitBtn.disabled = false;
        
        // Redireciona para o login após 4 segundos
        setTimeout(() => {
          tabLogin.click();
        }, 4000);
      } else {
        registerMessage.className = "form-message error";
        registerMessage.textContent = res.error;
        submitBtn.disabled = false;
        submitBtn.textContent = "Cadastrar Candidatura";
      }
    });

  } else {
    // Modo Demo de Fallback
    const safeUsers = Array.isArray(demoUsers) ? demoUsers : [];
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
          <strong>Ambiente demonstrativo (Offline)</strong>
          <span>Conecte o Supabase em supabase.js para habilitar o login e cadastro real de membros.</span>
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

      onLogin(selectedUserId).then(success => {
        if (!success) {
          selectedUserId = "";
          loginButton.disabled = true;
          message.textContent = "Perfil demonstrativo inválido. Selecione outro perfil.";
          populateDemoUsers(userList, safeUsers, selectedUserId, selectUser);
        }
      });
    });

    populateDemoUsers(userList, safeUsers, selectedUserId, selectUser);
  }

  return page;
}

export function renderHomeView({ members, currentUser, activeView, onNavigate, onLogout }) {
  const safeMembers = Array.isArray(members) ? members : [];
  const verifiedCount = getVerifiedCount(safeMembers);
  const page = document.createElement("div");

  const isVerified = currentUser?.verified === true;
  const isAdmin = currentUser?.role === "admin";

  page.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#inicio" aria-label="International Alliance">
        <span class="brand-mark" aria-hidden="true">IA</span>
        <span>
          <strong>International Alliance</strong>
          <small>Portal Maçônico</small>
        </span>
      </a>

      <nav class="main-nav" aria-label="Navegação principal">
        <button type="button" class="nav-action" data-view-home>Início</button>
        ${
          isVerified || isAdmin
            ? `<button type="button" class="nav-action" data-view-directory>Diretório</button>`
            : `<span class="nav-disabled" aria-disabled="true">Diretório <small>Bloqueado</small></span>`
        }
        ${
          isAdmin
            ? `<button type="button" class="nav-action" data-view-admin>Admin</button>`
            : `<span class="nav-disabled" aria-disabled="true">Admin <small>Restrito</small></span>`
        }
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
      ${
        !isVerified && !isAdmin
          ? `
        <section class="demo-banner is-pending-banner" aria-label="Aviso de cadastro pendente" style="background-color: var(--color-warning); color: #fff; margin-bottom: 24px;">
          <strong>Cadastro Pendente de Aprovação</strong>
          <span>Seu cadastro foi recebido com sucesso e está sob análise de nossos administradores. O acesso ao diretório de membros será liberado após a validação de suas credenciais maçônicas.</span>
        </section>
        `
          : `
        <section class="demo-banner" aria-label="Aviso de ambiente ativo">
          <strong>Ambiente Conectado</strong>
          <span>Acesso liberado às ferramentas da International Alliance.</span>
        </section>
        `
      }

      <section class="hero-section">
        <div class="hero-copy">
          <span class="eyebrow">Conexão internacional com privacidade</span>
          <h1>International Alliance</h1>
          <p>
            Conexão internacional para aproximar Maçons regulares e verificados em
            diferentes países, cidades e idiomas, com uma experiência discreta,
            institucional e focada na fraternidade.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="#funcionamento">Conhecer o funcionamento</a>
            ${isVerified || isAdmin ? `<button class="button secondary" data-action-go-dir>Abrir Diretório</button>` : ""}
          </div>
        </div>

        <div class="flow-panel" aria-label="Resumo visual do fluxo internacional">
          <div class="flow-node active">
            <span>1</span>
            <strong>Cadastro Inicial</strong>
            <small>CIM e ritualística</small>
          </div>
          <div class="flow-line" aria-hidden="true"></div>
          <div class="flow-node ${isVerified || isAdmin ? "active" : ""}">
            <span>2</span>
            <strong>Homologação</strong>
            <small>Validação por um Ir.'.</small>
          </div>
          <div class="flow-line" aria-hidden="true"></div>
          <div class="flow-node">
            <span>3</span>
            <strong>Acesso Livre</strong>
            <small>Conexões seguras</small>
          </div>
        </div>
      </section>

      <section class="section-grid" id="funcionamento" aria-labelledby="beneficios-title">
        <div class="section-heading">
          <span class="eyebrow">Como Funciona</span>
          <h2 id="beneficios-title">Segurança e Regularidade Maçônica</h2>
          <p>
            Garantimos a legitimidade dos acessos através de um controle manual rigoroso.
          </p>
        </div>

        <div class="benefit-grid">
          <article class="benefit-card">
            <span class="card-icon" aria-hidden="true">✓</span>
            <h3>Homologação por CIM</h3>
            <p>Todo cadastro exige o preenchimento da CIM e da Potência Maçônica reconhecida.</p>
          </article>
          <article class="benefit-card">
            <span class="card-icon" aria-hidden="true">🔑</span>
            <h3>Palavra Semestral</h3>
            <p>Validação da regularidade utilizando referências da ritualística.</p>
          </article>
          <article class="benefit-card">
            <span class="card-icon" aria-hidden="true">🛡️</span>
            <h3>Privacidade Controlada</h3>
            <p>Escolha quais dados (Cidade, Loja, Potência) deseja ocultar ou exibir no diretório.</p>
          </article>
        </div>
      </section>

      <section class="preview-section" id="estrutura" aria-labelledby="estrutura-title">
        <div class="section-heading">
          <span class="eyebrow">Diretório Global</span>
          <h2 id="estrutura-title">Membros Ativos</h2>
          <p data-members-summary></p>
        </div>

        <div class="member-preview-list" data-member-preview-list></div>
      </section>
    </main>

    <footer class="site-footer">
      <span data-footer-version></span>
      <span data-footer-mode></span>
    </footer>
  `;

  page.querySelector("[data-members-summary]").textContent =
    `${safeMembers.length} membros verificados e listados no diretório global no momento.`;
  page.querySelector("[data-footer-mode]").textContent =
    `Modo ${APP_CONFIG.mode} · Versão do esquema ${APP_CONFIG.dataSchemaVersion}`;
  page.querySelector("[data-footer-version]").textContent =
    `International Alliance ${APP_CONFIG.version}`;
  page.querySelector("[data-current-user-initials]").textContent = currentUser?.initials ?? "M";
  page.querySelector("[data-current-user-name]").textContent = currentUser?.name ?? "";
  page.querySelector("[data-current-user-role]").textContent =
    getRoleLabel(currentUser?.role);

  page.querySelector("[data-view-home]").classList.toggle("is-active", activeView === "home");
  page.querySelector("[data-view-home]").addEventListener("click", () => onNavigate("home"));

  if (isVerified || isAdmin) {
    const dirBtn = page.querySelector("[data-view-directory]");
    if (dirBtn) {
      dirBtn.classList.toggle("is-active", activeView === "directory");
      dirBtn.addEventListener("click", () => onNavigate("directory"));
    }
    const heroDirBtn = page.querySelector("[data-action-go-dir]");
    if (heroDirBtn) {
      heroDirBtn.addEventListener("click", () => onNavigate("directory"));
    }
  }

  if (isAdmin) {
    const adminBtn = page.querySelector("[data-view-admin]");
    if (adminBtn) {
      adminBtn.classList.toggle("is-active", activeView === "admin");
      adminBtn.addEventListener("click", () => onNavigate("admin"));
    }
  }

  page.querySelector("[data-logout-button]").addEventListener("click", onLogout);
  populateMemberPreviewList(page.querySelector("[data-member-preview-list]"), safeMembers);

  return page;
}
