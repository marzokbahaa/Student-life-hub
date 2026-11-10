SLH.dom.ready(function () {
  const esc = SLH.dom.esc;
  const data = SLH.data;
  
  // 1. Mobile Menu Toggle Logic
  const navToggle = SLH.dom.qs("[data-nav-toggle]");
  const mobileMenu = SLH.dom.qs("#mobile-menu");

  if (navToggle && mobileMenu) {
    const toggleMenu = (isOpen) => {
      mobileMenu.hidden = !isOpen;
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      
      const iconEl = navToggle.querySelector(".icon");
      if (iconEl) {
        iconEl.innerHTML = SLH.icons.svg(isOpen ? "x" : "menu");
      }
    };

    navToggle.addEventListener("click", () => toggleMenu(mobileMenu.hidden));
    
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        toggleMenu(false);
        navToggle.focus();
      }
    });
  }

  // 2. Render Tracks List
  const tracksListEl = SLH.dom.qs("#tracks-list");
  if (tracksListEl && data.tracks) {
    tracksListEl.innerHTML = data.tracks.map(([icon, title, description, badge1, badge2]) => `
      <li>
        <a class="track" href="pages/auth/register.html">
          <span class="pillar__icon">
            <i class="icon" data-icon="${icon}"></i>
          </span>
          <span>
            <h3>${esc(title)}</h3>
            <p>${esc(description)}</p>
            <span class="badge badge--brand">${esc(badge1)}</span>
            <span class="badge">${esc(badge2)}</span>
          </span>
        </a>
      </li>
    `).join("");
  }

  // 3. Render Opportunities List (Top 4)
  const oppsListEl = SLH.dom.qs("#opps-list");
  if (oppsListEl && data.opportunities) {
    oppsListEl.innerHTML = data.opportunities.slice(0, 4).map((opp) => `
      <article class="card opp card--hover">
        <div class="score">
          <b>${opp.match}</b><span>% match</span>
        </div>
        <div class="u-min-w-0">
          <span class="badge badge--brand">${esc(opp.type)}</span>
          <h3>${esc(opp.title)}</h3>
          <p class="small muted">${esc(opp.org)}</p>
          <p class="opp__meta">
            <span><i class="icon" data-icon="pin"></i> ${esc(opp.where)}</span>
            <span><i class="icon" data-icon="clock"></i> Apply by ${esc(opp.deadline)}</span>
          </p>
          <div class="chips">
            ${opp.skills.map((skill) => `<span class="badge">${esc(skill)}</span>`).join("")}
          </div>
        </div>
      </article>
    `).join("");
  }

  // 4. Render Events List
  const eventsListEl = SLH.dom.qs("#events-list");
  if (eventsListEl && data.events) {
    eventsListEl.innerHTML = data.events.map((evt) => {
      const badgeClass = evt.type === "Hackathon" ? "badge--accent" : "badge--brand";
      return `
        <li class="event">
          <div class="date-tile">
            <span>${evt.m}</span>
            <b>${evt.d}</b>
          </div>
          <div>
            <h3 class="text-base">${esc(evt.title)}</h3>
            <p class="small muted">${esc(evt.time)} · ${esc(evt.place)} · ${esc(evt.host)}</p>
            <span class="badge ${badgeClass}">${esc(evt.type)}</span>
          </div>
        </li>
      `;
    }).join("");
  }

  // 5. Initialize Icons
  SLH.icons.render();
});