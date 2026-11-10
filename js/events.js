/* EVENTS PAGE: browse, filter by type, register ("Going"). Registering also adds a reminder task to your to-do list. */
SLH.dom.ready(function () {
  const user = SLH.auth.getCurrentUser(); if (!user) return;
  const root = SLH.dom.qs("#events-root"), esc = SLH.dom.esc, list = SLH.data.events;
  const key = "events:" + user.id, tkey = "tasks:" + user.id;
  let going = SLH.storage.get(key, []), type = "All";
  const types = ["All"].concat(Array.from(new Set(list.map((e) => e.type))));

  function addReminder(ev) {
    const tasks = SLH.storage.get(tkey, SLH.data.defaultTasks), text = "Attend: " + ev.title;
    if (!tasks.some((t) => t.text === text)) { tasks.unshift({ id: SLH.profile.uid(), text, due: ev.m + " " + ev.d, done: false }); SLH.storage.set(tkey, tasks); }
  }
  function render() {
    const items = list.filter((e) => type === "All" || e.type === type);
    root.innerHTML = '<div class="chips" role="group" aria-label="Event type" style="margin-bottom:1.25rem">' + types.map((t) => '<button type="button" class="chip' + (t === type ? " chip--brand" : "") + '" data-type="' + esc(t) + '" aria-pressed="' + (t === type) + '">' + esc(t) + "</button>").join("") + "</div>" +
      (going.length ? '<p class="small muted" style="margin-bottom:1rem">You are going to <b>' + going.length + "</b> event" + (going.length > 1 ? "s" : "") + ".</p>" : "") +
      '<ul class="lv-list reset">' + items.map((e) => {
        const on = going.includes(e.title);
        return '<li class="card lv-opp"><div class="date-tile"><span>' + esc(e.m) + "</span><b>" + esc(e.d) + '</b></div><div style="min-width:0;flex:1"><span class="badge ' + (e.type === "Hackathon" ? "badge--accent" : "badge--brand") + '">' + esc(e.type) + "</span><h3>" + esc(e.title) + '</h3><p class="small muted">' + esc(e.time) + " · " + esc(e.place) + " · hosted by " + esc(e.host) + '</p></div><div class="lv-actions"><button class="btn btn--sm' + (on ? "" : " btn--primary") + '" data-go="' + esc(e.title) + '" aria-pressed="' + on + '">' + (on ? "✓ Going (cancel)" : "I'm going") + "</button></div></li>";
      }).join("") + "</ul>";
    SLH.icons.render(root);
  }
  root.addEventListener("click", (e) => {
    const t = e.target.closest("[data-type]"), g = e.target.closest("[data-go]");
    if (t) { type = t.dataset.type; render(); }
    else if (g) {
      const title = g.dataset.go, ev = list.find((x) => x.title === title);
      if (going.includes(title)) going = going.filter((x) => x !== title);
      else { going.push(title); addReminder(ev); SLH.toast.show("You're going! A reminder was added to your tasks.", { tone: "success" }); }
      SLH.storage.set(key, going); render();
    }
  });
  render();
});
