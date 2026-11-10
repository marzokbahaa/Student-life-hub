/* LEARNING DATA: roadmaps (tracks) and university majors with courses.
   - Every resource is FREE. Links point to well-known official sites; if a site moves a page, edit the URL here (one place).
   - Medical majors are placeholders on purpose: no courses or resources yet.
   - Shape: step = [title, hoursEstimate, [ [label, url, kind], ... ]] where kind = course | video | docs | practice */
window.SLH = window.SLH || {};
SLH.learn = (function () {
  const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

  const TRACKS = [
    { 
      id: "frontend", icon: "layout", name: "Frontend Development", level: "Beginner friendly", months: 6, group: "Tech",
      desc: "Build interfaces people enjoy using, from HTML and CSS to JavaScript and React.",
      outcome: "Junior frontend developer, web developer, freelance websites",
      project: "A personal portfolio site plus a small weather or to-do app deployed on GitHub Pages.",
      steps: [
        ["HTML & CSS basics", 40, [["MDN: Learn web development", "https://developer.mozilla.org/en-US/docs/Learn_web_development", "docs"], ["freeCodeCamp curriculum", "https://www.freecodecamp.org/learn", "course"], ["Kevin Powell (YouTube)", "https://www.youtube.com/@KevinPowell", "video"], ["Elzero Web School (Arabic)", "https://www.youtube.com/@ElzeroWebSchool", "video"]]],
        ["Layout: Flexbox, Grid, responsive design", 25, [["Flexbox Froggy", "https://flexboxfroggy.com", "practice"], ["Grid Garden", "https://cssgridgarden.com", "practice"], ["web.dev: Learn CSS", "https://web.dev/learn/css", "course"]]],
        ["JavaScript fundamentals", 70, [["javascript.info", "https://javascript.info", "docs"], ["Eloquent JavaScript (free book)", "https://eloquentjavascript.net", "docs"], ["Web Dev Simplified (YouTube)", "https://www.youtube.com/@WebDevSimplified", "video"]]],
        ["Git & GitHub", 15, [["Pro Git book", "https://git-scm.com/book/en/v2", "docs"], ["Learn Git Branching", "https://learngitbranching.js.org", "practice"], ["GitHub Docs: get started", "https://docs.github.com/en/get-started", "docs"]]],
        ["React", 60, [["react.dev: Learn", "https://react.dev/learn", "course"], ["The Net Ninja (YouTube)", "https://www.youtube.com/@NetNinja", "video"]]],
        ["Projects & deployment", 60, [["Frontend Mentor challenges", "https://www.frontendmentor.io/challenges", "practice"], ["The Odin Project", "https://www.theodinproject.com", "course"], ["roadmap.sh/frontend", "https://roadmap.sh/frontend", "docs"]]],
      ] 
    },
    { 
      id: "backend", icon: "server", name: "Backend Development", level: "Intermediate", months: 7, group: "Tech",
      desc: "Design APIs, databases and the logic behind every app.",
      outcome: "Backend developer, API developer, junior software engineer",
      project: "A REST API with authentication and a PostgreSQL database (for example a notes or library API).",
      steps: [
        ["Programming fundamentals", 60, [["CS50x (Harvard)", "https://cs50.harvard.edu/x", "course"], ["CS50 (YouTube)", "https://www.youtube.com/@cs50", "video"]]],
        ["JavaScript & Node.js", 50, [["Node.js: Learn", "https://nodejs.org/en/learn", "docs"], ["javascript.info", "https://javascript.info", "docs"]]],
        ["HTTP & REST APIs", 20, [["MDN: HTTP", "https://developer.mozilla.org/en-US/docs/Web/HTTP", "docs"], ["roadmap.sh/backend", "https://roadmap.sh/backend", "docs"]]],
        ["SQL & PostgreSQL", 40, [["SQLBolt", "https://sqlbolt.com", "practice"], ["PostgreSQL Tutorial", "https://www.postgresqltutorial.com", "docs"], ["SQLZoo", "https://sqlzoo.net", "practice"]]],
        ["Express & Prisma", 40, [["Express: getting started", "https://expressjs.com/en/starter/installing.html", "docs"], ["Prisma docs", "https://www.prisma.io/docs", "docs"]]],
        ["Authentication & security", 25, [["OWASP Cheat Sheets", "https://cheatsheetseries.owasp.org", "docs"], ["OWASP Top 10", "https://owasp.org/www-project-top-ten/", "docs"]]],
        ["Testing & deployment", 30, [["The Odin Project: NodeJS", "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs", "course"], ["Fireship (YouTube)", "https://www.youtube.com/@Fireship", "video"]]],
      ] 
    },
    { 
      id: "fullstack", icon: "layers", name: "Full Stack", level: "Intermediate", months: 10, group: "Tech",
      desc: "Ship complete products from the database to the browser.",
      outcome: "Full stack developer, startup engineer, freelancer",
      project: "A complete app with login, database and a deployed frontend, like Student Life Hub.",
      steps: [
        ["Web foundations (HTML, CSS, JS)", 100, [["The Odin Project: Foundations", "https://www.theodinproject.com/paths/foundations", "course"], ["freeCodeCamp curriculum", "https://www.freecodecamp.org/learn", "course"]]],
        ["Frontend framework", 60, [["react.dev: Learn", "https://react.dev/learn", "course"], ["Full Stack Open", "https://fullstackopen.com/en/", "course"]]],
        ["Backend & APIs", 60, [["Node.js: Learn", "https://nodejs.org/en/learn", "docs"], ["Express docs", "https://expressjs.com", "docs"]]],
        ["Databases", 40, [["SQLBolt", "https://sqlbolt.com", "practice"], ["PostgreSQL Tutorial", "https://www.postgresqltutorial.com", "docs"]]],
        ["Git, deployment and CI", 25, [["Pro Git book", "https://git-scm.com/book/en/v2", "docs"], ["GitHub Actions docs", "https://docs.github.com/en/actions", "docs"]]],
        ["Capstone project", 80, [["The Odin Project: Full Stack JavaScript", "https://www.theodinproject.com/paths/full-stack-javascript", "course"], ["roadmap.sh/full-stack", "https://roadmap.sh/full-stack", "docs"]]],
      ] 
    },
    { 
      id: "ai", icon: "brain", name: "AI / Machine Learning", level: "Advanced", months: 12, group: "Tech",
      desc: "Python, math and models, then deep learning and language models.",
      outcome: "ML engineer, AI researcher, data scientist",
      project: "A classifier trained on a Kaggle dataset, with a short write-up of what you tried.",
      steps: [
        ["Python", 50, [["Python tutorial (official)", "https://docs.python.org/3/tutorial/", "docs"], ["Kaggle Learn: Python", "https://www.kaggle.com/learn/python", "course"], ["Corey Schafer (YouTube)", "https://www.youtube.com/@coreyms", "video"]]],
        ["Math for ML", 80, [["Khan Academy: Linear Algebra", "https://www.khanacademy.org/math/linear-algebra", "course"], ["3Blue1Brown (YouTube)", "https://www.youtube.com/@3blue1brown", "video"], ["Khan Academy: Statistics & Probability", "https://www.khanacademy.org/math/statistics-probability", "course"]]],
        ["NumPy, Pandas, visualization", 40, [["Kaggle Learn: Pandas", "https://www.kaggle.com/learn/pandas", "course"], ["Kaggle Learn: Data Visualization", "https://www.kaggle.com/learn/data-visualization", "course"]]],
        ["Machine learning basics", 60, [["Google ML Crash Course", "https://developers.google.com/machine-learning/crash-course", "course"], ["Kaggle Learn: Intro to ML", "https://www.kaggle.com/learn/intro-to-machine-learning", "course"], ["StatQuest (YouTube)", "https://www.youtube.com/@statquest", "video"]]],
        ["Deep learning", 80, [["fast.ai: Practical Deep Learning", "https://course.fast.ai", "course"], ["Kaggle Learn: Intro to Deep Learning", "https://www.kaggle.com/learn/intro-to-deep-learning", "course"]]],
        ["Language models & projects", 60, [["Hugging Face Learn", "https://huggingface.co/learn", "course"], ["Kaggle competitions", "https://www.kaggle.com/competitions", "practice"]]],
      ] 
    },
    { 
      id: "data", icon: "chart", name: "Data Science & Analytics", level: "Intermediate", months: 8, group: "Tech",
      desc: "Turn raw data into decisions with SQL, Python and dashboards.",
      outcome: "Data analyst, BI analyst, data scientist (junior)",
      project: "A dashboard that answers a real question from a public dataset, with a short report.",
      steps: [
        ["Excel & statistics basics", 40, [["Khan Academy: Statistics", "https://www.khanacademy.org/math/statistics-probability", "course"], ["Microsoft Excel help", "https://support.microsoft.com/en-us/excel", "docs"]]],
        ["SQL", 40, [["SQLBolt", "https://sqlbolt.com", "practice"], ["SQLZoo", "https://sqlzoo.net", "practice"], ["Kaggle Learn: Intro to SQL", "https://www.kaggle.com/learn/intro-to-sql", "course"]]],
        ["Python for data", 50, [["Kaggle Learn: Python", "https://www.kaggle.com/learn/python", "course"], ["Kaggle Learn: Pandas", "https://www.kaggle.com/learn/pandas", "course"]]],
        ["Data visualization", 30, [["Kaggle Learn: Data Visualization", "https://www.kaggle.com/learn/data-visualization", "course"], ["Microsoft Learn: Power BI", "https://learn.microsoft.com/en-us/training/powerbi/", "course"]]],
        ["Intro to machine learning", 40, [["Google ML Crash Course", "https://developers.google.com/machine-learning/crash-course", "course"], ["StatQuest (YouTube)", "https://www.youtube.com/@statquest", "video"]]],
        ["Portfolio projects", 60, [["Kaggle datasets", "https://www.kaggle.com/datasets", "practice"], ["Google Dataset Search", "https://datasetsearch.research.google.com", "practice"]]],
      ] 
    },
    { 
      id: "cyber", icon: "shield", name: "Cybersecurity", level: "Intermediate", months: 9, group: "Tech",
      desc: "Networks, Linux and ethical hacking with hands-on labs.",
      outcome: "Security analyst, penetration tester (junior), SOC analyst",
      project: "Write-ups of 10 solved CTF challenges or TryHackMe rooms, published on a blog or GitHub.",
      steps: [
        ["Networking fundamentals", 50, [["Professor Messer", "https://www.professormesser.com", "video"], ["Practical Networking", "https://www.practicalnetworking.net", "docs"]]],
        ["Linux & command line", 30, [["Linux Journey", "https://linuxjourney.com", "course"], ["OverTheWire: Bandit", "https://overthewire.org/wargames/bandit/", "practice"]]],
        ["Security fundamentals", 40, [["TryHackMe (free rooms)", "https://tryhackme.com", "practice"], ["NetworkChuck (YouTube)", "https://www.youtube.com/@NetworkChuck", "video"]]],
        ["Web security", 50, [["PortSwigger Web Security Academy", "https://portswigger.net/web-security", "course"], ["OWASP Top 10", "https://owasp.org/www-project-top-ten/", "docs"]]],
        ["Capture the flag (CTF)", 60, [["picoCTF", "https://picoctf.org", "practice"], ["OverTheWire wargames", "https://overthewire.org/wargames/", "practice"]]],
        ["Scripting & portfolio", 40, [["Python tutorial (official)", "https://docs.python.org/3/tutorial/", "docs"], ["roadmap.sh/cyber-security", "https://roadmap.sh/cyber-security", "docs"]]],
      ] 
    },
    { 
      id: "uiux", icon: "pen", name: "UI/UX Design", level: "Beginner friendly", months: 5, group: "Design",
      desc: "Research, wireframe and prototype in Figma.",
      outcome: "UI/UX designer (junior), product designer, freelance designer",
      project: "A case study: redesign one app screen flow, from research to a clickable prototype.",
      steps: [
        ["Design principles", 20, [["Laws of UX", "https://lawsofux.com", "docs"], ["Nielsen Norman Group articles", "https://www.nngroup.com/articles/", "docs"]]],
        ["Figma basics", 25, [["Figma: Learn design", "https://www.figma.com/resources/learn-design/", "course"], ["Figma (YouTube)", "https://www.youtube.com/@Figma", "video"]]],
        ["User research & wireframes", 25, [["Nielsen Norman Group: UX research", "https://www.nngroup.com/topic/research-methods/", "docs"], ["The Futur (YouTube)", "https://www.youtube.com/@thefutur", "video"]]],
        ["Visual design & accessibility", 25, [["Material Design 3", "https://m3.material.io", "docs"], ["WebAIM", "https://webaim.org", "docs"]]],
        ["Prototyping & case studies", 40, [["Daily UI challenges", "https://www.dailyui.co", "practice"], ["Figma Community files", "https://www.figma.com/community", "practice"]]],
      ] 
    },
    { 
      id: "business", icon: "briefcase", name: "Business & Entrepreneurship", level: "Beginner friendly", months: 6, group: "Business",
      desc: "Management, finance basics and starting your own venture.",
      outcome: "Business analyst, startup founder, operations or management trainee",
      project: "A one-page business plan and a lean canvas for an idea tested with 10 real people.",
      steps: [
        ["Business and economics basics", 30, [["Khan Academy: Economics & Finance", "https://www.khanacademy.org/economics-finance-domain", "course"]]],
        ["Finance & accounting basics", 30, [["Khan Academy: Core Finance", "https://www.khanacademy.org/economics-finance-domain/core-finance", "course"], ["Accounting basics (YouTube search)", yt("accounting basics for beginners full course"), "video"]]],
        ["Project management", 20, [["Atlassian Agile Coach", "https://www.atlassian.com/agile", "docs"]]],
        ["Entrepreneurship & validation", 30, [["Y Combinator Startup School", "https://www.startupschool.org", "course"], ["Khan Academy: Entrepreneurship", "https://www.khanacademy.org/economics-finance-domain/entrepreneurship2", "course"], ["Lean Canvas", "https://leanstack.com/lean-canvas", "docs"]]],
        ["Excel for business", 25, [["Microsoft Excel help", "https://support.microsoft.com/en-us/excel", "docs"], ["Excel tutorials (YouTube search)", yt("excel for business beginners full course"), "video"]]],
      ] 
    },
    { 
      id: "marketing", icon: "megaphone", name: "Digital Marketing", level: "Beginner friendly", months: 4, group: "Business",
      desc: "Content, SEO and ads, measured with real analytics.",
      outcome: "Digital marketer, content creator, social media manager",
      project: "Grow a small page or blog for 30 days and report what worked using real numbers.",
      steps: [
        ["Marketing fundamentals", 20, [["Google Digital Garage", "https://learndigital.withgoogle.com/digitalgarage", "course"], ["HubSpot Academy", "https://academy.hubspot.com", "course"]]],
        ["Content & social media", 25, [["HubSpot Academy: content marketing", "https://academy.hubspot.com/courses/content-marketing", "course"], ["Canva Design School", "https://www.canva.com/designschool/", "course"]]],
        ["SEO", 20, [["Google SEO starter guide", "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", "docs"]]],
        ["Ads & analytics", 25, [["Google Skillshop", "https://skillshop.withgoogle.com", "course"], ["Meta Blueprint", "https://www.facebook.com/business/learn", "course"]]],
        ["Run a real campaign", 30, [["HubSpot Academy", "https://academy.hubspot.com", "course"]]],
      ] 
    },
  ];

  /* MAJORS (University Hub). Course = [name, year]. Resource links for courses are search links, so they never go dead. */
  const MAJORS = [
    { id: "cs", faculty: "Computing", name: "Computer Science", tracks: ["backend", "ai", "fullstack"], courses: [
      ["Programming 1", 1], ["Discrete Mathematics", 1], ["Calculus 1", 1], ["Data Structures", 2], ["Object-Oriented Programming", 2], ["Linear Algebra", 2], ["Algorithms", 3], ["Databases", 3], ["Operating Systems", 3], ["Computer Networks", 3], ["Software Engineering", 4], ["Artificial Intelligence", 4]] },
    { id: "is", faculty: "Computing", name: "Information Systems", tracks: ["data", "backend", "business"], courses: [
      ["Programming 1", 1], ["Introduction to Information Systems", 1], ["Statistics", 1], ["Databases", 2], ["Systems Analysis & Design", 2], ["Web Development", 3], ["Data Warehousing", 3], ["Project Management", 4]] },
    { id: "se", faculty: "Computing", name: "Software Engineering", tracks: ["fullstack", "frontend", "backend"], courses: [
      ["Programming 1", 1], ["Data Structures", 2], ["Software Requirements", 2], ["Databases", 2], ["Software Design & Architecture", 3], ["Software Testing", 3], ["Web Development", 3], ["DevOps", 4]] },
    { id: "ce", faculty: "Engineering", name: "Computer Engineering", tracks: ["backend", "cyber", "ai"], courses: [
      ["Programming 1", 1], ["Digital Logic Design", 1], ["Calculus 1", 1], ["Data Structures", 2], ["Computer Organization", 2], ["Signals and Systems", 2], ["Operating Systems", 3], ["Microprocessors", 3], ["Computer Networks", 3], ["Embedded Systems", 4]] },
    { id: "ee", faculty: "Engineering", name: "Electrical Engineering", tracks: ["ai", "data"], courses: [
      ["Circuits 1", 1], ["Calculus 1", 1], ["Physics 2", 1], ["Electronics 1", 2], ["Signals and Systems", 2], ["Electromagnetics", 3], ["Control Systems", 3], ["Power Systems", 4]] },
    { id: "me", faculty: "Engineering", name: "Mechanical Engineering", tracks: ["data", "business"], courses: [
      ["Statics", 1], ["Calculus 1", 1], ["Engineering Drawing", 1], ["Dynamics", 2], ["Thermodynamics", 2], ["Fluid Mechanics", 3], ["Machine Design", 3], ["Heat Transfer", 3]] },
    { id: "civil", faculty: "Engineering", name: "Civil Engineering", tracks: ["data", "business"], courses: [
      ["Statics", 1], ["Calculus 1", 1], ["Surveying", 2], ["Strength of Materials", 2], ["Structural Analysis", 3], ["Soil Mechanics", 3], ["Reinforced Concrete Design", 4]] },
    { id: "ba", faculty: "Business", name: "Business Administration", tracks: ["business", "marketing", "data"], courses: [
      ["Principles of Management", 1], ["Microeconomics", 1], ["Financial Accounting", 1], ["Marketing Principles", 2], ["Business Statistics", 2], ["Organizational Behavior", 2], ["Corporate Finance", 3], ["Operations Management", 3], ["Strategic Management", 4]] },
    { id: "acc", faculty: "Business", name: "Accounting & Finance", tracks: ["business", "data"], courses: [
      ["Financial Accounting", 1], ["Microeconomics", 1], ["Business Mathematics", 1], ["Cost Accounting", 2], ["Managerial Accounting", 2], ["Auditing", 3], ["Corporate Finance", 3], ["Investment Analysis", 4]] },
    { id: "mkt", faculty: "Business", name: "Marketing & Media", tracks: ["marketing", "uiux", "business"], courses: [
      ["Marketing Principles", 1], ["Consumer Behavior", 2], ["Market Research", 2], ["Digital Marketing", 3], ["Branding", 3], ["Advertising", 3]] },
    { id: "math", faculty: "Science", name: "Mathematics & Statistics", tracks: ["data", "ai"], courses: [
      ["Calculus 1", 1], ["Linear Algebra", 1], ["Probability", 2], ["Differential Equations", 2], ["Statistics", 2], ["Real Analysis", 3], ["Numerical Analysis", 4]] },
    { id: "lang", faculty: "Arts & Languages", name: "Languages & Translation", tracks: ["marketing", "business"], courses: [
      ["Academic Writing", 1], ["Linguistics", 1], ["Translation Theory", 2], ["Public Speaking", 2], ["Technical Translation", 3]] },
    { id: "law", faculty: "Law", name: "Law", tracks: ["business"], courses: [
      ["Introduction to Law", 1], ["Constitutional Law", 1], ["Civil Law", 2], ["Criminal Law", 2], ["Commercial Law", 3]] },
    /* Medical: placeholders only. No courses or resources yet (planned for later). */
    { id: "med", faculty: "Medical", name: "Medicine", medical: true, tracks: [], courses: [] },
    { id: "pharm", faculty: "Medical", name: "Pharmacy", medical: true, tracks: [], courses: [] },
    { id: "dent", faculty: "Medical", name: "Dentistry", medical: true, tracks: [], courses: [] },
    { id: "nurs", faculty: "Medical", name: "Nursing", medical: true, tracks: [], courses: [] },
    { id: "pt", faculty: "Medical", name: "Physical Therapy", medical: true, tracks: [], courses: [] },
    { id: "vet", faculty: "Medical", name: "Veterinary Medicine", medical: true, tracks: [], courses: [] },
  ];

  /* Free lesson search links for any course name. */
  const lessonLinks = (name) => [
    ["YouTube", yt(name + " full course lecture")],
    ["MIT OpenCourseWare", "https://ocw.mit.edu/search/?q=" + encodeURIComponent(name)],
    ["Khan Academy", "https://www.khanacademy.org/search?page_search_query=" + encodeURIComponent(name)],
  ];

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const track = (id) => TRACKS.find((t) => t.id === id);
  const major = (id) => MAJORS.find((m) => m.id === id);
  const stepKey = (tid, i) => `${tid}:${i}`;
  const courseKey = (mid, name) => `${mid}:${slug(name)}`;

  /* Per-user learning state (localStorage now, learning_progress tables later). */
  const key = (uid) => `learn:${uid}`;
  const blank = () => ({ track: null, major: null, done: {}, courses: {}, started: {} });
  const load = (uid) => Object.assign(blank(), SLH.storage.get(key(uid), {}));
  const save = (uid, s) => SLH.storage.set(key(uid), s);

  function progress(state, tid) {
    const t = track(tid);
    if (!t) return { done: 0, total: 0, percent: 0, next: null };
    
    const done = t.steps.filter((s, i) => state.done[stepKey(tid, i)]).length;
    const nextIdx = t.steps.findIndex((s, i) => !state.done[stepKey(tid, i)]);
    
    return {
      done,
      total: t.steps.length,
      percent: Math.round((done / t.steps.length) * 100),
      next: nextIdx < 0 ? null : { index: nextIdx, title: t.steps[nextIdx][0] },
      hoursLeft: t.steps.reduce((h, s, i) => h + (state.done[stepKey(tid, i)] ? 0 : s[1]), 0)
    };
  }

  return { TRACKS, MAJORS, track, major, lessonLinks, stepKey, courseKey, load, save, progress };
})();