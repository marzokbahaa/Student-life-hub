/* DEMO DATA. All organizations are fictional. Match scores are static demo values (no AI). */
window.SLH = window.SLH || {};
SLH.data = {
  nav: [
    { id: "home", label: "Home", icon: "home", short: "Home", desc: "Your day at a glance." },
    { id: "learning", label: "My Learning", icon: "book", short: "Learn", desc: "Your tracks, roadmaps, free resources and projects in one place." },
    { id: "opportunities", label: "Opportunities", icon: "target", short: "Jobs", desc: "Internships, scholarships and hackathons matched to your skills." },
    { id: "community", label: "Community", icon: "users", short: "Community", desc: "Ask questions, join study groups and follow clubs." },
    { id: "events", label: "Events", icon: "calendar", short: "Events", desc: "Workshops, hackathons and university events you can save." },
    { id: "tools", label: "Tools", icon: "wrench", short: "Tools", desc: "To-do list, calendar, Pomodoro timer, GPA calculator and notes." },
    { id: "assistant", label: "AI Assistant", icon: "sparkles", short: "AI", desc: "Study plans and career guidance based on your progress." },
    { id: "profile", label: "Profile", icon: "user", short: "Profile", desc: "Your skills, projects and portfolio." },
  ],
  tracks: [
    ["layout", "Frontend Development", "Build interfaces people enjoy using, from HTML to React.", "Beginner friendly", "6 months"],
    ["server", "Backend Development", "Design APIs, databases and the logic behind every app.", "Intermediate", "7 months"],
    ["layers", "Full Stack", "Ship complete products from database to browser.", "Intermediate", "10 months"],
    ["brain", "AI / Machine Learning", "Python, math and models, then vision and language.", "Advanced", "12 months"],
    ["chart", "Data Science", "Turn raw data into decisions with SQL, Python and charts.", "Intermediate", "8 months"],
    ["shield", "Cybersecurity", "Networks, Linux and ethical hacking with hands-on labs.", "Intermediate", "9 months"],
    ["pen", "UI/UX Design", "Research, wireframe and prototype in Figma.", "Beginner friendly", "5 months"],
    ["briefcase", "Business", "Management, finance and starting your own venture.", "Beginner friendly", "6 months"],
    ["megaphone", "Marketing", "Content, SEO and ads, measured with real analytics.", "Beginner friendly", "4 months"],
  ],
  opportunities: [
    { type: "Internship", title: "Frontend Development Intern", org: "Nilesoft (demo)", where: "Cairo · Hybrid", deadline: "Oct 24", match: 92, skills: ["HTML", "CSS", "JavaScript", "React"] },
    { type: "Hackathon", title: "48-hour Campus Hackathon", org: "Student Tech Union (demo)", where: "On campus", deadline: "Oct 18", match: 87, skills: ["Teamwork", "Prototyping"] },
    { type: "Scholarship", title: "AI Research Scholarship", org: "Delta Foundation (demo)", where: "Online", deadline: "Nov 2", match: 81, skills: ["Python", "Math"] },
    { type: "Job", title: "Junior Data Analyst", org: "Insightly (demo)", where: "Giza · Hybrid", deadline: "Nov 12", match: 71, skills: ["SQL", "Excel", "Python"] },
    { type: "Competition", title: "National Cybersecurity CTF", org: "CyberEgypt (demo)", where: "Online", deadline: "Oct 30", match: 68, skills: ["Linux", "Networking"] },
    { type: "Student program", title: "Campus Ambassador Program", org: "LearnBridge (demo)", where: "Your university", deadline: "Nov 20", match: 64, skills: ["Communication"] },
  ],
  events: [
    { title: "Intro to Machine Learning workshop", type: "Workshop", m: "Oct", d: "10", time: "4:00 PM", place: "Main Hall", host: "AI Club" },
    { title: "Careers in software: alumni panel", type: "Career", m: "Oct", d: "14", time: "6:30 PM", place: "Online", host: "Career Center" },
    { title: "Campus Hackathon: build in 48 hours", type: "Hackathon", m: "Oct", d: "18", time: "9:00 AM", place: "Engineering Labs", host: "Student Tech Union" },
    { title: "Open source: your first pull request", type: "Workshop", m: "Oct", d: "26", time: "5:00 PM", place: "Online", host: "Developer Club" },
  ],
  schedule: [
    { time: "10:00", title: "Database lecture", note: "Hall B", done: true },
    { time: "12:00", title: "Break", note: "Cafeteria", done: true },
    { time: "14:00", title: "Web Development lab", note: "Lab 3", done: false },
    { time: "17:00", title: "Study session: SQL joins", note: "Database Study Group", done: false },
  ],
  defaultTasks: [
    { id: "t1", text: "Finish Database assignment", due: "Tomorrow", done: false },
    { id: "t2", text: "Study JavaScript: array methods", due: "Today", done: false },
    { id: "t3", text: "Apply for Frontend internship", due: "Oct 24", done: false },
    { id: "t4", text: "Review ERD notes", due: "Done", done: true },
  ],
  learning: { track: "Frontend Development", module: "JavaScript", progress: 62, next: "Array methods: map, filter, reduce", eta: "About 7 weeks left", steps: ["HTML", "CSS", "JavaScript", "Git", "React", "Projects"], currentStep: 2 },
  gamification: { xp: 2450, level: 12, levelName: "Builder", nextXp: 2800, streak: 12, week: [1, 1, 1, 1, 0, 1, 0],
    badges: [["flame", "7-day streak", true], ["rocket", "First project", true], ["book", "Learning starter", true], ["users", "Community member", false], ["target", "Opportunity hunter", false], ["award", "Career ready", false]] },
};
