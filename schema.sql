CREATE DATABASE digital_login_system;
USE digital_login_system;

CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(60) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO users (email, password, firstname, lastname)
VALUES ('example@example.com', 'Password.1', 'John', 'Doe');