-- create db and user
use ucode_web;
-- DROP TABLE users;
CREATE TABLE IF NOT EXISTS users(
    id INT NOT NULL AUTO_INCREMENT,
    login CHAR(32) NOT NULL UNIQUE,
    full_name CHAR(50) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password CHAR(255),
    role_id INT NOT NULL default 1,
    PRIMARY KEY (id),
    foreign key(role_id) references roles(id)
);

CREATE TABLE if not exists roles (
	id INT auto_increment NOT NULL,
    name CHAR(32) NOT NULL UNIQUE,
    primary key (id)
);

INSERT INTO roles(name)
	values('user'),
    ('admin')
    on duplicate key update
    name = name;

