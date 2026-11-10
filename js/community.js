SLH.dom.ready(function () {
  const user = SLH.auth.getCurrentUser();
  if (!user) return;

  const root = SLH.dom.qs("#community-root");
  const esc = SLH.dom.esc;
  const icon = (n) => '<i class="icon" data-icon="' + n + '"></i>';

  const GROUPS = [
    { id: "g1", name: "Database Study Group", topic: "SQL, ERD, normalization", members: 128, when: "Sundays 5:00 PM · Online" },
    { id: "g2", name: "Frontend Builders", topic: "HTML, CSS, JavaScript projects", members: 241, when: "Wednesdays 7:00 PM · Online" },
    { id: "g3", name: "Python for Beginners", topic: "Learn Python together", members: 306, when: "Mondays 6:00 PM · Online" },
    { id: "g4", name: "Cyber Club CTF Team", topic: "CTF practice and write-ups", members: 74, when: "Fridays 8:00 PM · Online" },
    { id: "g5", name: "Business & Startup Circle", topic: "Ideas, pitches, feedback", members: 96, when: "Thursdays 4:00 PM · Campus" },
    { id: "g6", name: "Exam Prep Buddies", topic: "Share past-exam solutions and tips", members: 412, when: "Daily · Chat" }
  ];

  const SAMPLE_Q = [
    { id: "q1", by: "Nour (demo)", text: "How do you stay consistent with a study schedule during exam weeks?", replies: ["Plan 2 focus blocks a day and never skip the break. Pomodoro helped me a lot.", "Start with the hardest course in the morning."] },
    { id: "q2", by: "Omar (demo)", text: "Should I learn React before finishing JavaScript fundamentals?", replies: ["Finish arrays, objects, functions and async first. React becomes much easier."] },
    { id: "q3", by: "Salma (demo)", text: "Where can I find past exams for the database course?", replies: ["Check your major page in My Learning and add your Drive link there."] }
  ];

  const gkey = "groups:" + user.id;
  const qkey = "questions:" + user.id;
  let joined = SLH.storage.get(gkey, []);
  let mine = SLH.storage.get(qkey, []);

  function render() {
    const all = mine.concat(SAMPLE_Q);
    root.innerHTML = '<div class="lv-two lv-two--wide"><section aria-labelledby="c-groups"><div class="card__head"><h2 id="c-groups">Study groups</h2><span class="badge">' + joined.length + ' joined</span></div><ul class="lv-list reset">' +
      GROUPS.map((g) => {
        const on = joined.includes(g.id);
        return '<li class="card lv-opp"><span class="pillar__icon" style="margin:0">' + icon("users") + '</span><div style="min-width:0;flex:1"><h3>' + esc(g.name) + '</h3><p class="small muted">' + esc(g.topic) + '</p><p class="small muted">' + (g.members + (on ? 1 : 0)) + " members · " + esc(g.when) + '</p></div><div class="lv-actions"><button class="btn btn--sm' + (on ? "" : " btn--primary") + '" data-join="' + g.id + '" aria-pressed="' + on + '">' + (on ? "✓ Joined" : "Join") + "</button></div></li>";
      }).join("") + "</ul></section>" +
      '<section aria-labelledby="c-q"><div class="card__head"><h2 id="c-q">Questions</h2></div><form class="card" id="q-form" novalidate style="margin-bottom:1rem"><div class="field"><label class="field__label" for="q-text">Ask the community</label><textarea class="textarea" id="q-text" rows="3" maxlength="300" placeholder="What are you stuck on?"></textarea><p class="field__error"></p></div><button class="btn btn--primary btn--sm">Post question</button></form><ul class="lv-list reset">' +
      all.map((q) => '<li class="card"><p class="small muted">' + esc(q.by || "You") + (q.mine ? ' · <button class="btn btn--ghost btn--sm" data-qdel="' + q.id + '">Delete</button>' : "") + '</p><h3 style="font-size:1.02rem;margin-block:.25rem .6rem">' + esc(q.text) + "</h3>" + (q.replies.length ? '<div class="replies">' + q.replies.map((r) => "<p>" + esc(r) + "</p>").join("") + "</div>" : '<p class="small muted">No replies yet. Replies arrive when the community backend is connected.</p>') + "</li>").join("") + "</ul></section></div>";
    
    SLH.icons.render(root);
  }

  root.addEventListener("click", (e) => {
    const j = e.target.closest("[data-join]");
    const d = e.target.closest("[data-qdel]");

    if (j) {
      const id = j.dataset.join;
      if (joined.includes(id)) {
        joined = joined.filter((x) => x !== id);
      } else {
        joined.push(id);
        SLH.toast.show("You joined the group.", { tone: "success" });
      }
      SLH.storage.set(gkey, joined);
      render();
    } else if (d) {
      mine = mine.filter((q) => q.id !== d.dataset.qdel);
      SLH.storage.set(qkey, mine);
      render();
    }
  });

  root.addEventListener("submit", (e) => {
    if (e.target.id !== "q-form") return;
    e.preventDefault();

    const input = SLH.dom.qs("#q-text");
    const v = input.value.trim();

    if (v.length < 8) {
      SLH.form.setError(input, "Write at least 8 characters.");
      return;
    }

    mine.unshift({ id: SLH.profile.uid(), by: "You", text: v, replies: [], mine: true });
    SLH.storage.set(qkey, mine);
    render();
    SLH.toast.show("Question posted.", { tone: "success" });
  });

  render();
});