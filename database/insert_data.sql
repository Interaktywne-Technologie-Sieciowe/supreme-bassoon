-- USERS_ROLES
INSERT INTO USERS_ROLES (name,code) 
VALUES ('guest','g');

INSERT INTO USERS_ROLES (name,code) 
VALUES ('admin','a');

INSERT INTO USERS_ROLES (name,code) 
VALUES ('user','u');

-- USERS
INSERT INTO USERS (name, surname, phone, email, password, created_at, last_login, role_id) VALUES
('Jan', 'Kowalski', '123456789', 'jan.kowalski@mail.com', 'jkowalski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'a' LIMIT 1)),
('Ewa', 'Nowak', '987654321', 'ewa.nowak@mail.com', 'enowak', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),
('Jan', 'Wiśniewski', '111222333', 'jan.wisniewski@mail.com', 'jwisniewski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),
('Maria', 'Dąbrowska', '444555666', 'maria.dabrowska@mail.com', 'mdebrowska', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),
('Piotr', 'Lewandowski', '777888999', 'piotr.lewandowski@mail.com', 'plewandowski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),
('Anna', 'Zielińska', '333222111', 'anna.zielinska@mail.com', 'azielinska', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'g' LIMIT 1)),
('Tomasz', 'Szymański', '666777888', 'tomasz.szymanski@mail.com', 'tszymanowski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'g' LIMIT 1)),
('Karolina', 'Wójcik', '999000111', 'karolina.wojcik@mail.com', 'kwojcik', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'g' LIMIT 1)),
('Marek', 'Kozłowski', '222333444', 'marek.kozlowski@mail.com', 'mkozlowski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'g' LIMIT 1)),
('Katarzyna', 'Jankowska', '555666777', 'katarzyna.jankowska@mail.com', 'kjankiewska', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'g' LIMIT 1));
