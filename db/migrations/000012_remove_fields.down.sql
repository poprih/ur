ALTER TABLE units ADD COLUMN is_subscribed BOOLEAN NOT NULL DEFAULT FALSE; 
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE;
