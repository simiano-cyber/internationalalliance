import { formatList } from "../../utils/helpers.js";

function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text == null ? "" : String(text);
  return element;
}

function createCandidateCard(member, onApprove) {
  const card = document.createElement("article");
  card.className = "admin-candidate-card";

  const header = document.createElement("div");
  header.className = "candidate-card-header";

  const avatar = createTextElement("div", member.initials || "??", "member-avatar");
  avatar.setAttribute("aria-hidden", "true");

  const titleGroup = document.createElement("div");
  const name = createTextElement("h3", member.name);
  const info = createTextElement(
    "p",
    `${member.city}, ${member.country} · CIM: ${member.cim} · Grau: ${member.degree}`
  );
  titleGroup.append(name, info);
  header.append(avatar, titleGroup);

  const detailsGrid = document.createElement("div");
  detailsGrid.className = "candidate-details-grid";

  // Detalhes da Loja e Obediência
  const lodgeInfo = document.createElement("div");
  lodgeInfo.append(
    createTextElement("strong", "Loja Maçônica: "),
    document.createTextNode(`${member.lodge} (Nº ${member.lodge_number})`),
    document.createElement("br"),
    createTextElement("strong", "Potência / Obediência: "),
    document.createTextNode(member.obedience)
  );

  // Informações de Contato e Idiomas
  const contactInfo = document.createElement("div");
  contactInfo.append(
    createTextElement("strong", "Telefone: "),
    document.createTextNode(member.phone),
    document.createElement("br"),
    createTextElement("strong", "Idiomas: "),
    document.createTextNode(formatList(member.languages || []))
  );

  // Validação Secreta (Frase Semestral)
  const validationInfo = document.createElement("div");
  validationInfo.className = "candidate-validation-phrase";
  validationInfo.append(
    createTextElement("strong", "Frase com a Palavra Semestral: "),
    document.createElement("br"),
    createTextElement("span", `"${member.semestral_phrase}"`, "italic-text")
  );

  detailsGrid.append(lodgeInfo, contactInfo, validationInfo);

  if (member.bio) {
    const bioText = document.createElement("p");
    bioText.className = "candidate-bio";
    bioText.append(createTextElement("strong", "Biografia: "), document.createTextNode(member.bio));
    detailsGrid.append(bioText);
  }

  const actions = document.createElement("div");
  actions.className = "candidate-card-actions";

  const approveBtn = document.createElement("button");
  approveBtn.type = "button";
  approveBtn.className = "button primary";
  approveBtn.textContent = "Aprovar Candidatura";
  approveBtn.addEventListener("click", async () => {
    approveBtn.disabled = true;
    approveBtn.textContent = "Aprovando...";
    await onApprove(member.id);
  });

  actions.append(approveBtn);

  card.append(header, detailsGrid, actions);
  return card;
}

export function renderAdminView({
  pendingMembers,
  onApprove,
  onNavigate,
  onLogout,
  currentUser
}) {
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
        <button type="button" class="nav-action" data-view-home>Início</button>
        <button type="button" class="nav-action" data-view-directory>Diretório</button>
        <button type="button" class="nav-action is-active" data-view-admin>Admin</button>
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

    <main>
      <section class="demo-banner" aria-label="Aviso de ambiente demonstrativo">
        <strong>Modo de Administração</strong>
        <span>Revisão e homologação de novos candidatos à International Alliance.</span>
      </section>

      <section class="admin-section" aria-labelledby="admin-title">
        <div class="section-heading">
          <span class="eyebrow">Painel de Controle</span>
          <h1 id="admin-title">Candidatos Pendentes</h1>
          <p>
            Verifique as credenciais maçônicas (CIM, Loja, Potência e Palavra Semestral) antes de aprovar a inclusão no diretório internacional.
          </p>
        </div>

        <div class="candidates-list" data-candidates-list></div>

        <div class="empty-state" data-admin-empty-state hidden>
          <h2>Nenhum candidato aguardando</h2>
          <p>Todas as solicitações de filiação foram analisadas e decididas.</p>
        </div>
      </section>
    </main>
  `;

  // Preenche dados do admin no header
  page.querySelector("[data-current-user-initials]").textContent = currentUser?.initials ?? "AD";
  page.querySelector("[data-current-user-name]").textContent = currentUser?.name ?? "Administrador";
  page.querySelector("[data-current-user-role]").textContent = "Administrador";

  // Eventos de Navegação
  page.querySelector("[data-view-home]").addEventListener("click", () => onNavigate("home"));
  page.querySelector("[data-view-directory]").addEventListener("click", () => onNavigate("directory"));
  page.querySelector("[data-logout-button]").addEventListener("click", onLogout);

  // Lista os candidatos pendentes
  const listContainer = page.querySelector("[data-candidates-list]");
  const emptyState = page.querySelector("[data-admin-empty-state]");

  if (pendingMembers.length === 0) {
    emptyState.hidden = false;
  } else {
    pendingMembers.forEach((member) => {
      listContainer.append(createCandidateCard(member, onApprove));
    });
  }

  return page;
}
