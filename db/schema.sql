--
-- File generato con SQLiteStudio v3.4.12 su lun dic 30 16:48:48 2024
--
-- Codifica del testo utilizzata: UTF-8
--
PRAGMA foreign_keys = off;

BEGIN TRANSACTION;

-- Tabella: attachments
DROP TABLE IF EXISTS attachments;

CREATE TABLE
  IF NOT EXISTS attachments (
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

-- Tabella: notes
DROP TABLE IF EXISTS notes;

CREATE TABLE
  IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    favourite BOOLEAN NOT NULL DEFAULT (0),
    archived BOOLEAN NOT NULL DEFAULT (0),
    trash BOOLEAN DEFAULT (0) NOT NULL,
    created TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    updated TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
  );

-- Tabella: notes_tags
DROP TABLE IF EXISTS notes_tags;

CREATE TABLE
  IF NOT EXISTS notes_tags (
    note_id NUMERIC REFERENCES notes (id) ON DELETE CASCADE,
    tag_id NUMERIC REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
  );

-- Tabella: tags
DROP TABLE IF EXISTS tags;

CREATE TABLE
  IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    tag TEXT NOT NULL
  );

-- triggers
CREATE TRIGGER update_timestamp AFTER
UPDATE ON notes FOR EACH ROW WHEN OLD.updated != DATETIME ('NOW', 'localtime') BEGIN
UPDATE notes
SET
  updated = DATETIME ('now', 'localtime')
WHERE
  id = new.id;

END;

COMMIT TRANSACTION;

PRAGMA foreign_keys = on;
