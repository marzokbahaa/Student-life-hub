SLH.dom.ready(function () {
  SLH.auth.guard();

  const form = SLH.dom.qs("form[data-form]");
  if (!form) return;

  const kind = form.dataset.form;
  const $ = (id) => document.getElementById(id);
  const alertBox = SLH.dom.qs("#form-alert");
  const btn = form.querySelector('button[type="submit"]');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const next = new URLSearchParams(location.search).get("next");
  const safeNext = "../app/" + (next && /^[a-z]+\.html$/.test(next) ? next : "home.html");

  const showAlert = (msg, tone) => {
    alertBox.hidden = !msg;
    alertBox.className = "alert" + (tone ? " alert--" + tone : "");
    alertBox.querySelector("span").textContent = msg || "";
  };

  const majorSel = $("major");
  if (majorSel && SLH.learn) {
    const groups = {};
    SLH.learn.MAJORS.forEach((m) => {
      groups[m.faculty] = groups[m.faculty] || [];
      groups[m.faculty].push(m);
    });

    majorSel.insertAdjacentHTML(
      "beforeend",
      Object.keys(groups)
        .map(
          (f) =>
            '<optgroup label="' +
            SLH.dom.esc(f) +
            '">' +
            groups[f]
              .map(
                (m) =>
                  '<option value="' +
                  m.id +
                  '">' +
                  SLH.dom.esc(m.name) +
                  "</option>"
              )
              .join("") +
            "</optgroup>"
        )
        .join("") +
        '<option value="other">Other / not listed</option>'
    );
  }

  const rules = $("pw-rules");
  if (rules && $("password")) {
    SLH.form.bindPasswordRules($("password"), rules);
  }

  function validate() {
    let ok = true;
    const chk = (id, err) => {
      const el = $(id);
      if (!el) return;
      SLH.form.setError(el, err);
      if (err) ok = false;
    };

    if ($("name")) {
      chk("name", $("name").value.trim().length < 2 ? "Enter your full name." : "");
    }
    if ($("email")) {
      chk("email", !emailRe.test($("email").value.trim()) ? "Enter a valid email address." : "");
    }
    if ($("password")) {
      const v = $("password").value;
      chk(
        "password",
        kind === "login"
          ? v
            ? ""
            : "Enter your password."
          : SLH.form.passwordValid(v)
          ? ""
          : "Password does not meet the requirements."
      );
    }
    if ($("confirm")) {
      chk(
        "confirm",
        $("confirm").value !== $("password").value ? "Passwords do not match." : ""
      );
    }
    if ($("university")) {
      chk("university", $("university").value.trim() ? "" : "Enter your university.");
    }
    if ($("major")) {
      chk("major", $("major").value.trim() ? "" : "Enter your major.");
    }
    if ($("year")) {
      chk("year", $("year").value ? "" : "Choose your academic year.");
    }
    if ($("terms")) {
      const f = $("terms").closest(".field");
      f.classList.toggle("has-error", !$("terms").checked);
      if (!$("terms").checked) ok = false;
    }
    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showAlert("");

    if (!validate()) {
      const bad = form.querySelector(".has-error input,.has-error select");
      bad && bad.focus();
      return;
    }

    SLH.form.loading(btn, true);

    try {
      if (kind === "login") {
        await SLH.auth.signIn($("email").value, $("password").value, $("remember").checked);
        location.href = safeNext;
      } else if (kind === "register") {
        await SLH.auth.signUp({
          name: $("name").value,
          email: $("email").value,
          password: $("password").value,
          university: $("university").value,
          major: majorSel.value === "other" ? "Other" : (SLH.learn.major(majorSel.value) || {}).name || "",
          year: $("year").value
        });

        const mj = SLH.learn.major(majorSel.value);
        const u = SLH.auth.getCurrentUser();
        if (mj && u) {
          const st = SLH.learn.load(u.id);
          st.major = mj.id;
          SLH.learn.save(u.id, st);
        }

        showAlert("Account created. Opening your dashboard…", "success");
        setTimeout(() => (location.href = "../app/home.html"), 700);
      } else if (kind === "forgot") {
        await SLH.auth.forgotPassword($("email").value);
        showAlert("If an account exists for that email, we'll send reset instructions. Check your inbox.", "success");
        form.reset();
      } else if (kind === "reset") {
        await SLH.auth.resetPassword($("password").value);
        showAlert("Password updated (demo). You can sign in now.", "success");
        setTimeout(() => (location.href = "login.html"), 1200);
      }
    } catch (err) {
      showAlert(err.message || "Something went wrong. Please try again.");
    } finally {
      SLH.form.loading(btn, false);
    }
  });
});