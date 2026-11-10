BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- case-insensitive email

CREATE TYPE user_role AS ENUM ('student','university_admin','club_admin','mentor','company','super_admin');
CREATE TYPE skill_level AS ENUM ('beginner','intermediate','advanced');
CREATE TYPE theme_pref AS ENUM ('system','light','dark');
CREATE TYPE task_status AS ENUM ('todo','done');
CREATE TYPE opportunity_type AS ENUM ('internship','job','scholarship','hackathon','competition','fellowship','student_program','volunteering');
CREATE TYPE application_status AS ENUM ('saved','applied','interview','accepted','rejected');

-- ---------- Reference data ----------
CREATE TABLE universities (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  country     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE faculties (
  id            SERIAL PRIMARY KEY,
  university_id INT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  UNIQUE (university_id, name)
);
CREATE TABLE majors (
  id         SERIAL PRIMARY KEY,
  faculty_id INT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  UNIQUE (faculty_id, name)
);
CREATE TABLE skills    (id SERIAL PRIMARY KEY, name CITEXT NOT NULL UNIQUE);
CREATE TABLE interests (id SERIAL PRIMARY KEY, name CITEXT NOT NULL UNIQUE);
CREATE TABLE goals     (id SERIAL PRIMARY KEY, name CITEXT NOT NULL UNIQUE);

-- ---------- Users & profile ----------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                 -- bcrypt / argon2 hash. NEVER plain text.
  full_name     TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'student',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE student_profiles (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline         TEXT,
  about            TEXT,
  avatar_url       TEXT,
  cover_style      SMALLINT NOT NULL DEFAULT 1 CHECK (cover_style BETWEEN 1 AND 4),
  location         TEXT,
  university_id    INT REFERENCES universities(id),
  faculty_id       INT REFERENCES faculties(id),
  major_id         INT REFERENCES majors(id),
  university_text  TEXT,                       -- free text when the university is not in the list yet
  major_text       TEXT,
  academic_year    TEXT,
  experience_level skill_level,
  weekly_hours     SMALLINT NOT NULL DEFAULT 0 CHECK (weekly_hours BETWEEN 0 AND 80),
  theme            theme_pref NOT NULL DEFAULT 'system',   -- optional dark / light mode
  xp               INT NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_skills    (user_id UUID REFERENCES users(id) ON DELETE CASCADE, skill_id INT REFERENCES skills(id), level skill_level, PRIMARY KEY (user_id, skill_id));
CREATE TABLE user_interests (user_id UUID REFERENCES users(id) ON DELETE CASCADE, interest_id INT REFERENCES interests(id), PRIMARY KEY (user_id, interest_id));
CREATE TABLE user_goals     (user_id UUID REFERENCES users(id) ON DELETE CASCADE, goal_id INT REFERENCES goals(id), PRIMARY KEY (user_id, goal_id));

-- ---------- Profile sections (each row = one entry the student added) ----------
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school TEXT NOT NULL, degree TEXT, start_label TEXT, end_label TEXT, details TEXT, position INT NOT NULL DEFAULT 0
);
CREATE TABLE experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, organization TEXT, start_label TEXT, end_label TEXT, details TEXT, position INT NOT NULL DEFAULT 0
);
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT, technologies TEXT[], role TEXT,
  link TEXT CHECK (link IS NULL OR link ~* '^https?://'), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, issuer TEXT, issued_label TEXT, link TEXT CHECK (link IS NULL OR link ~* '^https?://')
);
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, achieved_label TEXT, details TEXT
);
CREATE TABLE user_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL, proficiency TEXT
);
CREATE TABLE user_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL, url TEXT NOT NULL CHECK (url ~* '^https?://')
);

-- ---------- Learning ----------
CREATE TABLE learning_tracks (
  id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, summary TEXT,
  level skill_level NOT NULL DEFAULT 'beginner', duration_months SMALLINT
);
CREATE TABLE learning_modules (
  id SERIAL PRIMARY KEY, track_id INT NOT NULL REFERENCES learning_tracks(id) ON DELETE CASCADE,
  name TEXT NOT NULL, position INT NOT NULL, UNIQUE (track_id, position)
);
CREATE TABLE module_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, module_id INT REFERENCES learning_modules(id) ON DELETE CASCADE,
  percent SMALLINT NOT NULL DEFAULT 0 CHECK (percent BETWEEN 0 AND 100), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module_id)
);

-- ---------- Opportunities & events ----------
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY, type opportunity_type NOT NULL, title TEXT NOT NULL, organization TEXT NOT NULL,
  location TEXT, is_remote BOOLEAN NOT NULL DEFAULT FALSE, deadline DATE, description TEXT, required_skills TEXT[],
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE applications (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, opportunity_id INT REFERENCES opportunities(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'saved', updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, opportunity_id)
);
CREATE TABLE events (
  id SERIAL PRIMARY KEY, title TEXT NOT NULL, category TEXT, starts_at TIMESTAMPTZ NOT NULL, place TEXT, is_online BOOLEAN NOT NULL DEFAULT FALSE,
  organizer TEXT, is_demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE event_registrations (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, event_id INT REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (user_id, event_id)
);

-- ---------- Productivity ----------
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, due_on DATE, status task_status NOT NULL DEFAULT 'todo', completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Gamification ----------
CREATE TABLE badges (id SERIAL PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT);
CREATE TABLE user_badges (user_id UUID REFERENCES users(id) ON DELETE CASCADE, badge_id INT REFERENCES badges(id), earned_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (user_id, badge_id));

-- ---------- Indexes ----------
CREATE INDEX idx_projects_user      ON projects(user_id);
CREATE INDEX idx_education_user     ON education(user_id);
CREATE INDEX idx_experience_user    ON experience(user_id);
CREATE INDEX idx_tasks_user_status  ON tasks(user_id, status);
CREATE INDEX idx_opps_deadline      ON opportunities(deadline);
CREATE INDEX idx_events_starts      ON events(starts_at);

-- ---------- Useful view: profile completion inputs ----------
CREATE VIEW v_profile_counts AS
SELECT p.user_id,
       (SELECT count(*) FROM user_skills   s WHERE s.user_id = p.user_id) AS skills,
       (SELECT count(*) FROM projects      j WHERE j.user_id = p.user_id) AS projects,
       (SELECT count(*) FROM education     e WHERE e.user_id = p.user_id) AS education,
       (SELECT count(*) FROM certificates  c WHERE c.user_id = p.user_id) AS certificates,
       (SELECT count(*) FROM user_links    l WHERE l.user_id = p.user_id) AS links
FROM student_profiles p;

COMMIT;
