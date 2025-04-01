-- USERS_ROLES
INSERT INTO USERS_ROLES (name,code) 
VALUES ('guest','g');

-- USERS
INSERT INTO USERS (name, surname, phone, email, password, role_id) 
VALUES ('Jan', 'Kowalski', '123456789', 'jankowalski@mail.com', 'jkowalski',
       (SELECT id FROM USERS_ROLES WHERE name = 'guest' LIMIT 1));
