/* PROFILE PAGE: header, completion, chips (skills/interests/goals) and list sections that users can add / edit / delete.
   Section definitions live in profile.store.js, so adding a new section type = adding one config entry. */
SLH.dom.ready(function () {
  const user = SLH.auth.getCurrentUser();
  if (!user) return;
  
  const root = SLH.dom.qs("#profile-root");
  const esc = SLH.dom.esc;
  const S = SLH.profile;
  
  let p = S.get(user.id) || S.createFor(user.id, { name: user.name });
  const YEARS = ["First year", "Second year", "Third year", "Fourth year", "Fifth year or more", "Graduate"];
  
  const commit = (msg) => {
    S.save(p);
    render();
    if (msg) SLH.toast.show(msg, { tone: "success" });
  };

  /* ---------- Generic form dialog ---------- */
  const dlg = document.createElement("dialog");
  dlg.className = "modal";
  document.body.appendChild(dlg);

  function openForm(o) {
    const fields = o.fields || [];
    dlg.innerHTML = `
      <form method="dialog" novalidate>
        <div class="modal__head">
          <h2 class="text-xl">${esc(o.title)}</h2>
          <button type="button" class="btn btn--ghost btn--icon" data-close aria-label="Close">
            <i class="icon" data-icon="x"></i>
          </button>
        </div>
        <div class="modal__body">
          ${o.message ? `<p>${esc(o.message)}</p>` : ""} ${fields.map((f, i) => { const [name, label, type, req] = f; const id = `f${i}`;
            const v = o.values && o.values[name] != null ? o.values[name] : "";
            let ctl;
            
            if (type === "textarea") {
              ctl = `<textarea class="textarea" id="${id}" name="${name}" maxlength="1000">${esc(v)}</textarea>`;
            } else if (type.startsWith("select:")) {
              ctl = `
                <select class="select" id="${id}" name="${name}">
                  <option value="">Choose…</option>
                  ${type.slice(7).split(",").map((x) => `<option ${x === v ? "selected" : ""}>${esc(x)}</option>`).join("")}
                </select>
              `;
            } else {
              ctl = `
                <input class="input" id="${id}" name="${name}" type="${type === "url" ? "text" : type}" value="${esc(v)}" maxlength="200" ${type === "url" ? 'inputmode="url" placeholder="https://"' : ""}>
              `;
            }
            
            return `
              <div class="field">
                <label class="field__label" for="${id}">${esc(label)}${req ? " *" : ""}</label>
                ${ctl}
                <p class="field__error"></p>
              </div>
            `;
          }).join("")}
        </div>
        <div class="modal__foot">
          <button type="button" class="btn" data-close>Cancel</button>
          <button class="btn ${o.danger ? "btn--danger" : "btn--primary"}" type="submit">${esc(o.cta || "Save")}</button>
        </div>
      </form>
    `;

    SLH.icons.render(dlg);
    dlg.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => dlg.close()));
    
    dlg.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      const data = {};
      let ok = true;
      
      fields.forEach((f) => {
        const el = dlg.querySelector(`[name="${f[0]}"]`);
        const val = el.value.trim();
        let err = "";
        
        if (f[3] && !val) err = "This field is required.";
        else if (f[2] === "url" && val && !S.safeUrl(val)) err = "Enter a valid link starting with https://";
        
        SLH.form.setError(el, err);
        if (err) ok = false;
        data[f[0]] = f[2] === "url" ? S.safeUrl(val) : val;
      });
      
      if (!ok) return;
      dlg.close();
      o.onSave(data);
    };

    dlg.showModal();
    const first = dlg.querySelector("input,textarea,select");
    if (first) first.focus();
  }

  /* ---------- Render ---------- */
  function listCard(key) {
    const c = S.SECTIONS[key];
    const items = p[key];
    
    return `
      <section class="card" id="sec-${key}" aria-labelledby="h-${key}">
        <div class="card__head">
          <h2 id="h-${key}">${c.title}</h2>
          <button class="btn btn--sm sec-add" data-add="${key}"><i class="icon" data-icon="plus"></i>Add</button>
        </div>
        ${items.length ? items.map((e) => `
          <div class="entry">
            <div class="u-min-w-0">
              <h4>${esc(c.line(e).filter(Boolean).join(" · "))}</h4>
              ${c.meta(e) ? `<p class="muted">${key === "links" ? `<a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.url)}</a>` : esc(c.meta(e))}</p>` : ""}
              ${e.details || e.description ? `<p>${esc(e.details || e.description)}</p>` : ""}
              ${e.link ? `<p><a href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">Open link</a></p>` : ""}
            </div>
            <div class="actions">
              <button class="btn btn--ghost btn--icon btn--sm" data-edit="${key}:${e.id}" aria-label="Edit"><i class="icon" data-icon="edit"></i></button>
              <button class="btn btn--ghost btn--icon btn--sm" data-del="${key}:${e.id}" aria-label="Delete"><i class="icon" data-icon="trash"></i></button>
            </div>
          </div>
        `).join("") : `
          <div class="empty">
            <i class="icon" data-icon="${c.icon}"></i>
            <p>Nothing here yet.</p>
            <button class="btn btn--sm" data-add="${key}">${c.add}</button>
          </div>
        `}
      </section>
    `;
  }

  function chipsCard(key) {
    const c = S.CHIPS[key];
    const items = p[key];
    const left = c.suggest.filter((s) => !items.includes(s));
    
    return `
      <section class="card" id="sec-${key}" aria-labelledby="h-${key}">
        <div class="card__head">
          <h2 id="h-${key}">${c.title}</h2>
          <span class="badge">${items.length}</span>
        </div>
        <div class="chips u-mb-3">
          ${items.length ? items.map((s, i) => `
            <span class="chip chip--brand">
              ${esc(s)}
              <button type="button" data-rm="${key}:${i}" aria-label="Remove ${esc(s)}">
                <i class="icon" data-icon="x" style="width:.8rem;height:.8rem"></i>
              </button>
            </span>
          `).join("") : '<span class="small muted">None yet. Add some below.</span>'}
        </div>
        <form class="mini-add" data-chip-form="${key}">
          <label class="visually-hidden" for="in-${key}">Add to ${c.title}</label>
          <input class="input" id="in-${key}" maxlength="40" placeholder="Type and press Add" autocomplete="off">
          <button class="btn btn--primary btn--sm">Add</button>
        </form>
        ${left.length ? `
          <div class="chips u-mt-3">
            ${left.slice(0, 6).map((s) => `<button type="button" class="chip" data-sug="${key}:${esc(s)}">+ ${esc(s)}</button>`).join("")}
          </div>
        ` : ""}
      </section>
    `;
  }

  function render() {
    const comp = S.completion(p);
    const cover = "p-cover" + (p.cover > 1 ? ` p-cover--${p.cover}` : "");
    
    root.innerHTML = `
      <section class="card p-head">
        <div class="${cover}"></div>
        <div class="p-body">
          <div class="p-id">
            <div class="p-avatar">
              <span class="avatar avatar--xl">
                ${p.avatar ? `<img src="${esc(p.avatar)}" alt="Profile photo of ${esc(p.name)}">` : esc(S.initials(p.name))}
              </span>
              <button type="button" data-avatar aria-label="Change profile photo">
                <i class="icon" data-icon="edit" style="width:1rem;height:1rem"></i>
              </button>
              <input type="file" id="avatar-file" accept="image/*" hidden>
            </div>
            <div class="flex-1 min-w-48">
              <h1>${esc(p.name || "Your name")}</h1>
              <p class="muted">${esc(p.headline || "Add a headline, for example: Computer Science student · Frontend developer")}</p>
            </div>
            <button class="btn btn--primary" data-basic><i class="icon" data-icon="edit"></i>Edit profile</button>
          </div>
          <div class="p-meta">
            ${[["cap", p.university], ["book", p.major], ["clock", p.year], ["pin", p.location]]
              .filter((m) => m[1])
              .map((m) => `<span><i class="icon" data-icon="${m[0]}"></i>${esc(m[1])}</span>`)
              .join("")}
          </div>
        </div>
      </section>
      <div class="p-grid">
        <div>
          <section class="card" id="sec-about" aria-labelledby="h-about">
            <div class="card__head">
              <h2 id="h-about">About</h2>
              <button class="btn btn--sm sec-add" data-about><i class="icon" data-icon="edit"></i>Edit</button>
            </div>
            ${p.about ? `<p class="u-pre-line">${esc(p.about)}</p>` : `
              <div class="empty">
                <p>Tell people who you are, what you study and what you want to build.</p>
                <button class="btn btn--sm" data-about>Write about yourself</button>
              </div>
            `}
          </section>
          ${chipsCard("skills")}
          ${listCard("projects")}
          ${listCard("experience")}
          ${listCard("education")}
          ${listCard("achievements")}
          ${listCard("certificates")}
        </div>
        <div>
          <section class="card" aria-labelledby="h-comp">
            <div class="card__head"><h2 id="h-comp">Profile strength</h2></div>
            <div class="cluster u-gap-5 u-flex-nowrap">
              <div class="ring" style="--v:${comp.percent}"><span>${comp.percent}%</span></div>
              <p class="small muted">${comp.percent === 100 ? "Your profile is complete. Nice work." : "Finish these steps to make your profile stand out."}</p>
            </div>
            ${comp.missing.length ? `
              <ul class="todo reset u-mt-4">
                ${comp.missing.slice(0, 6).map((m) => `
                  <li><button type="button" data-goto="${m.target}"><i class="icon" data-icon="plus" style="width:1rem;height:1rem"></i>${esc(m.label)}</button></li>
                `).join("")}
              </ul>
            ` : ""}
          </section>
          ${chipsCard("interests")}
          ${chipsCard("goals")}
          ${listCard("languages")}
          ${listCard("links")}
          <section class="card" aria-labelledby="h-study">
            <div class="card__head"><h2 id="h-study">Study preferences</h2></div>
            <div class="form-grid">
              <div class="field">
                <label class="field__label" for="lvl">Experience level</label>
                <select class="select" id="lvl">
                  <option value="">Choose…</option>
                  ${["Beginner", "Intermediate", "Advanced"].map((l) => `<option ${p.level === l ? "selected" : ""}>${l}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="hrs">Weekly study hours: <b id="hrs-out">${p.hoursPerWeek}</b></label>
                <input type="range" id="hrs" min="0" max="40" step="1" value="${p.hoursPerWeek}" style="accent-color:var(--brand)">
              </div>
            </div>
          </section>
          <section class="card" aria-labelledby="h-app">
            <div class="card__head"><h2 id="h-app">Appearance</h2></div>
            <p class="small muted u-mb-3">Optional. "Device" follows your phone or computer setting.</p>
            <div class="segmented" role="radiogroup" aria-label="Theme">
              ${[["light", "Light", "sun"], ["dark", "Dark", "moon"], ["system", "Device", "layout"]].map((t) => `
                <label>
                  <input type="radio" name="theme" value="${t[0]}" data-theme-choice>
                  <span><i class="icon" data-icon="${t[2]}"></i>${t[1]}</span>
                </label>
              `).join("")}
            </div>
          </section>
          <section class="card" aria-labelledby="h-acc">
            <div class="card__head"><h2 id="h-acc">Account</h2></div>
            <p class="small muted u-mb-3">${esc(user.email)}</p>
            <button class="btn btn--sm" data-signout><i class="icon" data-icon="logout"></i>Sign out</button>
            <button class="btn btn--sm btn--danger" data-reset>Delete my profile data</button>
          </section>
        </div>
      </div>
    `;

    SLH.icons.render(root);
    SLH.theme.paint();
  }

  /* ---------- Events (delegated) ---------- */
  root.addEventListener("click", (e) => {
    const t = (sel) => e.target.closest(sel);
    let b;

    if (t("[data-basic]")) {
      return openForm({
        title: "Edit profile",
        fields: [
          ["name", "Full name", "text", true],
          ["headline", "Headline", "text"],
          ["university", "University", "text"],
          ["faculty", "Faculty", "text"],
          ["major", "Major", "text"],
          ["year", "Academic year", "select:" + YEARS.join(",")],
          ["location", "Location", "text"],
          ["cover", "Cover color", "select:1,2,3,4"]
        ],
        values: p,
        onSave: (d) => {
          d.cover = Number(d.cover) || 1;
          Object.assign(p, d);
          commit("Profile updated.");
        }
      });
    }

    if (t("[data-about]")) {
      return openForm({
        title: "About you",
        fields: [["about", "About", "textarea"]],
        values: p,
        onSave: (d) => {
          p.about = d.about;
          commit("About section saved.");
        }
      });
    }

    if ((b = t("[data-add]"))) {
      const k = b.dataset.add;
      return openForm({
        title: S.SECTIONS[k].add,
        fields: S.SECTIONS[k].fields,
        onSave: (d) => {
          d.id = Date.now();
          p.sections[k] = p.sections[k] || [];
          p.sections[k].push(d);
          commit("Section added.");
        }
      });
    }
  });

  function listCard(key) {
    const c = S.SECTIONS[key];
    const items = p[key];

    return `
      <section class="card" id="sec-${key}" aria-labelledby="h-${key}">
        <div class="card__head">
          <h2 id="h-${key}">${c.title}</h2>
          <button class="btn btn--sm sec-add" data-add="${key}">
            <i class="icon" data-icon="plus"></i>Add
          </button>
        </div>
        ${items.length ? items.map((e) => `
          <div class="entry">
            <div class="u-min-w-0">
              <h4>${esc(c.line(e).filter(Boolean).join(" · "))}</h4>
              ${c.meta(e) ? `<p class="muted">${key === "links" ? `<a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.url)}</a>` : esc(c.meta(e))}</p>` : ""}
              ${e.details || e.description ? `<p>${esc(e.details || e.description)}</p>` : ""}
              ${e.link ? `<p><a href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">Open link</a></p>` : ""}
            </div>
            <div class="actions">
              <button class="btn btn--ghost btn--icon btn--sm" data-edit="${key}:${e.id}" aria-label="Edit">
                <i class="icon" data-icon="edit"></i>
              </button>
              <button class="btn btn--ghost btn--icon btn--sm" data-del="${key}:${e.id}" aria-label="Delete">
                <i class="icon" data-icon="trash"></i>
              </button>
            </div>
          </div>
        `).join("") : `
          <div class="empty">
            <i class="icon" data-icon="${c.icon}"></i>
            <p>Nothing here yet.</p>
            <button class="btn btn--sm" data-add="${key}">${c.add}</button>
          </div>
        `}
      </section>
    `;
  }

  function chipsCard(key) {
    const c = S.CHIPS[key];
    const items = p[key];
    const left = c.suggest.filter((s) => !items.includes(s));

    return `
      <section class="card" id="sec-${key}" aria-labelledby="h-${key}">
        <div class="card__head">
          <h2 id="h-${key}">${c.title}</h2>
          <span class="badge">${items.length}</span>
        </div>
        <div class="chips mb-4">
          ${items.length ? items.map((s, i) => `
            <span class="chip chip--brand">
              ${esc(s)}
              <button type="button" data-rm="${key}:${i}" aria-label="Remove ${esc(s)}">
                <i class="icon" data-icon="x" style="width:.8rem;height:.8rem"></i>
              </button>
            </span>
          `).join("") : '<span class="small muted">None yet. Add some below.</span>'}
        </div>
        <form class="mini-add" data-chip-form="${key}">
          <label class="visually-hidden" for="in-${key}">Add to ${c.title}</label>
          <input class="input" id="in-${key}" maxlength="40" placeholder="Type and press Add" autocomplete="off">
          <button class="btn btn--primary btn--sm">Add</button>
        </form>
        ${left.length ? `
          <div class="chips mt-3">
            ${left.slice(0, 6).map((s) => `<button type="button" class="chip" data-sug="${key}:${esc(s)}">+ ${esc(s)}</button>`).join("")}
          </div>
        ` : ""}
      </section>
    `;
  }

  function render() {
    const comp = S.completion(p);
    const cover = "p-cover" + (p.cover > 1 ? ` p-cover--${p.cover}` : "");

    root.innerHTML = `
      <section class="card p-head">
        <div class="${cover}"></div>
        <div class="p-body">
          <div class="p-id">
            <div class="p-avatar">
              <span class="avatar avatar--xl">
                ${p.avatar ? `<img src="${esc(p.avatar)}" alt="Profile photo of ${esc(p.name)}">` : esc(S.initials(p.name))}
              </span>
              <button type="button" data-avatar aria-label="Change profile photo">
                <i class="icon" data-icon="edit" style="width:1rem;height:1rem"></i>
              </button>
              <input type="file" id="avatar-file" accept="image/*" hidden>
            </div>
            <div class="flex-1 min-w-48">
              <h1>${esc(p.name || "Your name")}</h1>
              <p class="muted">${esc(p.headline || "Add a headline, for example: Computer Science student · Frontend developer")}</p>
            </div>
            <button class="btn btn--primary" data-basic>
              <i class="icon" data-icon="edit"></i>Edit profile
            </button>
          </div>
          <div class="p-meta">
            ${[["cap", p.university], ["book", p.major], ["clock", p.year], ["pin", p.location]].filter((m) => m[1]).map((m) => `<span><i class="icon" data-icon="${m[0]}"></i>${esc(m[1])}</span>`).join("")}
          </div>
        </div>
      </section>
      <div class="p-grid">
        <div>
          <section class="card" id="sec-about" aria-labelledby="h-about">
            <div class="card__head">
              <h2 id="h-about">About</h2>
              <button class="btn btn--sm sec-add" data-about><i class="icon" data-icon="edit"></i>Edit</button>
            </div>
            ${p.about ? `<p class="u-whitespace-pre-line">${esc(p.about)}</p>` : `
              <div class="empty">
                <p>Tell people who you are, what you study and what you want to build.</p>
                <button class="btn btn--sm" data-about>Write about yourself</button>
              </div>
            `}
          </section>
          ${chipsCard("skills")}
          ${listCard("projects")}
          ${listCard("experience")}
          ${listCard("education")}
          ${listCard("achievements")}
          ${listCard("certificates")}
        </div>
        <div>
          <section class="card" aria-labelledby="h-comp">
            <div class="card__head"><h2 id="h-comp">Profile strength</h2></div>
            <div class="cluster u-gap-5 u-flex-nowrap">
              <div class="ring" style="--v:${comp.percent}"><span>${comp.percent}%</span></div>
              <p class="small muted">${comp.percent === 100 ? "Your profile is complete. Nice work." : "Finish these steps to make your profile stand out."}</p>
            </div>
            ${comp.missing.length ? `
              <ul class="todo reset mt-4">
                ${comp.missing.slice(0, 6).map((m) => `<li><button type="button" data-goto="${m.target}"><i class="icon" data-icon="plus" style="width:1rem;height:1rem"></i>${esc(m.label)}</button></li>`).join("")}
              </ul>
            ` : ""}
          </section>
          ${chipsCard("interests")}
          ${chipsCard("goals")}
          ${listCard("languages")}
          ${listCard("links")}
          <section class="card" aria-labelledby="h-study">
            <div class="card__head"><h2 id="h-study">Study preferences</h2></div>
            <div class="form-grid">
              <div class="field">
                <label class="field__label" for="lvl">Experience level</label>
                <select class="select" id="lvl">
                  <option value="">Choose…</option>
                  ${["Beginner", "Intermediate", "Advanced"].map((l) => `<option ${p.level === l ? "selected" : ""}>${l}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="hrs">Weekly study hours: <b id="hrs-out">${p.hoursPerWeek}</b></label>
                <input type="range" id="hrs" min="0" max="40" step="1" value="${p.hoursPerWeek}" style="accent-color:var(--brand)">
              </div>
            </div>
          </section>
          <section class="card" aria-labelledby="h-app">
            <div class="card__head"><h2 id="h-app">Appearance</h2></div>
            <p class="small muted mb-3">Optional. "Device" follows your phone or computer setting.</p>
            <div class="segmented" role="radiogroup" aria-label="Theme">
              ${[["light", "Light", "sun"], ["dark", "Dark", "moon"], ["system", "Device", "layout"]].map((t) => `
                <label>
                  <input type="radio" name="theme" value="${t[0]}" data-theme-choice>
                  <span><i class="icon" data-icon="${t[2]}"></i>${t[1]}</span>
                </label>
              `).join("")}
            </div>
          </section>
          <section class="card" aria-labelledby="h-acc">
            <div class="card__head"><h2 id="h-acc">Account</h2></div>
            <p class="small muted mb-3">${esc(user.email)}</p>
            <button class="btn btn--sm" data-signout><i class="icon" data-icon="logout"></i>Sign out</button>
            <button class="btn btn--sm btn--danger" data-reset>Delete my profile data</button>
          </section>
        </div>
      </div>
    `;

    SLH.icons.render(root);
    SLH.theme.paint();
  }

  /* ---------- Events (delegated) ---------- */
  root.addEventListener("click", (e) => {
    const t = (sel) => e.target.closest(sel);
    let b;

    if (t("[data-basic]")) {
      return openForm({
        title: "Edit profile",
        fields: [
          ["name", "Full name", "text", true],
          ["headline", "Headline", "text"],
          ["university", "University", "text"],
          ["faculty", "Faculty", "text"],
          ["major", "Major", "text"],
          ["year", "Academic year", "select:" + YEARS.join(",")],
          ["location", "Location", "text"],
          ["cover", "Cover color", "select:1,2,3,4"]
        ],
        values: p,
        onSave: (d) => {
          d.cover = Number(d.cover) || 1;
          Object.assign(p, d);
          commit("Profile updated.");
        }
      });
    }

    if (t("[data-about]")) {
      return openForm({
        title: "About you",
        fields: [["about", "About", "textarea"]],
        values: p,
        onSave: (d) => {
          p.about = d.about;
          commit("About section saved.");
        }
      });
    }

    if ((b = t("[data-add]"))) {
      const k = b.dataset.add;
      return openForm({
        title: S.SECTIONS[k].add,
        fields: S.SECTIONS[k].fields,
        onSave: (d) => {
          d.id = S.uid();
          p[k].push(d);
          commit("Added.");
        }
      });
    }

    if ((b = t("[data-edit]"))) {
      const [k, id] = b.dataset.edit.split(":");
      const item = p[k].find((x) => x.id === id);
      return openForm({
        title: "Edit",
        fields: S.SECTIONS[k].fields,
        values: item,
        onSave: (d) => {
          Object.assign(item, d);
          commit("Saved.");
        }
      });
    }

    if ((b = t("[data-del]"))) {
      const [k, id] = b.dataset.del.split(":");
      return openForm({
        title: "Delete this entry?",
        message: "This cannot be undone.",
        cta: "Delete",
        danger: true,
        onSave: () => {
          p[k] = p[k].filter((x) => x.id !== id);
          commit("Deleted.");
        }
      });
    }

    if ((b = t("[data-rm]"))) {
      const [k, i] = b.dataset.rm.split(":");
      p[k].splice(Number(i), 1);
      return commit();
    }

    if ((b = t("[data-sug]"))) {
      const i = b.dataset.sug.indexOf(":");
      const k = b.dataset.sug.slice(0, i);
      const v = b.dataset.sug.slice(i + 1);
      if (!p[k].includes(v)) p[k].push(v);
      return commit();
    }

    if (t("[data-avatar]")) return SLH.dom.qs("#avatar-file").click();

    if ((b = t("[data-goto]"))) {
      const k = b.dataset.goto;
      if (k === "avatar") return SLH.dom.qs("#avatar-file").click();
      if (k === "basic") return SLH.dom.qs("[data-basic]").click();
      if (k === "about") return SLH.dom.qs("[data-about]").click();
      const el = SLH.dom.qs("#sec-" + k);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const f = el.querySelector("input, [data-add]");
        if (f) f.focus({ preventScroll: true });
      }
    }

    if (t("[data-reset]")) {
      openForm({
        title: "Delete profile data?",
        message: "Your profile information in this browser will be cleared. Your account stays.",
        cta: "Delete data",
        danger: true,
        onSave: () => {
          p = SLH.profile.createFor(user.id, { name: user.name });
          commit("Profile data cleared.");
        }
      });
    }
  });

  root.addEventListener("submit", (e) => {
    const f = e.target.closest("[data-chip-form]");
    if (!f) return;
    e.preventDefault();
    const k = f.dataset.chipForm;
    const input = f.querySelector("input");
    const v = input.value.trim();
    if (v && !p[k].some((x) => x.toLowerCase() === v.toLowerCase())) {
      p[k].push(v);
    }
    commit();
  });

  root.addEventListener("change", (e) => {
    if (e.target.id === "lvl") {
      p.level = e.target.value;
      S.save(p);
      SLH.toast.show("Saved.", { tone: "success", duration: 1500 });
    }
    if (e.target.id === "hrs") {
      p.hoursPerWeek = Number(e.target.value);
      S.save(p);
    }
    if (e.target.id === "avatar-file" && e.target.files[0]) {
      uploadAvatar(e.target.files[0]);
    }
  });

  root.addEventListener("input", (e) => {
    if (e.target.id === "hrs") {
      SLH.dom.qs("#hrs-out").textContent = e.target.value;
    }
  });

  /* Resize to 256px so localStorage stays small. */
  function uploadAvatar(file) {
    if (!file.type.startsWith("image/")) return SLH.toast.show("Please choose an image file.", { tone: "error" });
    if (file.size > 5 * 1024 * 1024) return SLH.toast.show("Image is too large (max 5 MB).", { tone: "error" });

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      p.avatar = c.toDataURL("image/jpeg", 0.85);
      commit("Photo updated.");
    };

    img.onerror = () => SLH.toast.show("Could not read that image.", { tone: "error" });
    img.src = url;
  }

  render();
});