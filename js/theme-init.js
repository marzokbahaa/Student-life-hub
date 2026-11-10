/* Loaded in <head> BEFORE paint (no flash). Order: saved choice -> device setting -> light. */
(function () {
  var t = "light";
  try {
    var s = localStorage.getItem("slh:theme");
    if (s === "light" || s === "dark") t = s;
    else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) t = "dark";
  } catch (e) {}
  document.documentElement.setAttribute("data-theme", t);
})();
