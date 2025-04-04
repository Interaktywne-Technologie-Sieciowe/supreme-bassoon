CREATE TABLE USERS_ROLES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
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
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    description TEXT,
    last_update TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL
);

CREATE TABLE EVENTS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    conference_id UUID REFERENCES CONFERENCE(id),
    location VARCHAR(255),
    last_update TIMESTAMP NOT NULL
);

CREATE TABLE BOOKMARKS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT now(),
    event_id UUID REFERENCES EVENTS(id),
    user_id UUID REFERENCES USERS(id),
    last_update TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,  -- no need to delete the record, just switch the flag
    CONSTRAINT unique_user_event UNIQUE (user_id, event_id)  -- Ensures unique bookmarks
);


CREATE TABLE USERS_CONFERENCE (
    user_id UUID REFERENCES USERS(id),
    conference_id UUID REFERENCES CONFERENCE(id),
    PRIMARY KEY (user_id, conference_id)
);
