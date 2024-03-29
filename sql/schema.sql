
CREATE TABLE users (
  id serial primary key,
  name varchar(64) NOT NULL,
  username character varying(64) NOT NULL UNIQUE,
  password character varying(256) NOT NULL,
  admin BOOLEAN NOT NULL
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL,
  name VARCHAR(64) NOT NULL UNIQUE,
  slug VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT userid FOREIGN KEY (userid) REFERENCES users(id)
);

CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  comment TEXT,
  event INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT event FOREIGN KEY (event) REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT name FOREIGN KEY (name) REFERENCES users(username)
);
