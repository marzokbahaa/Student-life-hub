/* PROFILE DATA (demo: localStorage, one record per user).
   The shape mirrors database/schema.sql so a future API can return the same JSON. */
window.SLH = window.SLH || {};
SLH.profile = (function () {
  const key = (id) => "profile:" + id;

  /* Every list-type section is described once; the profile page renders them generically. */
  const SECTIONS = {
    education: { title: "Education", icon: "cap", add: "Add education", fields: [["school", "School / university", "text", true], ["degree", "Degree / field", "text"], ["from", "From", "text"], ["to", "To", "text"], ["details", "Details", "textarea"]], line: (e) => [e.degree, e.school], meta: (e) => [e.from, e.to].filter(Boolean).join(" – ") },
    experience: { title: "Experience", icon: "briefcase", add: "Add experience", fields: [["title", "Role", "text", true], ["org", "Company / organization", "text"], ["from", "From", "text"], ["to", "To", "text"], ["details", "What did you do?", "textarea"]], line: (e) => [e.title, e.org], meta: (e) => [e.from, e.to].filter(Boolean).join(" – ") },
    projects: { title: "Projects", icon: "rocket", add: "Add project", fields: [["title", "Project name", "text", true], ["description", "Description", "textarea"], ["tech", "Technologies (comma separated)", "text"], ["role", "Your role", "text"], ["link", "Link (https://…)", "url"]], line: (e) => [e.title, e.role], meta: (e) => e.tech || "" },
    certificates: { title: "Certificates", icon: "award", add: "Add certificate", fields: [["name", "Certificate name", "text", true], ["issuer", "Issued by", "text"], ["date", "Date", "text"], ["link", "Credential link (https://…)", "url"]], line: (e) => [e.name, e.issuer], meta: (e) => e.date || "" },
    achievements: { title: "Achievements", icon: "trophy", add: "Add achievement", fields: [["title", "Achievement", "text", true], ["date", "Date", "text"], ["details", "Details", "textarea"]], line: (e) => [e.title], meta: (e) => e.date || "" },
    languages: { title: "Languages", icon: "languages", add: "Add language", fields: [["name", "Language", "text", true], ["level", "Level", "select:Native,Fluent,Intermediate,Basic"]], line: (e) => [e.name], meta: (e) => e.level || "" },
    links: { title: "Links", icon: "link", add: "Add link", fields: [["label", "Label (GitHub, LinkedIn…)", "text", true], ["url", "URL (https://…)", "url", true]], line: (e) => [e.label], meta: (e) => e.url || "" },
  };
  const CHIPS = {
    skills: { title: "Skills", icon: "zap", suggest: ["HTML", "CSS", "JavaScript", "Python", "SQL", "Git", "React", "Figma", "Excel", "Communication"] },
    interests: { title: "Interests", icon: "heart", suggest: ["Web Development", "AI", "Cybersecurity", "Data", "Design", "Business", "Marketing", "Entrepreneurship"] },
    goals: { title: "Goals", icon: "target", suggest: ["Get an internship", "Get a job", "Learn programming", "Build projects", "Improve GPA", "Join competitions", "Start freelancing", "Build portfolio"] },
  };

  const blank = (id, d) => ({
    id, name: d.name || "", headline: "", avatar: null, cover: 1, location: "", university: d.university || "", faculty: "", major: d.major || "", year: d.year || "",
    about: "", level: "", hoursPerWeek: 0, skills: [], interests: [], goals: [],
    education: [], experience: [], projects: [], certificates: [], achievements: [], languages: [], links: [], updatedAt: new Date().toISOString(),
  });

  const get = (id) => SLH.storage.get(key(id), null);
  const save = (p) => { p.updatedAt = new Date().toISOString(); return SLH.storage.set(key(p.id), p); };
  const createFor = (id, d) => { const p = blank(id, d); save(p); return p; };
  const uid = () => "i_" + Math.random().toString(36).slice(2, 9);

  /* Safe link: only http(s) is allowed (blocks javascript: URLs). Returns "" if invalid. */
  function safeUrl(v) { try { const u = new URL(String(v).trim()); return u.protocol === "https:" || u.protocol === "http:" ? u.href : ""; } catch (e) { return ""; } }

  /* Profile completion: each check is worth some points; missing ones are explained to the user. */
  function completion(p) {
    const checks = [
      ["Add a profile photo", 10, !!p.avatar, "avatar"], ["Write a headline", 8, !!p.headline.trim(), "basic"], ["Write an About section", 12, p.about.trim().length >= 40, "about"],
      ["Choose your university and major", 10, !!(p.university && p.major), "basic"], ["Add at least 3 skills", 12, p.skills.length >= 3, "skills"], ["Add your interests", 6, p.interests.length >= 1, "interests"],
      ["Set your goals", 6, p.goals.length >= 1, "goals"], ["Add a project", 12, p.projects.length >= 1, "projects"], ["Add education", 6, p.education.length >= 1, "education"],
      ["Add experience or an achievement", 6, p.experience.length + p.achievements.length >= 1, "experience"], ["Add a certificate", 4, p.certificates.length >= 1, "certificates"], ["Add a link (GitHub, LinkedIn…)", 8, p.links.length >= 1, "links"],
    ];
    const total = checks.reduce((s, c) => s + c[1], 0);
    const done = checks.reduce((s, c) => s + (c[2] ? c[1] : 0), 0);
    return { percent: Math.round((done / total) * 100), missing: checks.filter((c) => !c[2]).map((c) => ({ label: c[0], target: c[3] })) };
  }

  const initials = (n) => (n || "?").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");
  return { SECTIONS, CHIPS, get, save, createFor, uid, safeUrl, completion, initials };
})();
