DROP TABLE IF EXISTS daily_goals CASCADE;
DROP TABLE IF EXISTS weekly_goals CASCADE;
DROP TABLE IF EXISTS monthly_goals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	user_name TEXT NOT NULL
);

CREATE TABLE weekly_goals (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(user_id),
	week_start_date DATE NOT NULL,
	deadline_date DATE,
	content TEXT,
	is_done BOOLEAN DEFAULT FALSE
);

CREATE TABLE daily_goals (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(user_id),
	weekly_goal_id INTEGER REFERENCES weekly_goals(id),
	date DATE NOT NULL,
	deadline_hour TIME DEFAULT '23:59',
	content TEXT,
	is_done BOOLEAN DEFAULT FALSE
);

CREATE TABLE monthly_goals (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(user_id),
	date DATE NOT NULL,
	deadline_date DATE,
	content TEXT,
	is_done BOOLEAN DEFAULT FALSE
);

INSERT INTO users (user_name)
VALUES ('kuba')