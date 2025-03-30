CREATE TABLE USERS_ROLES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
);

CREATE TABLE USERS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    phone CHAR(9),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    last_login TIMESTAMP,
    role_id UUID REFERENCES USERS_ROLES(id)
);

CREATE TABLE CONFERENCE (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT
);

CREATE TABLE EVENTS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    conference_id UUID REFERENCES CONFERENCE(id)
);

CREATE TABLE BOOKMARKS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT now(),
    event_id UUID REFERENCES EVENTS(id),
    user_id UUID REFERENCES USERS(id)
);


CREATE TABLE USERS_CONFERENCE (
    user_id UUID REFERENCES USERS(id),
    conference_id UUID REFERENCES CONFERENCE(id),
    PRIMARY KEY (user_id, conference_id)
);


INSERT INTO USERS_ROLES (name) 
VALUES ('guest');

INSERT INTO USERS (name, surname, phone, email, password, role_id) 
VALUES ('Jan', 'Kowalski', '123456789', 'jankowalski@mail.com', 'jkowalski',
       (SELECT id FROM USERS_ROLES WHERE name = 'guest' LIMIT 1));
       
       
