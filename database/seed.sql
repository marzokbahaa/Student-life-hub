-- DEMO SEED DATA (fictional). Run after schema.sql.
BEGIN;
INSERT INTO universities (name, country) VALUES ('Menoufia University','Egypt'),('Cairo University','Egypt'),('Ain Shams University','Egypt');
INSERT INTO faculties (university_id, name) SELECT id, 'Computers and Information' FROM universities;
INSERT INTO majors (faculty_id, name) SELECT f.id, m FROM faculties f, unnest(ARRAY['Computer Science','Information Systems','Artificial Intelligence']) AS m;
INSERT INTO skills (name) VALUES ('HTML'),('CSS'),('JavaScript'),('Python'),('SQL'),('Git'),('React'),('Figma');
INSERT INTO interests (name) VALUES ('Web Development'),('AI'),('Cybersecurity'),('Data'),('Design'),('Business');
INSERT INTO goals (name) VALUES ('Get an internship'),('Build projects'),('Build portfolio'),('Improve GPA');
INSERT INTO learning_tracks (slug, name, summary, level, duration_months) VALUES
 ('frontend','Frontend Development','Build interfaces people enjoy using.','beginner',6),
 ('backend','Backend Development','APIs, databases and server logic.','intermediate',7),
 ('ai','AI / Machine Learning','Python, math and models.','advanced',12);
INSERT INTO learning_modules (track_id, name, position) SELECT t.id, m.name, m.pos FROM learning_tracks t
 JOIN (VALUES ('HTML',1),('CSS',2),('JavaScript',3),('Git',4),('React',5),('Projects',6)) AS m(name,pos) ON t.slug = 'frontend';
INSERT INTO badges (code, name, description) VALUES ('streak7','7-day streak','Learn 7 days in a row'),('first_project','First project','Add your first project'),('learning_starter','Learning starter','Finish your first module');
INSERT INTO opportunities (type, title, organization, location, is_remote, deadline, required_skills, is_demo) VALUES
 ('internship','Frontend Development Intern','Nilesoft (demo)','Cairo',FALSE,'2026-10-24',ARRAY['HTML','CSS','JavaScript','React'],TRUE),
 ('hackathon','48-hour Campus Hackathon','Student Tech Union (demo)','Menoufia',FALSE,'2026-10-18',ARRAY['Teamwork'],TRUE),
 ('scholarship','AI Research Scholarship','Delta Foundation (demo)','Online',TRUE,'2026-11-02',ARRAY['Python','Math'],TRUE);
INSERT INTO events (title, category, starts_at, place, is_online, organizer, is_demo) VALUES
 ('Intro to Machine Learning workshop','Workshop','2026-10-10 16:00+03','Main Hall',FALSE,'AI Club',TRUE),
 ('Careers in software: alumni panel','Career','2026-10-14 18:30+03','Online',TRUE,'Career Center',TRUE);
-- NOTE: no demo users are seeded. Users must be created through the API so passwords are hashed with bcrypt/argon2.
COMMIT;
