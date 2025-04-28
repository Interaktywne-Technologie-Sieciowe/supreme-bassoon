-- Up Migration

CREATE TABLE
    USERS_ROLES (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name VARCHAR(255) UNIQUE NOT NULL,
        code VARCHAR(10) UNIQUE NOT NULL
    );

CREATE TABLE
    USERS (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        phone CHAR(9),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now (),
        last_login TIMESTAMP,
        role_id UUID REFERENCES USERS_ROLES (id) ON DELETE SET NULL -- Role can be set to NULL if the role is deleted
    );

CREATE TABLE
    PASSWORD_RESET_TOKENS (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE
    CONFERENCE (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now (),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        description TEXT,
        last_update TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL
    );

CREATE TABLE
    EVENTS (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now (),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        conference_id UUID REFERENCES CONFERENCE (id) ON DELETE CASCADE, -- If conference is deleted, delete associated events
        location VARCHAR(255),
        last_update TIMESTAMP NOT NULL
    );

CREATE TABLE
    BOOKMARKS (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        created_at TIMESTAMP DEFAULT now (),
        event_id UUID REFERENCES EVENTS (id) ON DELETE CASCADE, -- If event is deleted, delete associated bookmarks
        user_id UUID REFERENCES USERS (id) ON DELETE CASCADE, -- If user is deleted, delete associated bookmarks
        last_update TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE, -- no need to delete the record, just switch the flag  
        CONSTRAINT unique_user_event UNIQUE (user_id, event_id) -- Ensures unique bookmarks  
    );

CREATE TABLE
    USERS_CONFERENCE (
        user_id UUID REFERENCES USERS (id) ON DELETE CASCADE, -- If user is deleted, delete associated conference records
        conference_id UUID REFERENCES CONFERENCE (id) ON DELETE CASCADE, -- If conference is deleted, delete associated conference records
        PRIMARY KEY (user_id, conference_id)
    );


-- Down Migration

DROP TABLE IF EXISTS USERS_CONFERENCE CASCADE;

DROP TABLE IF EXISTS BOOKMARKS CASCADE;

DROP TABLE IF EXISTS EVENTS CASCADE;

DROP TABLE IF EXISTS CONFERENCE CASCADE;

DROP TABLE IF EXISTS USERS CASCADE;

DROP TABLE IF EXISTS USERS_ROLES CASCADE;

DROP TABLE IF EXISTS PASSWORD_RESET_TOKENS CASCADE;
