/* LEARNING PAGE: choose a major, choose a roadmap, follow the steps, track courses, save your Drive link for past exams.
   Tiny hash router: #overview (default) | #roadmaps | #track/<id> | #majors | #major/<id>
   Data comes from learning.data.js. The user's progress is saved per user in localStorage. */
SLH.dom.ready(function () {
  const user = SLH.auth.getCurrentUser();
  if (!user) return;
  
  const root = SLH.dom.qs("#learn-root");
  const esc = SLH.dom.esc;
  const L = SLH.learn;
  
  let S = L.load(user.id);
  const commit = () => L.save(user.id, S);
  
  const icon = (n) => `<i class="icon" data-icon="${n}"></i>`;
  const KIND = { course: "Course", video: "Video", docs: "Docs", practice: "Practice" };
  const STATUS = [["", "Not started"], ["taking", "Taking now"], ["done", "Done"]];
  const totalHours = (t) => t.steps.reduce((h, s) => h + s[1], 0);

  /* ---------- Router ---------- */
  function route() {
    const parts = (location.hash.replace("#", "") || "overview").split("/");
    const view = parts[0];
    const id = parts[1];
    
    let html;
    if (view === "roadmaps") html = roadmaps();
    else if (view === "track" && L.track(id)) html = trackDetail(L.track(id));
    else if (view === "majors") html = majors();
    else if (view === "major" && L.major(id)) html = majorDetail(L.major(id));
    else html = overview();

    root.innerHTML = tabs(view) + html;
    SLH.icons.render(root);
    bindSearch();
    window.scrollTo(0, 0);
  }

  function tabs(view) {
    const cur = view === "track" ? "roadmaps" : view === "major" ? "majors" : view;
    return `
      <nav class="tabs" aria-label="Learning sections">
        ${[["overview", "Overview"], ["roadmaps", "Roadmaps"], ["majors", "Majors & courses"]]
          .map((t) => `<a href="#${t[0]}" ${cur === t[0] ? 'aria-current="page"' : ""}>${t[1]}</a>`).join("")}
      </nav>
    `;
  }

  /* ---------- Overview ---------- */
  function overview() {
    const t = L.track(S.track);
    const m = L.major(S.major);
    let roadmapCard;

    if (t) {
      const p = L.progress(S, t.id);
      roadmapCard = `
        <section class="card" aria-labelledby="h-rm">
          <div class="card__head">
            <h2 id="h-rm">My roadmap</h2>
            <span class="badge badge--brand">${p.percent}%</span>
          </div>
          <h3 class="text-lg">${esc(t.name)}</h3>
          <div class="progress my-3">
            <span style="--v:${p.percent}%"></span>
          </div>
          <p class="small muted">
            ${p.done} of ${p.total} steps done
            ${p.next ? ` · Next: <b>${esc(p.next.title)}</b>` : " · Roadmap complete 🎉"}
          </p>
          <div class="cluster mt-4">
            <a class="btn btn--primary" href="#track/${t.id}">Continue</a>
            <a class="btn" href="#roadmaps">Change roadmap</a>
          </div>
        </section>
      `;
    } else {
      roadmapCard = `
        <section class="card" aria-labelledby="h-rm">
          <div class="card__head"><h2 id="h-rm">My roadmap</h2></div>
          <div class="empty">
            ${icon("target")}
            <p>You have not chosen a roadmap yet. Pick the skill you want to learn and follow it step by step.</p>
            <a class="btn btn--primary" href="#roadmaps">Choose a roadmap</a>
          </div>
        </section>
      `;
    }

    let majorCard;
    if (m) {
      const cs = Object.values(S.courses);
      const taking = cs.filter((c) => c.status === "taking").length;
      const done = cs.filter((c) => c.status === "done").length;
      
      majorCard = `
        <section class="card" aria-labelledby="h-mj">
          <div class="card__head">
            <h2 id="h-mj">My major</h2>
            <span class="badge">${esc(m.faculty)}</span>
          </div>
          <h3 class="text-lg">${esc(m.name)}</h3>
          <p class="small muted my-3">
            ${m.medical ? "Medical courses and resources will be added later." : `${taking} courses in progress · ${done} done · ${m.courses.length} in total`}
          </p>
          <div class="cluster">
            <a class="btn btn--primary" href="#major/${m.id}">Open my courses</a>
            <a class="btn" href="#majors">Change major</a>
          </div>
        </section>
      `;
    } else {
      majorCard = `
        <section class="card" aria-labelledby="h-mj">
          <div class="card__head"><h2 id="h-mj">My major</h2></div>
          <div class="empty">
            ${icon("cap")}
            <p>Choose your major to see its courses, free lessons and a place for your past exams link.</p>
            <a class="btn btn--primary" href="#majors">Choose my major</a>
          </div>
        </section>
      `;
    }

    const started = Object.keys(S.started).filter((id) => id !== S.track && L.track(id));
    const rec = m && !m.medical ? m.tracks.map(L.track).filter(Boolean) : [];

    return `
      <div class="page-head">
        <div>
          <h1>My Learning</h1>
          <p class="muted">Choose your major and your roadmap, then follow it step by step.</p>
        </div>
      </div>
      <div class="lv-two">${roadmapCard}${majorCard}</div>
      ${rec.length ? `<section class="card mt-5"><div class="card__head"><h2>Recommended for ${esc(m.name)}</h2></div><div class="lv-grid">${rec.map(trackCard).join("")}</div></section>` : ""}
      ${started.length ? `<section class="card mt-5"><div class="card__head"><h2>Other roadmaps you started</h2></div><div class="lv-grid">${started.map((id) => trackCard(L.track(id))).join("")}</div></section>` : ""}
    `;
  }

  /* ---------- Roadmaps ---------- */
  function trackCard(t) {
    const p = L.progress(S, t.id);
    const active = S.track === t.id;
    return `
      <a class="lv-card" href="#track/${t.id}" data-search="${esc((t.name + " " + t.desc + " " + t.group).toLowerCase())}" data-group="${esc(t.group)}">
        <span class="pillar__icon">${icon(t.icon)}</span>
        <span>
          <h3>${esc(t.name)}</h3>
          <p>${esc(t.desc)}</p>
          <span class="badge badge--brand">${esc(t.level)}</span>
          <span class="badge">~${t.months} months</span>
          ${active ? '<span class="badge badge--accent">Active</span>' : ""}
          ${p.done ? `<span class="progress mt-2"><span style="--v:${p.percent}%"></span></span>` : ""}
        </span>
      </a>
    `;
  }

  function roadmaps() {
    const groups = ["All"].concat(Array.from(new Set(L.TRACKS.map((t) => t.group))));
    return `
      <div class="page-head">
        <div>
          <h1>Roadmaps</h1>
          <p class="muted">Pick one roadmap. Every resource in it is free.</p>
        </div>
      </div>
      ${searchBar("Search roadmaps…", groups)}
      <div class="lv-grid" id="lv-list">${L.TRACKS.map(trackCard).join("")}</div>
      <p class="empty" id="lv-none" hidden>No roadmap matches your search.</p>
    `;
  }

  /* ---------- Roadmap detail ---------- */
  function trackDetail(t) {
    const p = L.progress(S, t.id);
    const active = S.track === t.id;
    return `
      <a class="lv-back" href="#roadmaps">← All roadmaps</a>
      <section class="card lv-hero">
        <span class="pillar__icon">${icon(t.icon)}</span>
        <div class="flex-1 min-w-56">
          <h1>${esc(t.name)}</h1>
          <p>${esc(t.desc)}</p>
          <p class="chips mt-3">
            <span class="badge badge--brand">${esc(t.level)}</span>
            <span class="badge">~${t.months} months</span>
            <span class="badge">~${totalHours(t)} hours</span>
            <span class="badge badge--accent">100% free</span>
          </p>
        </div>
        ${active ? '<span class="badge badge--accent self-start">✓ My active roadmap</span>' : `<button class="btn btn--primary" data-start="${t.id}">Start this roadmap</button>`}
      </section>
      <section class="card mt-5">
        <div class="card__head">
          <h2>Your progress</h2>
          <b>${p.percent}%</b>
        </div>
        <div class="progress">
          <span style="--v:${p.percent}%"></span>
        </div>
        <p class="small muted mt-2">${p.done} of ${p.total} steps · about ${p.hoursLeft} hours left</p>
      </section>
      <ol class="lv-steps reset">
        ${t.steps.map((s, i) => {
          const done = !!S.done[L.stepKey(t.id, i)];
          const next = p.next && p.next.index === i;
          return `
            <li class="lv-step ${done ? "is-done" : ""} ${next ? "is-next" : ""}">
              <label class="lv-check">
                <input type="checkbox" data-step="${t.id}:${i}" ${done ? "checked" : ""}>
                <span class="visually-hidden">Mark step ${i + 1} as done</span>
              </label>
              <div>
                <h3>${i + 1}. ${esc(s[0])} ${next ? '<span class="badge badge--accent">Next</span>' : ""}</h3>
                <p class="small muted">About ${s[1]} hours · free resources</p>
                <ul class="lv-res reset">
                  ${s[2].map((r) => `<li><a href="${esc(r[1])}" target="_blank" rel="noopener noreferrer"><span class="badge">${KIND[r[2]]}</span>${esc(r[0])} ↗</a></li>`).join("")}
                </ul>
              </div>
            </li>
          `;
        }).join("")}
      </ol>
      <section class="card mt-5">
        <div class="card__head"><h2>Where this leads</h2></div>
        <p><b>Roles:</b> ${esc(t.outcome)}</p>
        <p class="mt-2"><b>Final project:</b> ${esc(t.project)}</p>
      </section>
    `;
  }

  /* ---------- Majors ---------- */
  function majorCard(m) {
    const active = S.major === m.id;
    return `
      <a class="lv-card" href="#major/${m.id}" data-search="${esc((m.name + " " + m.faculty).toLowerCase())}" data-group="${esc(m.faculty)}">
        <span class="pillar__icon">${icon(m.medical ? "heart" : "cap")}</span>
        <span>
          <h3>${esc(m.name)}</h3>
          <p>${m.medical ? "Courses and resources coming soon." : `${m.courses.length} courses · ${m.tracks.length} recommended roadmaps`}</p>
          ${active ? '<span class="badge badge--accent">My major</span>' : m.medical ? '<span class="badge">Coming soon</span>' : ""}
        </span>
      </a>
    `;
  }

  function majors() {
    const faculties = Array.from(new Set(L.MAJORS.map((m) => m.faculty)));
    return `
      <div class="page-head">
        <div>
          <h1>Majors & courses</h1>
          <p class="muted">Choose your major to see its courses and free lessons.</p>
        </div>
      </div>
      ${searchBar("Search majors…", ["All"].concat(faculties))}
      <div id="lv-list">
        ${faculties.map((f) => `
          <h2 class="lv-group" data-fgroup="${esc(f)}">${esc(f)}</h2>
          <div class="lv-grid" data-fgroup="${esc(f)}">
            ${L.MAJORS.filter((m) => m.faculty === f).map(majorCard).join("")}
          </div>
        `).join("")}
      </div>
      <p class="empty" id="lv-none" hidden>No major matches your search. More majors will be added.</p>
    `;
  }

  function majorDetail(m) {
    const active = S.major === m.id;
    let body;

    if (m.medical) {
      body = `
        <div class="alert alert--info" role="note">
          ${icon("info")}
          <div>
            <b>Coming soon</b>
            <p>Courses and free resources for medical majors will be added later. You can still set it as your major now.</p>
          </div>
        </div>
      `;
    } else {
      const years = Array.from(new Set(m.courses.map((c) => c[1])));
      body = `
        ${m.tracks.length ? `<section class="card"><div class="card__head"><h2>Recommended roadmaps</h2></div><p class="small muted mb-4">Skills that go well with this major.</p><div class="lv-grid">${m.tracks.map((id) => trackCard(L.track(id))).join("")}</div></section>` : ""}
        ${years.map((y) => `<section class="card mt-5"><div class="card__head"><h2>Year ${y}</h2></div>${m.courses.filter((c) => c[1] === y).map((c) => courseRow(m, c[0])).join("")}</section>`).join("")}
        <p class="small muted mt-4">Course names are a general guide. Your university may name them differently. Lesson links open free searches on trusted learning sites.</p>
      `;
    }

    return `
      <a class="lv-back" href="#majors">← All majors</a>
      <section class="card lv-hero">
        <span class="pillar__icon">${icon(m.medical ? "heart" : "cap")}</span>
        <div class="flex-1 min-w-56">
          <h1>${esc(m.name)}</h1>
          <p>${esc(m.faculty)}${m.medical ? "" : ` · ${m.courses.length} courses`}</p>
        </div>
        ${active ? '<span class="badge badge--accent self-start">✓ My major</span>' : `<button class="btn btn--primary" data-setmajor="${m.id}">Set as my major</button>`}
      </section>
      <div class="mt-5">${body}</div>
    `;
  }

  function courseRow(m, name) {
    const k = L.courseKey(m.id, name);
    const c = S.courses[k] || { status: "", drive: "" };
    return `
      <div class="lv-course">
        <div class="lv-course__main">
          <h3>${esc(name)}</h3>
          <div class="lv-links">
            ${L.lessonLinks(name).map((l) => `<a href="${esc(l[1])}" target="_blank" rel="noopener noreferrer">${esc(l[0])} ↗</a>`).join("")}
          </div>
        </div>
        <div class="lv-course__side">
          <label class="visually-hidden" for="st-${esc(k)}">Status of ${esc(name)}</label>
          <select class="select" id="st-${esc(k)}" data-status="${esc(k)}">
            ${STATUS.map((s) => `<option value="${s[0]}" ${c.status === s[0] ? "selected" : ""}>${s[1]}</option>`).join("")}
          </select>
          <div class="cluster" style="gap:.4rem">
            ${c.drive 
              ? `<a class="btn btn--sm" href="${esc(c.drive)}" target="_blank" rel="noopener noreferrer">${icon("folder")}Past exams ↗</a><button class="btn btn--sm btn--ghost" data-drive="${esc(k)}|${esc(name)}">Edit link</button>` 
              : `<button class="btn btn--sm" data-drive="${esc(k)}|${esc(name)}">${icon("folder")}Add past exams link</button>`}
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- Search + filter ---------- */
  function searchBar(ph, groups) {
    return `
      <div class="lv-tools">
        <label class="visually-hidden" for="lv-q">Search</label>
        <input class="input" id="lv-q" type="search" placeholder="${esc(ph)}" autocomplete="off">
        <div class="chips" role="group" aria-label="Filter">
          ${groups.map((g, i) => `<button type="button" class="chip ${i === 0 ? "chip--brand" : ""}" data-filter="${esc(g)}" aria-pressed="${i === 0}">${esc(g)}</button>`).join("")}
        </div>
      </div>
    `;
  }

  function bindSearch() {
    const q = SLH.dom.qs("#lv-q");
    if (!q) return;
    let group = "All";

    const apply = () => {
      const term = q.value.trim().toLowerCase();
      let shown = 0;
      
      SLH.dom.qsa(".lv-card").forEach((c) => {
        const ok = (group === "All" || c.dataset.group === group) && (!term || c.dataset.search.includes(term));
        c.hidden = !ok;
        if (ok) shown++;
      });
      
      SLH.dom.qsa("[data-fgroup]").forEach((h) => {
        if (h.classList.contains("lv-group")) {
          const grid = h.nextElementSibling;
          h.hidden = grid.querySelectorAll(".lv-card:not([hidden])").length === 0;
        }
      });
      
      SLH.dom.qs("#lv-none").hidden = shown > 0;
    };

    q.addEventListener("input", apply);
    SLH.dom.qsa("[data-filter]").forEach((b) => b.addEventListener("click", () => {
      group = b.dataset.filter;
      SLH.dom.qsa("[data-filter]").forEach((x) => {
        const on = x === b;
        x.classList.toggle("chip--brand", on);
        x.setAttribute("aria-pressed", String(on));
      });
      apply();
    }));
  }

  /* ---------- Actions (event delegation) ---------- */
  root.addEventListener("click", (e) => {
    const start = e.target.closest("[data-start]");
    if (start) {
      S.track = start.dataset.start;
      S.started[S.track] = true;
      commit();
      SLH.toast.show("Roadmap started. It now shows on your home page.", { tone: "success" });
      route();
      return;
    }
    const sm = e.target.closest("[data-setmajor]");
    if (sm) {
      const m = L.major(sm.dataset.setmajor);
      S.major = m.id;
      commit();
      const p = SLH.profile.get(user.id);
      if (p) {
        p.major = m.name;
        p.faculty = m.faculty;
        SLH.profile.save(p);
      }
      SLH.toast.show(`${m.name} is now your major (also updated on your profile).`, { tone: "success" });
      route();
      return;
    }
    const dr = e.target.closest("[data-drive]");
    if (dr) {
      const parts = dr.dataset.drive.split("|");
      openDrive(parts[0], parts[1]);
    }
  });

  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-step]")) {
      const [tid, i] = e.target.dataset.step.split(":");
      const k = L.stepKey(tid, i);
      if (e.target.checked) {
        S.done[k] = true;
        S.started[tid] = true;
      } else {
        delete S.done[k];
      }
      commit();
      const y = window.scrollY;
      route();
      window.scrollTo(0, y);
      if (e.target.checked) SLH.toast.show("Step completed. Keep going!", { tone: "success" });
    } else if (e.target.matches("[data-status]")) {
      const k = e.target.dataset.status;
      S.courses[k] = Object.assign({ status: "", drive: "" }, S.courses[k], { status: e.target.value });
      commit();
    }
  });

  /* Past exams: the student pastes their own Google Drive folder link. We only accept http(s) links. */
  const dlg = document.createElement("dialog");
  dlg.className = "modal";
  document.body.appendChild(dlg);

  function openDrive(k, name) {
    const cur = (S.courses[k] && S.courses[k].drive) || "";
    dlg.innerHTML = `
      <form method="dialog" novalidate>
        <div class="modal__head">
          <h2 class="text-xl">Past exams: ${esc(name)}</h2>
          <button type="button" class="btn btn--ghost btn--icon" data-close aria-label="Close">${icon("x")}</button>
        </div>
        <div class="modal__body">
          <p class="small muted">Paste the Google Drive link of the folder or file that holds past exams for this course. Share it only if you are allowed to.</p>
          <div class="field">
            <label class="field__label" for="dl">Drive link</label>
            <input class="input" id="dl" inputmode="url" placeholder="https://drive.google.com/…" value="${esc(cur)}" maxlength="300">
            <p class="field__error"></p>
          </div>
        </div>
        <div class="modal__foot">
          ${cur ? '<button type="button" class="btn btn--danger" data-remove>Remove</button>' : ""}
          <button type="button" class="btn" data-close>Cancel</button>
          <button class="btn btn--primary" type="submit">Save</button>
        </div>
      </form>
    `;
    SLH.icons.render(dlg);
    dlg.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => dlg.close()));
    
    const rm = dlg.querySelector("[data-remove]");
    if (rm) rm.addEventListener("click", () => { saveDriveLink(k, ""); dlg.close(); });
    
    dlg.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      const input = dlg.querySelector("#dl");
      const v = input.value.trim();
      const safe = SLH.profile.safeUrl(v);
      if (!v || !safe) {
        SLH.form.setError(input, "Enter a valid link starting with https://");
        return;
      }
      saveDriveLink(k, safe);
      dlg.close();
    };

    dlg.showModal();
    dlg.querySelector("#dl").focus();
  }

  function saveDriveLink(k, drive) {
    S.courses[k] = Object.assign({ status: "", drive: "" }, S.courses[k], { drive });
    commit();
    SLH.toast.show(drive ? "Link saved." : "Link removed.", { tone: "success" });
    const y = window.scrollY;
    route();
    window.scrollTo(0, y);
  }

  window.addEventListener("hashchange", route);
  route();
});