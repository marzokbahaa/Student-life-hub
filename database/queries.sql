-- Handy example queries for the API layer.
-- Full profile header for a user
SELECT u.full_name, p.headline, p.about, COALESCE(un.name, p.university_text) AS university, COALESCE(m.name, p.major_text) AS major, p.academic_year, p.xp
FROM users u JOIN student_profiles p ON p.user_id = u.id
LEFT JOIN universities un ON un.id = p.university_id LEFT JOIN majors m ON m.id = p.major_id
WHERE u.id = $1;
-- Skills for a user
SELECT s.name, us.level FROM user_skills us JOIN skills s ON s.id = us.skill_id WHERE us.user_id = $1 ORDER BY s.name;
-- Open tasks (dashboard)
SELECT id, title, due_on FROM tasks WHERE user_id = $1 AND status = 'todo' ORDER BY due_on NULLS LAST LIMIT 10;
-- Opportunities with a simple skill-overlap score (demo matching, not AI)
SELECT o.id, o.title, o.organization,
       round(100.0 * cardinality(ARRAY(SELECT unnest(o.required_skills) INTERSECT SELECT s.name::text FROM user_skills us JOIN skills s ON s.id = us.skill_id WHERE us.user_id = $1))
             / GREATEST(cardinality(o.required_skills),1)) AS match_percent
FROM opportunities o WHERE o.deadline >= CURRENT_DATE ORDER BY match_percent DESC, o.deadline LIMIT 6;
