SLH.dom.ready(function () {
  const user = SLH.auth.getCurrentUser();
  if (!user) return;

  const root = SLH.dom.qs("#dash");
  const esc = SLH.dom.esc;
  const D = SLH.data;
  const g = D.gamification;
  const LS = SLH.learn.load(user.id);
  const myTrack = SLH.learn.track(LS.track);
  const myMajor = SLH.learn.major(LS.major);
  const profile = SLH.profile.get(user.id);
  const mySk = ((profile && profile.skills) || []).map((x) => x.toLowerCase());
  
  const score = (o) => (mySk.length ? Math.round((o.skills.filter((k) => mySk.includes(k.toLowerCase())).length / o.skills.length) * 100) : null);
  const LP = myTrack ? SLH.learn.progress(LS, myTrack.id) : null;
  const tkey = "tasks:" + user.id;
  
  let tasks = SLH.storage.get(tkey, D.defaultTasks);
  const first = (user.name || "there").split(" ")[0];
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const comp = SLH.profile.completion(profile);

  root.innerHTML = '<div class="dash"><span class="skeleton" style="height:11rem;border-radius:24px"></span><span class="skeleton" style="height:5rem"></span><span class="skeleton" style="height:18rem"></span></div>';
  setTimeout(render, 350);

  function render() {
    const open = tasks.filter((t) => !t.done).length;
    root.innerHTML = '<div class="dash">' +
      '<section class="welcome" aria-labelledby="hi"><div><p class="small">' + new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) + '</p><h1 id="hi">' + hello + ", " + esc(first) + ' 👋</h1><p>Here\'s what your student journey looks like today.</p></div>' +
      '<div class="welcome__stats">' +
      '<div class="stat"><b>' + g.xp.toLocaleString() + '</b><span>XP · Level ' + g.level + " " + esc(g.levelName) + '</span><div class="progress"><span style="--v:' + Math.round((g.xp / g.nextXp) * 100) + '%"></span></div></div>' +
      '<div class="stat"><b>🔥 ' + g.streak + '</b><span>day streak</span></div>' +
      '<div class="stat"><b id="open-count">' + open + '</b><span>tasks left today</span></div>' +
      (myTrack ? '<a class="stat stat--link" href="learning.html#track/' + myTrack.id + '"><b>' + LP.percent + '%</b><span>' + esc(myTrack.name) + '</span><div class="progress"><span style="--v:' + LP.percent + '%"></span></div></a>' : '<a class="stat stat--link" href="learning.html#roadmaps"><b>＋</b><span>Choose your roadmap</span></a>') + '</div></section>' +

      '<nav class="quick" aria-label="Quick actions">' +
      [["book", "Continue learning", "learning.html"], ["target", "Find opportunities", "opportunities.html"], ["plus", "Add task", "#task-input"], ["calendar", "Join event", "events.html"], ["timer", "Start Pomodoro", "tools.html"], ["sparkles", "Ask AI", "assistant.html"]]
        .map((q) => '<a href="' + q[2] + '"><i class="icon" data-icon="' + q[0] + '"></i>' + q[1] + "</a>").join("") + "</nav>" +

      '<div class="dash__cols"><div>' +
      (myTrack ?
        '<section class="card" aria-labelledby="h-learn"><div class="card__head"><h2 id="h-learn">Continue learning</h2><a class="btn btn--primary btn--sm" href="learning.html#track/' + myTrack.id + '">Resume</a></div>' +
        '<p class="muted small">' + esc(myTrack.name) + (LP.next ? " · next step: <b>" + esc(LP.next.title) + "</b>" : " · all steps done") + '</p>' +
        '<ol class="chips reset" style="margin-block:1rem">' + myTrack.steps.map((st, i) => { const d = !!LS.done[SLH.learn.stepKey(myTrack.id, i)], nx = LP.next && LP.next.index === i; return '<li class="chip ' + (d ? "chip--brand" : "") + '" ' + (nx ? 'style="border-color:var(--brand-text);color:var(--brand-text);font-weight:600"' : "") + ">" + (d ? "✓ " : "") + esc(st[0]) + "</li>"; }).join("") + "</ol>" +
        '<div class="progress"><span style="--v:' + LP.percent + '%"></span></div><p class="small muted" style="margin-top:.6rem">' + LP.done + " of " + LP.total + " steps · about " + LP.hoursLeft + " hours left</p></section>"
      : '<section class="card" aria-labelledby="h-learn"><div class="card__head"><h2 id="h-learn">Start learning</h2></div><div class="empty"><i class="icon" data-icon="target"></i><p>' + (myMajor ? "Major: <b>" + esc(myMajor.name) + "</b>. " : "") + 'Choose a roadmap and your next steps will show here.</p><div class="cluster" style="justify-content:center"><a class="btn btn--primary" href="learning.html#roadmaps">Choose a roadmap</a>' + (myMajor ? "" : '<a class="btn" href="learning.html#majors">Choose my major</a>') + "</div></div></section>") +
      
      '<section class="card" aria-labelledby="h-sched"><div class="card__head"><h2 id="h-sched">Today\'s schedule</h2><span class="badge">Demo</span></div><ul class="schedule reset" style="margin:0">' +
      D.schedule.map((s) => '<li><time>' + s.time + '</time><div class="slot ' + (s.done ? "slot--done" : "") + '"><strong>' + esc(s.title) + "</strong><span>" + esc(s.note) + "</span></div></li>").join("") + "</ul></section>" +
      
      '<section class="card" aria-labelledby="h-opp"><div class="card__head"><h2 id="h-opp">Matched for you</h2><a class="small" style="color:var(--brand-text)" href="opportunities.html">All</a></div>' +
      D.opportunities.slice().sort((a, b) => (score(b) || 0) - (score(a) || 0)).slice(0, 3).map((o) => '<a class="opp-row" href="opportunities.html"><div class="score"><b>' + (score(o) === null ? "–" : score(o)) + '</b><span>%</span></div><div style="flex:1;min-width:0"><strong>' + esc(o.title) + '</strong><span class="small muted">' + esc(o.org) + " · due " + esc(o.deadline) + '</span></div><span class="badge badge--brand">' + esc(o.type) + "</span></a>").join("") + "</section>" +
      '</div><div>' +
      
      '<section class="card" aria-labelledby="h-tasks"><div class="card__head"><h2 id="h-tasks">Tasks</h2></div><ul class="tasklist" id="tasklist"></ul>' +
      '<form class="mini-add" id="task-form"><label class="visually-hidden" for="task-input">New task</label><input class="input" id="task-input" placeholder="Add a task…" maxlength="120" autocomplete="off"><button class="btn btn--primary btn--icon" aria-label="Add task"><i class="icon" data-icon="plus"></i></button></form></section>' +
      
      (comp.percent < 100 ? '<section class="card" aria-labelledby="h-comp"><div class="card__head"><h2 id="h-comp">Complete your profile</h2><b>' + comp.percent + '%</b></div><div class="progress progress--accent"><span style="--v:' + comp.percent + '%"></span></div><p class="small muted" style="margin:.75rem 0">Next: ' + esc(comp.missing[0].label) + '</p><a class="btn btn--sm" href="profile.html">Open profile</a></section>' : "") +
      
      '<section class="card" aria-labelledby="h-xp"><div class="card__head"><h2 id="h-xp">Progress</h2><span class="badge badge--accent">Level ' + g.level + '</span></div><p class="small muted" style="margin-bottom:.5rem">This week</p><div class="week" aria-label="Weekly activity">' +
      ["M", "T", "W", "T", "F", "S", "S"].map((d, i) => '<span class="' + (g.week[i] ? "on" : "") + '">' + d + "</span>").join("") + '</div><div class="badges" style="margin-top:1rem">' +
      g.badges.map((b) => '<div class="achv ' + (b[2] ? "" : "achv--off") + '"><i class="icon" data-icon="' + b[0] + '"></i>' + esc(b[1]) + "</div>").join("") + "</div></section>" +
      
      '<section class="card" aria-labelledby="h-ev"><div class="card__head"><h2 id="h-ev">Upcoming events</h2><a class="small" style="color:var(--brand-text)" href="events.html">All</a></div>' +
      D.events.slice(0, 3).map((e) => '<a class="opp-row" href="events.html"><div class="date-tile" style="width:3rem;height:3rem"><span style="font-size:.65rem">' + e.m + "</span><b style=\"font-size:1.05rem\">" + e.d + '</b></div><div style="flex:1;min-width:0"><strong>' + esc(e.title) + '</strong><span class="small muted">' + esc(e.time) + " · " + esc(e.place) + "</span></div></a>").join("") + "</section>" +
      
      '<section class="card ai-prev" aria-labelledby="h-ai"><div class="card__head" style="margin:0"><h2 id="h-ai">AI Assistant</h2><span class="badge">Preview</span></div><div class="bubble bubble--user">What should I learn next?</div><div class="bubble bubble--ai">Preview only. When the assistant is connected, it will use your track and progress to answer.</div><a class="btn btn--sm" href="assistant.html">Open assistant</a></section>' +
      "</div></div></div>";

    SLH.icons.render(root);
    drawTasks();

    SLH.dom.qs("#task-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const i = SLH.dom.qs("#task-input");
      const text = i.value.trim();
      if (!text) return;
      tasks.unshift({ id: SLH.profile.uid(), text, due: "Today", done: false });
      i.value = "";
      persist();
      drawTasks();
    });
  }

  function persist() {
    SLH.storage.set(tkey, tasks);
    const c = SLH.dom.qs("#open-count");
    if (c) c.textContent = tasks.filter((t) => !t.done).length;
  }

  function drawTasks() {
    const ul = SLH.dom.qs("#tasklist");
    if (!tasks.length) {
      ul.innerHTML = '<li class="empty">No tasks yet. Add your first one below.</li>';
      return;
    }
    
    ul.innerHTML = tasks.map((t) => '<li class="task ' + (t.done ? "done" : "") + '"><input type="checkbox" id="' + t.id + '" ' + (t.done ? "checked" : "") + '><label for="' + t.id + '">' + esc(t.text) + '</label><small>' + esc(t.due) + '</small><button class="btn btn--ghost btn--icon btn--sm" data-del="' + t.id + '" aria-label="Delete task"><i class="icon" data-icon="trash"></i></button></li>').join("");
    
    SLH.icons.render(ul);
    
    ul.onchange = (e) => {
      const t = tasks.find((x) => x.id === e.target.id);
      if (t) {
        t.done = e.target.checked;
        persist();
        drawTasks();
        if (t.done) SLH.toast.show("Nice work. Task completed.", { tone: "success" });
      }
    };
    
    ul.onclick = (e) => {
      const b = e.target.closest("[data-del]");
      if (b) {
        tasks = tasks.filter((x) => x.id !== b.dataset.del);
        persist();
        drawTasks();
      }
    };
  }
});