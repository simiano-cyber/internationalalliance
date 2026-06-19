import { APP_CONFIG } from "../../config/appConfig.js";
import { formatList } from "../../utils/helpers.js";

function getVerifiedCount(members) {
  return members.filter((member) => member.verified).length;
}

function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text == null ? "" : String(text);
  return element;
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

export function renderHomeView({ members }) {
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
        <span class="nav-disabled" aria-disabled="true">Login <small>Em breve</small></span>
        <span class="nav-disabled" aria-disabled="true">Diretório <small>Em breve</small></span>
        <span class="nav-disabled" aria-disabled="true">Admin <small>Em breve</small></span>
      </nav>
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
  populateMemberPreviewList(page.querySelector("[data-member-preview-list]"), safeMembers);

  return page;
}
