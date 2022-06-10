-- create db and user
use ucode_web;
-- DROP TABLE users;
CREATE TABLE IF NOT EXISTS users(
    id INT NOT NULL AUTO_INCREMENT,
    login CHAR(32) NOT NULL UNIQUE,
    full_name CHAR(50) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password CHAR(255),
    PRIMARY KEY (id)
)
