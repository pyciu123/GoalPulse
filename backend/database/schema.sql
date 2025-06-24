CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	user_name TEXT NOT NULL
);

CREATE TABLE daily_goals (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(user_id),
	date DATE NOT NULL,
	deadline_hour TIME DEFAULT '23:59',
	content TEXT,
	is_done BOOLEAN DEFAULT FALSE
);

CREATE TABLE weekly_goals (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(user_id),
	date DATE NOT NULL,
	deadline_date DATE,
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