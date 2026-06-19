import { formatList } from "../../utils/helpers.js";

const DEFAULT_FILTERS = {
  query: "",
  country: "",
  city: "",
  language: "",
  availability: "all"
};

function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text == null ? "" : String(text);
  return element;
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getUniqueSortedValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

function getFilterOptions(members, selectedCountry, baseOptions) {
  const countries = baseOptions?.countries?.length
    ? baseOptions.countries
    : getUniqueSortedValues(members.map((member) => member.country));
  const citySource = selectedCountry
    ? members.filter((member) => member.country === selectedCountry)
    : members;

  return {
    countries,
    cities: getUniqueSortedValues(citySource.map((member) => member.city)),
    languages: baseOptions?.languages?.length
      ? baseOptions.languages
      : getUniqueSortedValues(members.flatMap((member) => member.languages ?? []))
  };
}

function filterMembers(members, filters) {
  const query = normalizeText(filters.query);

  return members.filter((member) => {
    const memberLanguages = Array.isArray(member.languages) ? member.languages : [];
    const matchesQuery =
      !query ||
      normalizeText(member.name).includes(query) ||
      normalizeText(member.city).includes(query) ||
      normalizeText(member.country).includes(query);

    const matchesCountry = !filters.country || member.country === filters.country;
    const matchesCity = !filters.city || member.city === filters.city;
    const matchesLanguage =
      !filters.language || memberLanguages.includes(filters.language);
    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "available" && member.availableForContact) ||
      (filters.availability === "unavailable" && !member.availableForContact);

    return (
      matchesQuery &&
      matchesCountry &&
      matchesCity &&
      matchesLanguage &&
      matchesAvailability
    );
  });
}

function appendOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.append(option);
}

function populateSelect(select, values, selectedValue, defaultLabel) {
  select.replaceChildren();
  appendOption(select, "", defaultLabel);

  values.forEach((value) => {
    appendOption(select, value, value);
  });

  select.value = values.includes(selectedValue) ? selectedValue : "";
}

function createField(labelText, control) {
  const field = document.createElement("label");
  field.className = "filter-field";
  field.append(createTextElement("span", labelText), control);
  return field;
}

function createMemberDetail(label, value) {
  const detail = document.createElement("p");
  const strong = createTextElement("strong", `${label}: `);
  const span = createTextElement("span", value);
  detail.append(strong, span);
  return detail;
}

function createStatusPill(text, className) {
  return createTextElement("span", text, `status-pill ${className}`);
}

function createMemberCard(member) {
  const article = document.createElement("article");
  article.className = "directory-card";

  const header = document.createElement("div");
  header.className = "directory-card-header";

  const avatar = createTextElement("div", member.initials, "member-avatar");
  avatar.setAttribute("aria-hidden", "true");

  const titleGroup = document.createElement("div");
  const name = createTextElement("h3", member.name);
  const canShowCity = member.privacy?.showCity === true;
  const locationText = canShowCity
    ? `${member.city}, ${member.country}`
    : member.country;
  const location = createTextElement("p", locationText);

  titleGroup.append(name, location);
  header.append(avatar, titleGroup);

  const statusGroup = document.createElement("div");
  statusGroup.className = "directory-status-group";

  if (member.verified) {
    statusGroup.append(createStatusPill("Verificado", "is-verified"));
  }

  statusGroup.append(
    createStatusPill(
      member.availableForContact ? "Disponível para contato" : "Indisponível",
      member.availableForContact ? "is-verified" : "is-pending"
    )
  );

  const body = document.createElement("div");
  body.className = "directory-card-body";
  body.append(createMemberDetail("Idiomas", formatList(member.languages ?? [])));

  if (member.privacy?.showLodge === true) {
    body.append(createMemberDetail("Loja", member.lodge));
  }

  if (member.privacy?.showObedience === true) {
    body.append(createMemberDetail("Organização", member.obedience));
  }

  const action = document.createElement("button");
  action.type = "button";
  action.className = "button secondary directory-card-action";
  action.disabled = true;
  action.textContent = "Ver perfil — Em breve";

  article.append(header, statusGroup, body, action);
  return article;
}

function populateMemberResults(container, members) {
  const fragment = document.createDocumentFragment();

  members.forEach((member) => {
    fragment.append(createMemberCard(member));
  });

  container.replaceChildren(fragment);
}

export function renderDirectoryView({
  members,
  directoryFilters,
  currentUser,
  onNavigate,
  onLogout
}) {
  const safeMembers = Array.isArray(members) ? members : [];
  const filters = { ...DEFAULT_FILTERS };
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
        <button type="button" class="nav-action is-active" data-view-directory>Diretório</button>
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

    <main>
      <section class="demo-banner" aria-label="Aviso de ambiente demonstrativo">
        <strong>Ambiente demonstrativo</strong>
        <span>Diretório com dados fictícios e sem abertura de perfil nesta fase.</span>
      </section>

      <section class="directory-section" aria-labelledby="directory-title">
        <div class="section-heading">
          <span class="eyebrow">Diretório internacional</span>
          <h1 id="directory-title">Membros demonstrativos</h1>
          <p>
            Pesquise irmãos fictícios por destino, idioma e disponibilidade para contato.
          </p>
        </div>

        <form class="directory-filters" data-directory-filters>
          <div class="filter-field" data-search-field></div>
          <div class="filter-field" data-country-field></div>
          <div class="filter-field" data-city-field></div>
          <div class="filter-field" data-language-field></div>
          <div class="filter-field" data-availability-field></div>
          <button class="button secondary clear-filters-button" type="button" data-clear-filters>
            Limpar filtros
          </button>
        </form>

        <p class="directory-results-summary" data-results-summary aria-live="polite"></p>
        <div class="directory-grid" data-directory-results></div>
        <div class="empty-state" data-empty-state hidden>
          <h2>Nenhum membro encontrado</h2>
          <p>Altere a busca ou limpe os filtros para visualizar outros perfis fictícios.</p>
        </div>
      </section>
    </main>
  `;

  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.placeholder = "Nome, cidade ou país";
  searchInput.autocomplete = "off";

  const countrySelect = document.createElement("select");
  const citySelect = document.createElement("select");
  const languageSelect = document.createElement("select");
  const availabilitySelect = document.createElement("select");

  appendOption(availabilitySelect, "all", "Todos");
  appendOption(availabilitySelect, "available", "Disponíveis para contato");
  appendOption(availabilitySelect, "unavailable", "Indisponíveis para contato");

  page.querySelector("[data-search-field]").replaceWith(
    createField("Pesquisar", searchInput)
  );
  page.querySelector("[data-country-field]").replaceWith(
    createField("País", countrySelect)
  );
  page.querySelector("[data-city-field]").replaceWith(createField("Cidade", citySelect));
  page.querySelector("[data-language-field]").replaceWith(
    createField("Idioma", languageSelect)
  );
  page.querySelector("[data-availability-field]").replaceWith(
    createField("Disponibilidade", availabilitySelect)
  );

  const results = page.querySelector("[data-directory-results]");
  const summary = page.querySelector("[data-results-summary]");
  const emptyState = page.querySelector("[data-empty-state]");
  const clearButton = page.querySelector("[data-clear-filters]");
  const filtersForm = page.querySelector("[data-directory-filters]");

  function renderResults() {
    const options = getFilterOptions(safeMembers, filters.country, directoryFilters);

    if (filters.city && !options.cities.includes(filters.city)) {
      filters.city = "";
    }

    populateSelect(countrySelect, options.countries, filters.country, "Todos os países");
    populateSelect(citySelect, options.cities, filters.city, "Todas as cidades");
    populateSelect(languageSelect, options.languages, filters.language, "Todos os idiomas");
    availabilitySelect.value = filters.availability;
    searchInput.value = filters.query;

    const filteredMembers = filterMembers(safeMembers, filters);
    summary.textContent = `${filteredMembers.length} de ${safeMembers.length} membros encontrados.`;
    emptyState.hidden = filteredMembers.length > 0;
    populateMemberResults(results, filteredMembers);
  }

  searchInput.addEventListener("input", () => {
    filters.query = searchInput.value.trim();
    renderResults();
  });

  countrySelect.addEventListener("change", () => {
    filters.country = countrySelect.value;
    renderResults();
  });

  citySelect.addEventListener("change", () => {
    filters.city = citySelect.value;
    renderResults();
  });

  languageSelect.addEventListener("change", () => {
    filters.language = languageSelect.value;
    renderResults();
  });

  availabilitySelect.addEventListener("change", () => {
    filters.availability = availabilitySelect.value;
    renderResults();
  });

  clearButton.addEventListener("click", () => {
    Object.assign(filters, DEFAULT_FILTERS);
    renderResults();
    searchInput.focus();
  });

  filtersForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  page.querySelector("[data-view-home]").addEventListener("click", () => onNavigate("home"));
  page
    .querySelector("[data-view-directory]")
    .addEventListener("click", () => onNavigate("directory"));
  page.querySelector("[data-logout-button]").addEventListener("click", onLogout);
  page.querySelector("[data-current-user-initials]").textContent = currentUser?.initials ?? "";
  page.querySelector("[data-current-user-name]").textContent = currentUser?.name ?? "";
  page.querySelector("[data-current-user-role]").textContent =
    currentUser?.role === "admin" ? "Administrador demonstrativo" : "Membro demonstrativo";

  renderResults();
  return page;
}
