import { formatList } from "../../utils/helpers.js";

function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text == null ? "" : String(text);
  return element;
}

function createButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;

  if (typeof onClick === "function") {
    button.addEventListener("click", onClick);
  }

  return button;
}

function createHeader({ activeView, onBackToDirectory, onHome, onLogout }) {
  const header = document.createElement("header");
  header.className = "site-header";

  const brand = document.createElement("a");
  brand.className = "brand";
  brand.href = "#inicio";
  brand.setAttribute("aria-label", "International Alliance");

  const brandMark = createTextElement("span", "IA", "brand-mark");
  brandMark.setAttribute("aria-hidden", "true");

  const brandText = document.createElement("span");
  brandText.append(
    createTextElement("strong", "International Alliance"),
    createTextElement("small", "MVP demonstrativo")
  );
  brand.append(brandMark, brandText);

  const nav = document.createElement("nav");
  nav.className = "main-nav";
  nav.setAttribute("aria-label", "Navegação principal");

  const homeButton = createButton("Início", "nav-action", onHome);
  const directoryButton = createButton("Diretório", "nav-action", onBackToDirectory);

  if (activeView === "memberProfile") {
    directoryButton.classList.add("is-active");
  }

  const admin = createTextElement("span", "", "nav-disabled");
  admin.setAttribute("aria-disabled", "true");
  admin.append(document.createTextNode("Admin "), createTextElement("small", "Em breve"));

  nav.append(homeButton, directoryButton, admin);

  const actions = document.createElement("div");
  actions.className = "profile-header-actions";
  actions.append(createButton("Sair", "logout-button", onLogout));

  header.append(brand, nav, actions);
  return header;
}

function createStatusPill(text, className) {
  return createTextElement("span", text, `status-pill ${className}`);
}

function appendDetail(container, label, value) {
  if (value == null || value === "") {
    return;
  }

  const item = document.createElement("div");
  item.className = "profile-detail-item";
  item.append(createTextElement("dt", label), createTextElement("dd", value));
  container.append(item);
}

function createProfileActions({ onBackToDirectory, onHome, onLogout }) {
  const actions = document.createElement("div");
  actions.className = "profile-actions";

  const contactButton = createButton(
    "Solicitar contato — Em breve",
    "button primary",
    null
  );
  contactButton.disabled = true;

  actions.append(
    createButton("Voltar ao diretório", "button secondary", onBackToDirectory),
    createButton("Início", "button secondary", onHome),
    contactButton,
    createButton("Sair", "button secondary", onLogout)
  );

  return actions;
}

export function renderMemberProfileView({
  member,
  isOwnProfile,
  onBackToDirectory,
  onHome,
  onLogout
}) {
  const page = document.createElement("div");
  page.append(
    createHeader({
      activeView: "memberProfile",
      onBackToDirectory,
      onHome,
      onLogout
    })
  );

  const main = document.createElement("main");
  const section = document.createElement("section");
  section.className = "profile-section";
  section.setAttribute("aria-labelledby", "profile-title");

  const summary = document.createElement("article");
  summary.className = "profile-summary";

  const avatar = createTextElement("div", member.initials, "profile-avatar-large");
  avatar.setAttribute("aria-hidden", "true");

  const title = createTextElement("h1", member.name, "profile-title");
  title.id = "profile-title";
  title.tabIndex = -1;
  title.setAttribute("data-profile-focus", "");

  const statusGroup = document.createElement("div");
  statusGroup.className = "directory-status-group";

  if (member.verified === true) {
    statusGroup.append(createStatusPill("Verificado", "is-verified"));
  }

  statusGroup.append(
    createStatusPill(
      member.availableForContact === true
        ? "Disponível para contato"
        : "Indisponível",
      member.availableForContact === true ? "is-verified" : "is-pending"
    )
  );

  const location = createTextElement("p", "", "profile-location");
  location.textContent =
    member.privacy?.showCity === true
      ? `${member.city}, ${member.country}`
      : member.country;

  summary.append(avatar, title, statusGroup, location);

  if (isOwnProfile === true) {
    summary.append(
      createTextElement("p", "Este é o seu perfil demonstrativo.", "profile-note")
    );
  }

  summary.append(createProfileActions({ onBackToDirectory, onHome, onLogout }));

  const details = document.createElement("article");
  details.className = "profile-details";

  const detailsTitle = createTextElement("h2", "Informações demonstrativas");
  const detailList = document.createElement("dl");
  detailList.className = "profile-detail-list";

  appendDetail(detailList, "País", member.country);

  if (member.privacy?.showCity === true) {
    appendDetail(detailList, "Cidade", member.city);
  }

  appendDetail(
    detailList,
    "Idiomas",
    formatList(Array.isArray(member.languages) ? member.languages : [])
  );
  appendDetail(detailList, "Grau", member.degree);
  appendDetail(
    detailList,
    "Disponibilidade",
    member.availableForContact === true
      ? "Disponível para contato demonstrativo"
      : "Indisponível para contato demonstrativo"
  );

  if (member.privacy?.showLodge === true) {
    appendDetail(detailList, "Loja", member.lodge);
  }

  if (member.privacy?.showObedience === true) {
    appendDetail(detailList, "Organização", member.obedience);
  }

  const bioTitle = createTextElement("h2", "Bio");
  const bio = createTextElement("p", member.bio, "profile-bio");

  details.append(detailsTitle, detailList, bioTitle, bio);

  const layout = document.createElement("div");
  layout.className = "profile-layout";
  layout.append(summary, details);

  section.append(layout);
  main.append(section);
  page.append(main);

  return page;
}

export function renderMemberProfileNotFoundView({
  onBackToDirectory,
  onHome,
  onLogout
}) {
  const page = document.createElement("div");
  page.append(
    createHeader({
      activeView: "memberProfile",
      onBackToDirectory,
      onHome,
      onLogout
    })
  );

  const main = document.createElement("main");
  const section = document.createElement("section");
  section.className = "profile-section";
  section.setAttribute("aria-labelledby", "profile-not-found-title");

  const panel = document.createElement("div");
  panel.className = "not-found-panel";

  const title = createTextElement("h1", "Perfil não encontrado");
  title.id = "profile-not-found-title";
  title.tabIndex = -1;
  title.setAttribute("data-profile-focus", "");

  const message = createTextElement(
    "p",
    "O perfil demonstrativo selecionado não está disponível nos dados locais atuais."
  );

  const actions = document.createElement("div");
  actions.className = "profile-actions";
  actions.append(
    createButton("Voltar ao diretório", "button secondary", onBackToDirectory),
    createButton("Início", "button secondary", onHome),
    createButton("Sair", "button secondary", onLogout)
  );

  panel.append(title, message, actions);
  section.append(panel);
  main.append(section);
  page.append(main);

  return page;
}
