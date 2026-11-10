window.SLH = window.SLH || {};
SLH.auth = (function () {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const enc = new TextEncoder();
  const b64 = (buf) => btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));

  async function hash(password, saltB64) {
    if (!window.crypto || !crypto.subtle) {
      throw new Error("This browser blocks secure hashing here. Open the site over http://localhost.");
    }
    const salt = saltB64 ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, key, 256);
    return { salt: b64(salt), hash: b64(bits) };
  }

  const users = () => SLH.storage.get("users", []);
  const save = (u) => SLH.storage.set("users", u);

  const state = { status: "loading", user: null };
  const listeners = [];

  function setState(user) {
    state.user = user;
    state.status = user ? "authenticated" : "unauthenticated";
    listeners.forEach((fn) => fn(state));
  }

  function sessionId() {
    return sessionStorage.getItem("slh:session") || localStorage.getItem("slh:session");
  }

  function publicUser(u) {
    return { id: u.id, name: u.name, email: u.email };
  }

  function getCurrentUser() {
    const id = sessionId();
    const u = id && users().find((x) => x.id === id);
    setState(u ? publicUser(u) : null);
    return state.user;
  }

  async function signUp(data) {
    await wait(500);
    const email = data.email.trim().toLowerCase();
    if (users().some((u) => u.email === email)) {
      throw new Error("An account with this email already exists.");
    }
    const h = await hash(data.password);
    const user = {
      id: "u_" + Date.now().toString(36),
      name: data.name.trim(),
      email,
      salt: h.salt,
      hash: h.hash,
      createdAt: new Date().toISOString()
    };
    save(users().concat(user));
    SLH.profile.createFor(user.id, {
      name: user.name,
      university: data.university,
      major: data.major,
      year: data.year
    });
    sessionStorage.setItem("slh:session", user.id);
    setState(publicUser(user));
    return state.user;
  }

  async function signIn(email, password, remember) {
    await wait(500);
    const u = users().find((x) => x.email === email.trim().toLowerCase());
    const h = u ? await hash(password, u.salt) : null;
    if (!u || h.hash !== u.hash) {
      throw new Error("Email or password is incorrect.");
    }
    (remember ? localStorage : sessionStorage).setItem("slh:session", u.id);
    setState(publicUser(u));
    return state.user;
  }

  function signOut() {
    sessionStorage.removeItem("slh:session");
    localStorage.removeItem("slh:session");
    setState(null);
  }

  async function forgotPassword() {
    await wait(700);
    return { ok: true };
  }

  async function resetPassword(password) {
    await wait(700);
    if (!SLH.form.passwordValid(password)) {
      throw new Error("Password does not meet the requirements.");
    }
    return { ok: true };
  }

  function guard() {
    const user = getCurrentUser();
    const mode = document.body.dataset.guard;
    if (mode === "protected" && !user) {
      location.replace("../auth/login.html?next=" + encodeURIComponent(location.pathname.split("/").pop()));
    }
    if (mode === "guest" && user) {
      location.replace("../app/home.html");
    }
    return user;
  }

  return {
    state,
    onChange: (fn) => listeners.push(fn),
    getCurrentUser,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    guard
  };
})();