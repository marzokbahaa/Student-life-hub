SLH.dom.ready(function () {
  const user = SLH.auth.getCurrentUser();
  if (!user) return;

  const root = SLH.dom.qs("#assistant-root");
  const esc = SLH.dom.esc;
  const L = SLH.learn;

  const profile = () => SLH.profile.get(user.id) || {};
  const state = () => L.load(user.id);

  const log = [{
    who: "ai",
    html: "Hi! I'm a <b>preview assistant</b>. I don't use a real AI yet, but I can read your roadmap, courses and profile and give you practical answers. Pick a question below."
  }];

  const PROMPTS = [
    ["next", "What should I learn next?"],
    ["plan", "Make my weekly study plan"],
    ["opps", "Which opportunities fit me?"],
    ["exams", "Help me prepare for exams"],
    ["profile", "How do I improve my profile?"]
  ];

  function answer(intent) {
    const S = state();
    const p = profile();
    const t = L.track(S.track);
    const m = L.major(S.major);

    if (intent === "next") {
      if (!t) {
        return 'You have not chosen a roadmap yet. Open <a href="learning.html#roadmaps">Roadmaps</a>, pick one, and I will tell you the next step every time.';
      }

      const pr = L.progress(S, t.id);
      if (!pr.next) {
        return "You finished every step of <b>" + esc(t.name) + "</b>. Build the final project: " + esc(t.project);
      }

      const step = t.steps[pr.next.index];
      return "Your next step in <b>" + esc(t.name) + "</b> is <b>" + esc(step[0]) + "</b> (about " + step[1] + ' hours). Start with: <a href="' + esc(step[2][0][1]) + '" target="_blank" rel="noopener noreferrer">' + esc(step[2][0][0]) + '</a>. <a href="learning.html#track/' + t.id + '">Open the roadmap</a>.';
    }

    if (intent === "plan") {
      const hours = Number(p.hoursPerWeek) || 0;
      if (!t) {
        return 'Choose a roadmap first, then I can build a plan around it. <a href="learning.html#roadmaps">Choose a roadmap</a>.';
      }
      if (!hours) {
        return 'Tell me how many hours per week you can study. Set it in <a href="profile.html">your profile</a> (Study preferences), then ask me again.';
      }

      const pr = L.progress(S, t.id);
      const weeks = Math.ceil(pr.hoursLeft / hours);
      const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
      const per = Math.max(1, Math.round((hours / 5) * 2) / 2);
      const next = pr.next ? t.steps[pr.next.index][0] : "your final project";

      return "With <b>" + hours + " hours/week</b> you need about <b>" + weeks + " weeks</b> to finish <b>" + esc(t.name) + "</b>. This week: <ul><li>" + days.slice(0, 5).map((d) => "<b>" + d + "</b>: " + per + "h on " + esc(next)).join("</li><li>") + "</li><li><b>Fri</b>: rest or review</li></ul>Tip: use the Pomodoro timer in <a href=\"tools.html\">Tools</a>.";
    }

    if (intent === "opps") {
      const mine = (p.skills || []).map((s) => s.toLowerCase());
      if (!mine.length) {
        return 'Add some skills to <a href="profile.html#sec-skills">your profile</a> and I can rank opportunities for you.';
      }

      const top = SLH.data.opportunities
        .map((o) => ({
          o,
          n: o.skills.filter((s) => mine.includes(s.toLowerCase())).length / o.skills.length
        }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 3);

      return "Best matches for your skills: <ul>" + top.map((x) => "<li><b>" + esc(x.o.title) + "</b> · " + Math.round(x.n * 100) + "% match</li>").join("") + '</ul><a href="opportunities.html">See all opportunities</a>.';
    }

    if (intent === "exams") {
      const taking = Object.entries(S.courses).filter((e) => e[1].status === "taking");
      if (!m) {
        return 'Choose your major first so I know your courses. <a href="learning.html#majors">Choose my major</a>.';
      }
      if (!taking.length) {
        return 'Mark the courses you are taking in <a href="learning.html#major/' + m.id + '">' + esc(m.name) + "</a> and I will help you prepare.";
      }

      const drive = taking.filter((e) => e[1].drive).length;
      return "You are taking <b>" + taking.length + " courses</b>. " + (drive ? drive + " have a past-exams link saved." : "None has a past-exams link yet.") + " A simple plan: solve one past exam per course under time limits, review mistakes, then repeat. <a href=\"learning.html#major/" + m.id + '">Open my courses</a>.';
    }

    if (intent === "profile") {
      const c = SLH.profile.completion(p);
      return c.percent >= 100
        ? "Your profile is complete. Keep your projects updated."
        : "Your profile is <b>" + c.percent + '%</b> complete. Next best step: <b>' + esc(c.missing[0].label) + '</b>. <a href="profile.html">Open profile</a>.';
    }

    return "I'm only a preview, so I understand a few questions for now. Try one of the buttons below.";
  }

  function guess(text) {
    const s = text.toLowerCase();
    if (/next|learn|roadmap|step/.test(s)) return "next";
    if (/plan|week|schedule|study/.test(s)) return "plan";
    if (/job|intern|opportun|scholar|hackathon/.test(s)) return "opps";
    if (/exam|test|final|course/.test(s)) return "exams";
    if (/profile|cv|resume|portfolio/.test(s)) return "profile";
    return "";
  }

  function render() {
    root.innerHTML = `
      <div class="alert alert--info" role="note">
        <i class="icon" data-icon="info"></i>
        <div>
          <b>Preview</b>
          <p>This assistant follows simple rules and your saved data. A real AI model will be connected in a later phase.</p>
        </div>
      </div>
      <div class="chat" id="chat" aria-live="polite">
        ${log.map((b) => `<div class="bubble bubble--${b.who}">${b.who === "ai" ? b.html : esc(b.html)}</div>`).join("")}
      </div>
      <div class="chips" style="margin-block:1rem">
        ${PROMPTS.map((q) => `<button type="button" class="chip" data-ask="${q[0]}">${esc(q[1])}</button>`).join("")}
      </div>
      <form class="mini-add" id="chat-form">
        <label class="visually-hidden" for="chat-in">Ask something</label>
        <input class="input" id="chat-in" maxlength="200" placeholder="Ask about your roadmap, plan, opportunities…" autocomplete="off">
        <button class="btn btn--primary">Send</button>
      </form>
    `;

    SLH.icons.render(root);
    const chatContainer = SLH.dom.qs("#chat");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ask]");
    if (!btn) return;
    const q = PROMPTS.find((x) => x[0] === btn.dataset.ask);
    log.push({ who: "user", html: q[1] }, { who: "ai", html: answer(q[0]) });
    render();
  });

  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = SLH.dom.qs("#chat-in");
    const val = input.value.trim();
    if (!val) return;
    log.push({ who: "user", html: val }, { who: "ai", html: answer(guess(val)) });
    render();
    SLH.dom.qs("#chat-in").focus();
  });

  render();
});