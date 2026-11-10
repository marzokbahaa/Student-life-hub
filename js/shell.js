/* APP SHELL for signed-in pages: sidebar (desktop), top bar + bottom nav (mobile), route guard. */
(function () {
  const user = SLH.auth.guard();
  if (!user) return;
  SLH.dom.ready(function () {
    const page = document.body.dataset.page, nav = SLH.data.nav;
    const profile = SLH.profile.get(user.id) || SLH.profile.createFor(user.id, { name: user.name });
    const g = SLH.data.gamification, esc = SLH.dom.esc;
    const avatar = (cls) => '<span class="avatar ' + cls + '">' + (profile.avatar ? '<img src="' + esc(profile.avatar) + '" alt="">' : esc(SLH.profile.initials(profile.name))) + "</span>";
    const link = (n, cls) => '<a class="' + cls + '" href="' + n.id + '.html"' + (n.id === page ? ' aria-current="page"' : "") + '><i class="icon" data-icon="' + n.icon + '"></i>' + (cls === "nav-item" ? n.label : n.short) + "</a>";
    const themeBtn = '<button type="button" class="btn btn--ghost btn--icon theme-toggle" data-theme-toggle><i class="icon i-moon" data-icon="moon"></i><i class="icon i-sun" data-icon="sun"></i></button>';

    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    sidebar.innerHTML =
      '<div class="sidebar__brand"><a class="logo" href="home.html"><span class="logo__mark" aria-hidden="true"></span>Student Life Hub</a></div>' +
      '<nav class="sidebar__nav" aria-label="Main">' + nav.map((n) => link(n, "nav-item")).join("") + "</nav>" +
      '<div class="sidebar__foot"><a class="sidebar__user" href="profile.html">' + avatar("") + "<div><p><b>" + esc(profile.name) + '</b></p><p class="small muted">' + esc(profile.major || "Student") + "</p></div></a>" +
      '<div><div class="row-between"><span>Level ' + g.level + " · " + g.levelName + "</span><span>" + g.xp.toLocaleString() + ' XP</span></div><div class="progress progress--accent" style="margin-top:.5rem"><span style="--v:' + Math.round((g.xp / g.nextXp) * 100) + '%"></span></div></div>' +
      '<div class="cluster" style="justify-content:space-between">' + themeBtn + '<button type="button" class="btn btn--ghost btn--sm" data-signout><i class="icon" data-icon="logout"></i>Sign out</button></div></div>';

    const top = document.createElement("header");
    top.className = "app-topbar";
    top.innerHTML = '<a class="logo" href="home.html"><span class="logo__mark" aria-hidden="true"></span>Student Life Hub</a><div class="cluster" style="gap:.25rem">' + themeBtn + '<a href="profile.html" aria-label="Profile">' + avatar("avatar--sm") + "</a></div>";

    const bar = ["home", "learning", "opportunities", "assistant"];
    const more = nav.filter((n) => !bar.includes(n.id));
    const bottom = document.createElement("nav");
    bottom.className = "bottom-nav"; bottom.setAttribute("aria-label", "Main");
    bottom.innerHTML = nav.filter((n) => bar.includes(n.id)).map((n) => link(n, "")).join("") + '<button type="button" data-modal-open="more-sheet"><i class="icon" data-icon="more"></i>More</button>';

    const sheet = document.createElement("dialog");
    sheet.className = "modal modal--sheet"; sheet.id = "more-sheet"; sheet.setAttribute("aria-label", "More");
    sheet.innerHTML = '<div class="modal__head"><h2 style="font-size:1.2rem">More</h2><button class="btn btn--ghost btn--icon" data-modal-close aria-label="Close"><i class="icon" data-icon="x"></i></button></div><div class="modal__body"><div class="sheet-grid">' +
      more.map((n) => '<a href="' + n.id + '.html"><i class="icon" data-icon="' + n.icon + '"></i>' + n.label + "</a>").join("") + '<button type="button" data-signout><i class="icon" data-icon="logout"></i>Sign out</button></div></div>';

    document.body.prepend(top); document.body.prepend(sidebar);
    document.body.append(bottom, sheet);
    SLH.icons.render(); SLH.modal.init(); SLH.theme.paint();
    document.addEventListener("click", (e) => { if (e.target.closest("[data-signout]")) { SLH.auth.signOut(); location.href = "../auth/login.html"; } });
  });
})();
