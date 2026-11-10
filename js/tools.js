/* TOOLS PAGE: to-do list (shared with the dashboard), Pomodoro timer, GPA calculator, quick notes. All saved per user. */
SLH.dom.ready(function () {
  const user = SLH.auth.getCurrentUser(); if (!user) return;
  const root = SLH.dom.qs("#tools-root"), esc = SLH.dom.esc, icon = (n) => '<i class="icon" data-icon="' + n + '"></i>';
  const tkey = "tasks:" + user.id, nkey = "notes:" + user.id, gkey = "gpa:" + user.id;
  let tasks = SLH.storage.get(tkey, SLH.data.defaultTasks);

  root.innerHTML = '<div class="lv-tools-grid">' +
    '<section class="card" aria-labelledby="t-todo"><div class="card__head"><h2 id="t-todo">To-do list</h2><span class="badge" id="t-count"></span></div><ul class="tasklist" id="t-list"></ul><form class="mini-add" id="t-form"><label class="visually-hidden" for="t-in">New task</label><input class="input" id="t-in" placeholder="Add a task…" maxlength="120" autocomplete="off"><button class="btn btn--primary btn--icon" aria-label="Add task">' + icon("plus") + "</button></form></section>" +
    '<section class="card" aria-labelledby="t-pomo"><div class="card__head"><h2 id="t-pomo">Pomodoro timer</h2></div><div class="chips" role="group" aria-label="Timer mode" style="justify-content:center"><button class="chip chip--brand" data-mode="25" aria-pressed="true">Focus 25</button><button class="chip" data-mode="5" aria-pressed="false">Short break 5</button><button class="chip" data-mode="15" aria-pressed="false">Long break 15</button></div><p class="pomo" id="p-time" role="timer" aria-live="off">25:00</p><div class="cluster" style="justify-content:center"><button class="btn btn--primary" id="p-start">Start</button><button class="btn" id="p-reset">Reset</button></div><p class="small muted" style="text-align:center;margin-top:.75rem">Completed focus sessions today: <b id="p-done">0</b></p></section>' +
    '<section class="card" aria-labelledby="t-gpa"><div class="card__head"><h2 id="t-gpa">GPA calculator</h2><span class="badge">4.0 scale</span></div><div id="g-rows"></div><div class="cluster" style="margin-top:.75rem"><button class="btn btn--sm" id="g-add">' + icon("plus") + 'Add course</button></div><p class="gpa" id="g-out"></p></section>' +
    '<section class="card" aria-labelledby="t-notes"><div class="card__head"><h2 id="t-notes">Quick notes</h2><span class="small muted" id="n-state">Saved</span></div><label class="visually-hidden" for="n-text">Notes</label><textarea class="textarea" id="n-text" rows="9" maxlength="5000" placeholder="Write anything: ideas, deadlines, things to ask your professor…"></textarea></section></div>';
  SLH.icons.render(root);

  /* ----- To-do ----- */
  const list = SLH.dom.qs("#t-list");
  function drawTasks() {
    SLH.dom.qs("#t-count").textContent = tasks.filter((t) => !t.done).length + " left";
    list.innerHTML = tasks.length ? tasks.map((t) => '<li class="task ' + (t.done ? "done" : "") + '"><input type="checkbox" id="k' + t.id + '" data-t="' + t.id + '"' + (t.done ? " checked" : "") + '><label for="k' + t.id + '">' + esc(t.text) + "</label><small>" + esc(t.due) + '</small><button class="btn btn--ghost btn--icon btn--sm" data-del="' + t.id + '" aria-label="Delete task">' + icon("trash") + "</button></li>").join("") : '<li class="empty">No tasks yet.</li>';
    SLH.icons.render(list);
  }
  list.addEventListener("change", (e) => { const t = tasks.find((x) => x.id === e.target.dataset.t); if (t) { t.done = e.target.checked; SLH.storage.set(tkey, tasks); drawTasks(); } });
  list.addEventListener("click", (e) => { const b = e.target.closest("[data-del]"); if (b) { tasks = tasks.filter((x) => x.id !== b.dataset.del); SLH.storage.set(tkey, tasks); drawTasks(); } });
  SLH.dom.qs("#t-form").addEventListener("submit", (e) => { e.preventDefault(); const i = SLH.dom.qs("#t-in"), v = i.value.trim(); if (!v) return; tasks.unshift({ id: SLH.profile.uid(), text: v, due: "Today", done: false }); i.value = ""; SLH.storage.set(tkey, tasks); drawTasks(); });
  drawTasks();

  /* ----- Pomodoro ----- */
  let minutes = 25, left = 25 * 60, timer = null, sessions = 0;
  const time = SLH.dom.qs("#p-time"), startBtn = SLH.dom.qs("#p-start");
  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  const paint = () => { time.textContent = fmt(left); document.title = (timer ? fmt(left) + " · " : "") + "Tools | Student Life Hub"; };
  function stop() { clearInterval(timer); timer = null; startBtn.textContent = "Start"; paint(); }
  startBtn.addEventListener("click", () => {
    if (timer) { stop(); return; }
    startBtn.textContent = "Pause";
    timer = setInterval(() => {
      left--; paint();
      if (left <= 0) { stop(); if (minutes === 25) { sessions++; SLH.dom.qs("#p-done").textContent = sessions; } left = minutes * 60; paint(); SLH.toast.show(minutes === 25 ? "Focus session done. Take a break!" : "Break over. Ready to focus?", { tone: "success", duration: 8000 }); }
    }, 1000);
  });
  SLH.dom.qs("#p-reset").addEventListener("click", () => { stop(); left = minutes * 60; paint(); });
  SLH.dom.qsa("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    minutes = Number(b.dataset.mode); stop(); left = minutes * 60; paint();
    SLH.dom.qsa("[data-mode]").forEach((x) => { x.classList.toggle("chip--brand", x === b); x.setAttribute("aria-pressed", String(x === b)); });
  }));

  /* ----- GPA ----- */
  const GRADES = [["A+", 4], ["A", 4], ["A-", 3.7], ["B+", 3.3], ["B", 3], ["B-", 2.7], ["C+", 2.3], ["C", 2], ["C-", 1.7], ["D+", 1.3], ["D", 1], ["F", 0]];
  let rows = SLH.storage.get(gkey, [{ name: "", credits: 3, grade: "A" }, { name: "", credits: 3, grade: "B+" }]);
  const gRows = SLH.dom.qs("#g-rows");
  function drawGpa() {
    gRows.innerHTML = rows.map((r, i) => '<div class="gpa-row"><label class="visually-hidden" for="gn' + i + '">Course name</label><input class="input" id="gn' + i + '" data-g="name:' + i + '" placeholder="Course" maxlength="40" value="' + esc(r.name) + '"><label class="visually-hidden" for="gc' + i + '">Credit hours</label><input class="input" id="gc' + i + '" type="number" min="0" max="12" step="0.5" data-g="credits:' + i + '" value="' + esc(r.credits) + '"><label class="visually-hidden" for="gg' + i + '">Grade</label><select class="select" id="gg' + i + '" data-g="grade:' + i + '">' + GRADES.map((g) => "<option" + (g[0] === r.grade ? " selected" : "") + ">" + g[0] + "</option>").join("") + '</select><button class="btn btn--ghost btn--icon btn--sm" data-grm="' + i + '" aria-label="Remove course">' + icon("trash") + "</button></div>").join("");
    SLH.icons.render(gRows); calc();
  }
  function calc() {
    let pts = 0, cr = 0; rows.forEach((r) => { const c = Number(r.credits) || 0, g = GRADES.find((x) => x[0] === r.grade); pts += c * (g ? g[1] : 0); cr += c; });
    SLH.dom.qs("#g-out").innerHTML = cr ? "Your GPA: <b>" + (pts / cr).toFixed(2) + "</b> <span class='small muted'>(" + cr + " credit hours)</span>" : "Add credit hours to see your GPA.";
  }
  gRows.addEventListener("input", (e) => { const d = e.target.dataset.g; if (!d) return; const [f, i] = d.split(":"); rows[i][f] = e.target.value; SLH.storage.set(gkey, rows); calc(); });
  gRows.addEventListener("click", (e) => { const b = e.target.closest("[data-grm]"); if (b) { rows.splice(Number(b.dataset.grm), 1); SLH.storage.set(gkey, rows); drawGpa(); } });
  SLH.dom.qs("#g-add").addEventListener("click", () => { rows.push({ name: "", credits: 3, grade: "A" }); SLH.storage.set(gkey, rows); drawGpa(); });
  drawGpa();

  /* ----- Notes (autosave) ----- */
  const note = SLH.dom.qs("#n-text"); note.value = SLH.storage.get(nkey, ""); let nt;
  note.addEventListener("input", () => { SLH.dom.qs("#n-state").textContent = "Saving…"; clearTimeout(nt); nt = setTimeout(() => { SLH.storage.set(nkey, note.value); SLH.dom.qs("#n-state").textContent = "Saved"; }, 400); });
});
