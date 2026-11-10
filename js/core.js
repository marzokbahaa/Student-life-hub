window.SLH = window.SLH || {};

SLH.dom = {
  qs: (s, r) => (r || document).querySelector(s),
  qsa: (s, r) => Array.from((r || document).querySelectorAll(s)),
  esc: (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  ready: (fn) => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn())
};

SLH.storage = {
  get(key, fallback) {
    try {
      const r = localStorage.getItem("slh:" + key);
      return r === null ? fallback : JSON.parse(r);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("slh:" + key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem("slh:" + key);
    } catch (e) {}
  }
};

SLH.theme = (function () {
  const root = document.documentElement;
  const KEY = "slh:theme";
  const media = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;

  const pref = () => {
    try {
      const v = localStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : "system";
    } catch (e) {
      return "system";
    }
  };

  const resolve = (p) => (p === "system" ? (media && media.matches ? "dark" : "light") : p);
  const current = () => (root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  function paint() {
    const t = resolve(pref());
    root.setAttribute("data-theme", t);
    const meta = SLH.dom.qs('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0a1022" : "#f4f6fb");

    SLH.dom.qsa("[data-theme-toggle]").forEach((b) => {
      b.setAttribute("aria-pressed", String(t === "dark"));
      b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });

    SLH.dom.qsa("[data-theme-choice]").forEach((i) => (i.checked = i.value === pref()));
  }

  function set(p) {
    try {
      p === "system" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, p);
    } catch (e) {}
    paint();
  }

  function init() {
    paint();
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-theme-toggle]")) {
        set(current() === "dark" ? "light" : "dark");
      }
    });
    document.addEventListener("change", (e) => {
      if (e.target.matches("[data-theme-choice]")) {
        set(e.target.value);
      }
    });
    if (media) {
      media.addEventListener("change", () => {
        if (pref() === "system") paint();
      });
    }
  }

  return { init, set, pref, current, paint };
})();

SLH.toast = (function () {
  let region;

  function show(message, o = {}) {
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }

    const el = document.createElement("div");
    el.className = "toast toast--" + (o.tone || "info");
    el.innerHTML = '<div>' + (o.title ? "<b>" + SLH.dom.esc(o.title) + "</b>" : "") + "<p>" + SLH.dom.esc(message) + '</p></div><button type="button" aria-label="Dismiss"><i class="icon" data-icon="x"></i></button>';
    
    SLH.icons.render(el);
    el.querySelector("button").addEventListener("click", () => el.remove());
    region.appendChild(el);
    setTimeout(() => el.remove(), o.duration || 4000);
  }

  return { show };
})();

SLH.modal = {
  open: (d) => d && !d.open && d.showModal(),
  close: (d) => d && d.open && d.close(),
  init(root) {
    SLH.dom.qsa("[data-modal-open]", root).forEach((b) => {
      b.addEventListener("click", () => SLH.modal.open(document.getElementById(b.dataset.modalOpen)));
    });
    SLH.dom.qsa("dialog.modal", root).forEach((d) => {
      d.addEventListener("click", (e) => {
        if (e.target === d) d.close();
      });
      SLH.dom.qsa("[data-modal-close]", d).forEach((b) => {
        b.addEventListener("click", () => d.close());
      });
    });
  }
};

SLH.dropdown = (function () {
  function closeAll(except) {
    SLH.dom.qsa(".dropdown").forEach((dd) => {
      if (dd === except) return;
      const m = dd.querySelector(".dropdown__menu");
      const t = dd.querySelector("[data-dropdown-toggle]");
      if (m) m.hidden = true;
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }

  function init(root) {
    SLH.dom.qsa(".dropdown", root).forEach((dd) => {
      const t = dd.querySelector("[data-dropdown-toggle]");
      const m = dd.querySelector(".dropdown__menu");
      if (!t || !m) return;

      t.addEventListener("click", () => {
        const open = m.hidden;
        closeAll(dd);
        m.hidden = !open;
        t.setAttribute("aria-expanded", String(open));
        if (open) {
          const f = m.querySelector("a,button");
          f && f.focus();
        }
      });

      dd.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeAll();
          t.focus();
        }
      });
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) closeAll();
  });

  return { init };
})();

SLH.form = {
  initPasswordToggles(root) {
    SLH.dom.qsa("[data-toggle-password]", root).forEach((btn) => {
      const input = document.getElementById(btn.dataset.togglePassword);
      btn.addEventListener("click", () => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        btn.innerHTML = SLH.icons.svg(show ? "eyeoff" : "eye");
      });
    });
  },
  setError(field, message) {
    const f = field.closest(".field");
    f.classList.toggle("has-error", Boolean(message));
    const e = f.querySelector(".field__error");
    if (e) e.textContent = message || "";
    field.setAttribute("aria-invalid", String(Boolean(message)));
  },
  loading(btn, on) {
    btn.classList.toggle("is-loading", on);
    btn.disabled = on;
    btn.setAttribute("aria-busy", String(on));
  },
  passwordRules: [
    ["At least 8 characters", (v) => v.length >= 8],
    ["One uppercase letter", (v) => /[A-Z]/.test(v)],
    ["One lowercase letter", (v) => /[a-z]/.test(v)],
    ["One number", (v) => /\d/.test(v)]
  ],
  bindPasswordRules(input, list) {
    const render = () => {
      list.innerHTML = SLH.form.passwordRules.map((r) => '<li class="' + (r[1](input.value) ? "ok" : "") + '">' + r[0] + "</li>").join("");
    };
    input.addEventListener("input", render);
    render();
  },
  passwordValid: (v) => SLH.form.passwordRules.every((r) => r[1](v))
};

SLH.dom.ready(function () {
  SLH.icons.render();
  SLH.theme.init();
  SLH.modal.init();
  SLH.dropdown.init();
  SLH.form.initPasswordToggles();
});