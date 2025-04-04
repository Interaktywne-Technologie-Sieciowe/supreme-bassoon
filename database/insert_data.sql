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
('Katarzyna', 'Jankowska', '555666777', 'katarzyna.jankowska@mail.com', 'kjankiewska', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'g' LIMIT 1)),
('Adam', 'Małysz', '533651471', 'adam.malysz@latam.bo.chce.pl', '$2b$10$anDa4/DY6IVn1B1TdeGQbOkOq708iJPOOj19pCh3orqtPY5RwDaqC', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'u' LIMIT 1)),
('Sebastian', 'Sadowy', '420692137', 'seba@sadowy.com', '$2b$10$anDa4/DY6IVn1B1TdeGQbOkOq708iJPOOj19pCh3orqtPY5RwDaqC', now(), NULL, (SELECT id FROM USERS_ROLES WHERE code = 'a' LIMIT 1)),
;

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
    'TechConnect Summit 2025',
    '2025-06-15 09:00:00',
    '2025-06-17 18:00:00',
    'TechConnect Summit brings together industry leaders, innovators, and developers to explore emerging technologies and future trends in software development, AI, cloud computing, and cybersecurity.',
    NOW(),
    'Warsaw Tech Center, Warsaw, Poland'
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
    'Opening Keynote: The Future of Technology',
    '2025-06-15 09:30:00',
    '2025-06-15 11:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Main Auditorium',
    NOW()
),
(
    'Workshop: Building Scalable Microservices',
    '2025-06-15 11:30:00',
    '2025-06-15 13:30:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Workshop Room A',
    NOW()
),
(
    'Panel Discussion: AI Ethics and Responsibility',
    '2025-06-15 14:00:00',
    '2025-06-15 15:30:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Panel Room',
    NOW()
),
(
    'Technical Deep Dive: Modern JavaScript Frameworks',
    '2025-06-16 09:00:00',
    '2025-06-16 12:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Technical Room B',
    NOW()
),
(
    'Networking Lunch',
    '2025-06-16 12:30:00',
    '2025-06-16 14:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Dining Hall',
    NOW()
),
(
    'Workshop: Cloud Security Best Practices',
    '2025-06-16 14:30:00',
    '2025-06-16 17:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Workshop Room C',
    NOW()
),
(
    'Hackathon Kickoff',
    '2025-06-16 19:00:00',
    '2025-06-16 21:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Innovation Lab',
    NOW()
),
(
    'Career Fair',
    '2025-06-17 09:00:00',
    '2025-06-17 12:00:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Exhibition Hall',
    NOW()
),
(
    'Closing Keynote: Industry Trends and Predictions',
    '2025-06-17 16:00:00',
    '2025-06-17 17:30:00',
    'b9c55818-4bbd-4a80-a2fb-9e6cfe922bab',
    'Main Auditorium',
    NOW()
);