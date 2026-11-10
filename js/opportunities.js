/* OPPORTUNITIES PAGE: filter, search, save, mark as applied. Skill match is calculated from the skills on YOUR profile.
   The organizations are fictional demo data. */
SLH.dom.ready(function () {
  const user = SLH.auth.getCurrentUser();
  if (!user) return;
  
  const root = SLH.dom.qs("#opps-root");
  const esc = SLH.dom.esc;
  const list = SLH.data.opportunities;
  const key = `opps:${user.id}`;
  
  let state = SLH.storage.get(key, {}); /* { "<title>": "saved" | "applied" } */
  let type = "All";
  let term = "";
  let sort = "match";
  const types = ["All"].concat(Array.from(new Set(list.map((o) => o.type))));

  /* Match = how many of the required skills you already have (needs skills on your profile). */
  function match(o) {
    const mine = (SLH.profile.get(user.id) || { skills: [] }).skills.map((s) => s.toLowerCase());
    if (!mine.length) return null;
    const have = o.skills.filter((s) => mine.includes(s.toLowerCase()));
    return {
      percent: Math.round((have.length / o.skills.length) * 100),
      have,
      missing: o.skills.filter((s) => !have.includes(s))
    };
  }

  const hasSkills = () => ((SLH.profile.get(user.id) || {}).skills || []).length > 0;

  function render() {
    const items = list
      .map((o) => ({ o, m: match(o) }))
      .filter((x) => 
        (type === "All" || x.o.type === type) && 
        (!term || (x.o.title + " " + x.o.org + " " + x.o.skills.join(" ")).toLowerCase().includes(term))
      )
      .sort((a, b) => {
        if (sort === "match") {
          return (b.m ? b.m.percent : -1) - (a.m ? a.m.percent : -1);
        } else if (sort === "saved") {
          return (state[b.o.title] ? 1 : 0) - (state[a.o.title] ? 1 : 0);
        }
        return 0;
      });

    const saved = Object.values(state).filter((v) => v === "saved").length;
    const applied = Object.values(state).filter((v) => v === "applied").length;

    root.innerHTML = `
      ${hasSkills() ? "" : `
        <div class="alert alert--info" role="note">
          <i class="icon" data-icon="info"></i>
          <div>
            <b>See your real match</b>
            <p>Add skills to your profile and each opportunity will show how many required skills you already have. <a href="profile.html#sec-skills" class="u-underline">Add skills</a></p>
          </div>
        </div>
      `}
      <div class="lv-tools">
        <label class="visually-hidden" for="o-q">Search</label>
        <input class="input" id="o-q" type="search" placeholder="Search by title, company or skill…" value="${esc(term)}" autocomplete="off">
        <div class="chips" role="group" aria-label="Type">
          ${types.map((t) => `
            <button type="button" class="chip ${t === type ? "chip--brand" : ""}" data-type="${esc(t)}" aria-pressed="${t === type}">
              ${esc(t)}
            </button>
          `).join("")}
        </div>
        <div class="cluster u-flex-between">
          <p class="small muted">${items.length} shown · ${saved} saved · ${applied} applied</p>
          <label class="small">Sort by 
            <select class="select" id="o-sort" style="width:auto;min-height:2.25rem;padding-block:.2rem">
              <option value="match" ${sort === "match" ? "selected" : ""}>Best match</option>
              <option value="saved" ${sort === "saved" ? "selected" : ""}>Saved first</option>
            </select>
          </label>
        </div>
      </div>
      ${items.length ? `
        <div class="lv-list">${items.map(card).join("")}</div>
      ` : `
        <div class="empty">
          <i class="icon" data-icon="search"></i>
          <p>No opportunities match your filters.</p>
          <button class="btn btn--sm" data-reset>Clear filters</button>
        </div>
      `}
    `;

    SLH.icons.render(root);

    const q = SLH.dom.qs("#o-q");
    q.addEventListener("input", () => {
      term = q.value.trim().toLowerCase();
      const pos = q.selectionStart;
      render();
      const n = SLH.dom.qs("#o-q");
      n.focus();
      n.setSelectionRange(pos, pos);
    });

    SLH.dom.qs("#o-sort").addEventListener("change", (e) => {
      sort = e.target.value;
      render();
    });
  }

  function card(x) {
    const o = x.o;
    const m = x.m;
    const st = state[o.title];

    return `
      <article class="card lv-opp">
        <div class="score">
          <b>${m ? m.percent : "–"}</b>
          <span>${m ? "% match" : "add skills"}</span>
        </div>
        <div class="u-min-w-0 flex-1">
          <div class="chips">
            <span class="badge badge--brand">${esc(o.type)}</span>
            ${st === "applied" ? '<span class="badge badge--accent">Applied</span>' : st === "saved" ? '<span class="badge">Saved</span>' : ""}
          </div>
          <h3>${esc(o.title)}</h3>
          <p class="small muted">${esc(o.org)}</p>
          <p class="opp__meta">
            <span><i class="icon" data-icon="pin"></i> ${esc(o.where)}</span>
            <span><i class="icon" data-icon="clock"></i> Apply by ${esc(o.deadline)}</span>
          </p>
          <div class="chips">
            ${o.skills.map((s) => `
              <span class="chip ${m && m.have.includes(s) ? "chip--brand" : ""}">
                ${m && m.have.includes(s) ? "✓ " : ""}${esc(s)}
              </span>
            `).join("")}
          </div>
          ${m && m.missing.length ? `
            <p class="small muted u-mt-2">To improve your match, learn: ${esc(m.missing.join(", "))} · <a href="learning.html#roadmaps" class="u-underline">find a roadmap</a></p>
          ` : ""}
        </div>
        <div class="lv-actions">
          <button class="btn btn--sm ${st === "saved" ? "btn--primary" : ""}" data-save="${esc(o.title)}" aria-pressed="${st === "saved"}">
            <i class="icon" data-icon="star"></i>${st === "saved" ? "Saved" : "Save"}
          </button>
          <button class="btn btn--sm ${st === "applied" ? "" : "btn--primary"}" data-apply="${esc(o.title)}">
            ${st === "applied" ? "Undo applied" : "Mark as applied"}
          </button>
        </div>
      </article>
    `;
  }

  root.addEventListener("click", (e) => {
    const t = e.target.closest("[data-type]");
    const s = e.target.closest("[data-save]");
    const a = e.target.closest("[data-apply]");
    const r = e.target.closest("[data-reset]");

    if (t) {
      type = t.dataset.type;
      render();
    } else if (r) {
      type = "All";
      term = "";
      render();
    } else if (s) {
      const k = s.dataset.save;
      if (state[k] === "saved") delete state[k];
      else state[k] = "saved";
      SLH.storage.set(key, state);
      render();
    } else if (a) {
      const k = a.dataset.apply;
      if (state[k] === "applied") {
        delete state[k];
      } else {
        state[k] = "applied";
        SLH.toast.show("Marked as applied. Good luck!", { tone: "success" });
      }
      SLH.storage.set(key, state);
      render();
    }
  });

  render();
});