// ═══════════════════════════════════════════════
// LOVABLE FEATURE ATLAS — interactive dashboard
// ═══════════════════════════════════════════════

(function () {
  const FEATURES = window.LOVABLE_FEATURES || [];

  // ─── State ───
  const state = {
    search: "",
    category: "All",
    statuses: new Set(["GA", "Beta"]),
    sort: "date-desc",
    view: "grid",
  };

  // ─── Theme (in-memory only — no localStorage in sandboxed iframes) ───
  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");

  document.getElementById("themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  });

  // ─── Helpers ───
  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const fmtMonthYear = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const categoryCounts = () => {
    const map = {};
    FEATURES.forEach((f) => {
      map[f.category] = (map[f.category] || 0) + 1;
    });
    return map;
  };

  // ─── Stats ───
  // Total = GA + Beta (active features). Removed/sunset features (1) are still in the
  // dataset for historical accuracy but excluded from the headline count.
  function renderStats() {
    const ga = FEATURES.filter((f) => f.status === "GA").length;
    const beta = FEATURES.filter((f) => f.status === "Beta").length;
    const total = ga + beta;
    const cats = new Set(FEATURES.map((f) => f.category)).size;
    const recent = FEATURES.filter(
      (f) => f.releaseDate >= "2026-01-01" && f.status !== "Removed"
    ).length;
    document.getElementById("statTotal").textContent = total;
    document.getElementById("statGA").textContent = ga;
    document.getElementById("statBeta").textContent = beta;
    document.getElementById("statCategories").textContent = cats;
    document.getElementById("statRecent").textContent = recent;
  }

  // ─── Category filters ───
  function renderCategoryFilters() {
    // Counts reflect only currently-selected statuses to keep numbers honest.
    const visible = FEATURES.filter((f) => state.statuses.has(f.status));
    const counts = {};
    visible.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    const allCats = Array.from(new Set(FEATURES.map((f) => f.category))).sort();
    const cats = ["All", ...allCats];
    const container = document.getElementById("categoryFilters");
    container.innerHTML = cats
      .map((c) => {
        const n = c === "All" ? visible.length : counts[c] || 0;
        const active = state.category === c ? " is-active" : "";
        return `<button class="chip${active}" data-cat="${c}" type="button">
          <span>${c}</span><span class="chip__count">${n}</span>
        </button>`;
      })
      .join("");

    container.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.dataset.cat;
        renderCategoryFilters();
        render();
      });
    });
  }

  // ─── Filter + sort ───
  function filtered() {
    const q = state.search.trim().toLowerCase();
    let list = FEATURES.filter((f) => {
      if (state.category !== "All" && f.category !== state.category) return false;
      if (!state.statuses.has(f.status)) return false;
      if (!q) return true;
      const blob = [
        f.name,
        f.tagline,
        f.description,
        f.category,
        ...(f.capabilities || []),
        ...(f.useCases || []),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });

    switch (state.sort) {
      case "date-asc":
        list.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "category":
        list.sort(
          (a, b) =>
            a.category.localeCompare(b.category) || b.releaseDate.localeCompare(a.releaseDate)
        );
        break;
      case "date-desc":
      default:
        list.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    }
    return list;
  }

  // ─── Cards ───
  const statusBadge = (s) => {
    const map = { GA: "ga", Beta: "beta", Removed: "removed" };
    return `<span class="badge badge--${map[s] || "removed"}">${s}</span>`;
  };

  function cardHTML(f) {
    return `<button class="card" data-id="${f.id}" type="button" aria-label="Open details for ${f.name}">
      <div class="card__head">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span class="card__icon" aria-hidden="true">${f.icon}</span>
          <div>
            <h3 class="card__name">${f.name}</h3>
            <p class="card__tagline">${f.tagline}</p>
          </div>
        </div>
      </div>
      <div class="card__meta">
        ${statusBadge(f.status)}
        <span class="badge badge--category">${f.category}</span>
        <span class="card__date">${fmtDate(f.releaseDate)}</span>
      </div>
    </button>`;
  }

  // ─── Render grid view ───
  function renderGrid(list) {
    const grid = document.getElementById("featureGrid");
    grid.innerHTML = list.map(cardHTML).join("");
    bindCards(grid);
  }

  // ─── Render timeline view ───
  function renderTimeline(list) {
    const view = document.getElementById("timelineView");
    // Group by year, sorted descending
    const byYear = {};
    list.forEach((f) => {
      const y = f.releaseDate.slice(0, 4);
      (byYear[y] = byYear[y] || []).push(f);
    });
    const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));
    view.innerHTML = years
      .map((y) => {
        const entries = byYear[y].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
        return `<section class="timeline__year">
          <h2 class="timeline__year-label">${y}</h2>
          <div class="timeline__group">
            ${entries
              .map(
                (f) => `<div class="timeline__entry">
              <div class="timeline__date">${fmtMonthYear(f.releaseDate)}</div>
              ${cardHTML(f)}
            </div>`
              )
              .join("")}
          </div>
        </section>`;
      })
      .join("");
    bindCards(view);
  }

  function bindCards(scope) {
    scope.querySelectorAll(".card").forEach((el) => {
      el.addEventListener("click", () => openModal(el.dataset.id));
    });
  }

  // ─── Master render ───
  function render() {
    const list = filtered();
    const count = list.length;
    document.getElementById("resultsCount").textContent =
      count === 0
        ? "No features"
        : `${count} feature${count === 1 ? "" : "s"}`;

    const grid = document.getElementById("featureGrid");
    const timeline = document.getElementById("timelineView");
    const empty = document.getElementById("emptyState");

    if (count === 0) {
      grid.hidden = true;
      timeline.hidden = true;
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    if (state.view === "grid") {
      grid.hidden = false;
      timeline.hidden = true;
      renderGrid(list);
    } else {
      grid.hidden = true;
      timeline.hidden = false;
      renderTimeline(list);
    }
  }

  // ─── Modal ───
  function openModal(id) {
    const f = FEATURES.find((x) => x.id === id);
    if (!f) return;
    const body = document.getElementById("modalBody");
    body.innerHTML = `
      <div class="modal__icon" aria-hidden="true">${f.icon}</div>
      <h2 class="modal__title" id="modalTitle">${f.name}</h2>
      <p class="modal__tagline">${f.tagline}</p>
      <div class="modal__meta">
        ${statusBadge(f.status)}
        <span class="badge badge--category">${f.category}</span>
        <span class="badge badge--category">${fmtDate(f.releaseDate)}</span>
        <span class="badge badge--category">${f.pricing}</span>
      </div>
      <div class="modal__section">
        <h3>About</h3>
        <p>${f.description}</p>
      </div>
      <div class="modal__section">
        <h3>Capabilities</h3>
        <ul class="modal__list">
          ${f.capabilities.map((c) => `<li>${c}</li>`).join("")}
        </ul>
      </div>
      <div class="modal__section">
        <h3>Example use cases</h3>
        <ul class="modal__list">
          ${f.useCases.map((u) => `<li>${u}</li>`).join("")}
        </ul>
      </div>
      <div class="modal__section">
        <h3>Source</h3>
        <a class="modal__source" href="${f.source}" target="_blank" rel="noopener">
          ${new URL(f.source).hostname.replace("www.", "")}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
        </a>
      </div>
    `;
    const modal = document.getElementById("modal");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    // Focus the close button
    setTimeout(() => modal.querySelector(".modal__close").focus(), 50);
  }
  function closeModal() {
    document.getElementById("modal").hidden = true;
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("modal").hidden) closeModal();
  });

  // ─── Bind controls ───
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });

  // "/" keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput && document.getElementById("modal").hidden) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  document.querySelectorAll('[data-status]').forEach((cb) => {
    cb.addEventListener("change", () => {
      const s = cb.dataset.status;
      if (cb.checked) state.statuses.add(s);
      else state.statuses.delete(s);
      renderCategoryFilters();
      render();
    });
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      state.view = btn.dataset.view;
      render();
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    state.search = "";
    state.category = "All";
    state.statuses = new Set(["GA", "Beta"]);
    state.sort = "date-desc";
    searchInput.value = "";
    document.querySelectorAll('[data-status]').forEach((cb) => {
      cb.checked = state.statuses.has(cb.dataset.status);
    });
    document.getElementById("sortSelect").value = "date-desc";
    renderCategoryFilters();
    render();
  });

  // ─── Init ───
  renderStats();
  renderCategoryFilters();
  render();
})();
