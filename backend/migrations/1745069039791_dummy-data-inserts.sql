-- Up Migration
-- USERS_ROLES
    INSERT INTO USERS_ROLES (id,name,code) 
VALUES ('9f1c7a80-3b6a-4e4b-9f87-1a5f2c3d8e9b','admin','a');

INSERT INTO USERS_ROLES (id,name,code) 
VALUES ('a7c0e2b2-55b4-4c31-8ec3-0e7f61f24d35','user','u');

-- USERS
INSERT INTO USERS (name, surname, phone, email, password, created_at, last_login, role_id)
VALUES
('Jan', 'Kowalski', '123456789', 'jan.kowalski@mail.com', 'jkowalski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'a' LIMIT 1)),

('Ewa', 'Nowak', '987654321', 'ewa.nowak@mail.com', 'enowak', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('Jan', 'Wiśniewski', '111222333', 'jan.wisniewski@mail.com', 'jwisniewski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('Maria', 'Dąbrowska', '444555666', 'maria.dabrowska@mail.com', 'mdebrowska', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('Piotr', 'Lewandowski', '777888999', 'piotr.lewandowski@mail.com', 'plewandowski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('Anna', 'Zielińska', '333222111', 'anna.zielinska@mail.com', 'azielinska', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('Tomasz', 'Szymański', '666777888', 'tomasz.szymanski@mail.com', 'tszymanowski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('Karolina', 'Wójcik', '999000111', 'karolina.wojcik@mail.com', 'kwojcik', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('Marek', 'Kozłowski', '222333444', 'marek.kozlowski@mail.com', 'mkozlowski', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1));

INSERT INTO USERS (id, name, surname, phone, email, password, created_at, last_login, role_id) 
VALUES
('fd8a8522-111a-4dcb-b434-24f955917452','Katarzyna', 'Jankowska', '555666777', 'katarzyna.jankowska@mail.com', 'kjankiewska', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('fd8a8522-222b-4dcb-b434-24f955917452','Adam', 'Małysz', '533651471', 'adam.malysz@latam.bo.chce.pl', '$2b$10$anDa4/DY6IVn1B1TdeGQbOkOq708iJPOOj19pCh3orqtPY5RwDaqC', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),

('fd8a8522-333c-4dcb-b434-24f955917452','Sebastian', 'Sadowy', '420692137', 'seba@sadowy.com', '$2b$10$anDa4/DY6IVn1B1TdeGQbOkOq708iJPOOj19pCh3orqtPY5RwDaqC', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'a' LIMIT 1));
-- Insert a conference
INSERT INTO CONFERENCE (
    id,
    name,
    start_date,
    end_date,
    description,
    last_update,
    location
) VALUES (
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    '',
    '2025-06-15 09:00:00',
    '2025-06-17 18:00:00',
    'Centrum Biznesowe Synergia to zrewitalizowany kompleks biurowo-konferencyjny w centrum Łodzi, oferujący nowoczesne sale szkoleniowe i eventowe z pełnym wyposażeniem.',
    NOW(),
    'ul. Wioślarska 8, 00-411 Warszawa'
) RETURNING id;

-- Insert events for the conference
INSERT INTO EVENTS (
    name,
    start_date,
    end_date,
    conference_id,
    location,
    last_update
) VALUES
(
    'Śniadanie IT Liderów',
    '2025-06-15 09:30:00',
    '2025-06-15 11:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'ul. Łąkowa 29, 90-554 Łódź',
    NOW()
),
(
    'Microserwisy w Praktyce',
    '2025-06-15 11:30:00',
    '2025-06-15 13:30:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'ul. Ogrodowa 16, 91-065 Łódź',
    NOW()
),
(
    'Frontend: React i Vue',
    '2025-06-15 14:00:00',
    '2025-06-15 15:30:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'ul. Ogrodowa 17, 91-065 Łódź',
    NOW()
),
(
    'AI i Big Data',
    '2025-06-16 09:00:00',
    '2025-06-16 12:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'ul. Targowa 1/3, 90-022 Łódź',
    NOW()
),
(
    'Wizualizacja Danych',
    '2025-06-16 12:30:00',
    '2025-06-16 14:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'ul. Targowa 1/3, 90-022 Łódź',
    NOW()
),
(
    'Etyka AI',
    '2025-06-16 14:30:00',
    '2025-06-16 17:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Plac Dąbrowskiego 1, 90-249 Łódź',
    NOW()
),
(
    'Tech Summit 2025',
    '2025-06-16 19:00:00',
    '2025-06-16 21:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'al. Bandurskiego 7, 94-020 Łódź',
    NOW()
),
(
    'Warsztaty Dev',
    '2025-06-17 09:00:00',
    '2025-06-17 12:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'ul. Skorupki 21, 90-532 Łódź',
    NOW()
),
(
    'Networking i Startupy',
    '2025-06-17 16:00:00',
    '2025-06-17 17:30:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'ul. Drewnowska 58, 91-002 Łódź',
    NOW()
);



-- Down Migration

-- Down Migration

-- Delete from BOOKMARKS
DELETE FROM BOOKMARKS
WHERE user_id IN (
    'fd8a8522-333c-4dcb-b434-24f955917452',
    'fd8a8522-222b-4dcb-b434-24f955917452'
);

-- Delete from EVENTS (GameVerse Expo 2025)
DELETE FROM EVENTS WHERE conference_id = 'd947b8c2-8a01-4788-a850-4334428c85a0';

-- Delete from CONFERENCE (GameVerse Expo 2025)
DELETE FROM CONFERENCE WHERE id = 'd947b8c2-8a01-4788-a850-4334428c85a0';

-- Delete from EVENTS (TechConnect Summit 2025)
DELETE FROM EVENTS WHERE conference_id = 'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab';

-- Delete from CONFERENCE (TechConnect Summit 2025)
DELETE FROM CONFERENCE WHERE id = 'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab';

-- Delete from USERS (specific ones with known UUIDs)
DELETE FROM USERS WHERE id IN (
    'fd8a8522-111a-4dcb-b434-24f955917452',
    'fd8a8522-222b-4dcb-b434-24f955917452',
    'fd8a8522-333c-4dcb-b434-24f955917452'
);

-- Delete from USERS (the ones created with SELECT subqueries)
DELETE FROM USERS WHERE email IN (
    'jan.kowalski@mail.com',
    'ewa.nowak@mail.com',
    'jan.wisniewski@mail.com',
    'maria.dabrowska@mail.com',
    'piotr.lewandowski@mail.com',
    'anna.zielinska@mail.com',
    'tomasz.szymanski@mail.com',
    'karolina.wojcik@mail.com',
    'marek.kozlowski@mail.com'
);

-- Delete from USERS_ROLES
DELETE FROM USERS_ROLES WHERE id IN (
    '9f1c7a80-3b6a-4e4b-9f87-1a5f2c3d8e9b',
    'a7c0e2b2-55b4-4c31-8ec3-0e7f61f24d35'
);
