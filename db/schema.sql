BEGIN TRANSACTION;

DROP TABLE IF EXISTS "attachments";

CREATE TABLE
  attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER REFERENCES notes (id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    display_name TEXT,
    caption TEXT,
    mime TEXT NOT NULL,
    width NUMERIC(5),
    height NUMERIC(5),
    size NUMERIC
  );

DROP TABLE IF EXISTS "notes";

CREATE TABLE
  notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    archived BOOLEAN NOT NULL DEFAULT (0),
    trash TEXT DEFAULT (0),
    created TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    updated TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
  );

DROP TABLE IF EXISTS "notes_tags";

CREATE TABLE
  notes_tags (
    note_id NUMERIC REFERENCES notes (id) ON DELETE CASCADE,
    tag_id NUMERIC REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
  );

DROP TABLE IF EXISTS "tags";

CREATE TABLE
  tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    tag TEXT NOT NULL
  );

DROP INDEX IF EXISTS "note_idx";

CREATE INDEX note_idx ON attachments (note_id ASC);

DROP INDEX IF EXISTS "title_idx";

CREATE INDEX title_idx ON notes (title ASC);

DROP TRIGGER IF EXISTS "onupdate";

CREATE TRIGGER onupdate AFTER
UPDATE ON notes FOR EACH ROW WHEN NEW.updated < OLD.updated BEGIN
UPDATE notes
SET
  updated = CURRENT_TIMESTAMP
WHERE
  id = NEW.id;

END;

COMMIT;