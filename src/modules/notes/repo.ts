import type Database from "@tauri-apps/plugin-sql";
import { getDbUrl } from "@/lib/db";
import { isTauri } from "@/lib/env";
import type { Note, NoteColor } from "./types";

export interface NoteRepo {
  list(): Promise<Note[]>;
  create(note: Note): Promise<void>;
  update(note: Note): Promise<void>;
  remove(id: string): Promise<void>;
}

const LOCAL_KEY = "gongwei:notes:v1";

interface NoteRow {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: number;
  created_at: number;
  updated_at: number;
}

const COLUMNS = "id, title, content, color, pinned, created_at, updated_at";

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    color: row.color,
    pinned: Boolean(row.pinned),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class SqliteNoteRepo implements NoteRepo {
  private db: Database | null = null;

  private async conn(): Promise<Database> {
    if (!this.db) {
      const { default: SqlDatabase } = await import("@tauri-apps/plugin-sql");
      this.db = await SqlDatabase.load(await getDbUrl());
    }
    return this.db;
  }

  async list(): Promise<Note[]> {
    const db = await this.conn();
    const rows = await db.select<NoteRow[]>(
      `SELECT ${COLUMNS} FROM notes ORDER BY pinned DESC, updated_at DESC`,
    );
    return rows.map(toNote);
  }

  async create(note: Note): Promise<void> {
    const db = await this.conn();
    await db.execute(
      `INSERT INTO notes (${COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        note.id,
        note.title,
        note.content,
        note.color,
        note.pinned ? 1 : 0,
        note.createdAt,
        note.updatedAt,
      ],
    );
  }

  async update(note: Note): Promise<void> {
    const db = await this.conn();
    await db.execute(
      `UPDATE notes
         SET title = $2, content = $3, color = $4, pinned = $5, updated_at = $6
       WHERE id = $1`,
      [note.id, note.title, note.content, note.color, note.pinned ? 1 : 0, note.updatedAt],
    );
  }

  async remove(id: string): Promise<void> {
    const db = await this.conn();
    await db.execute("DELETE FROM notes WHERE id = $1", [id]);
  }
}

/** 浏览器直开时的降级实现，方便纯前端调试 */
class LocalNoteRepo implements NoteRepo {
  private read(): Note[] {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? (JSON.parse(raw) as Note[]) : [];
    } catch {
      return [];
    }
  }

  private write(list: Note[]): void {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  }

  async list(): Promise<Note[]> {
    return this.read();
  }

  async create(note: Note): Promise<void> {
    this.write([note, ...this.read()]);
  }

  async update(note: Note): Promise<void> {
    this.write(this.read().map((item) => (item.id === note.id ? note : item)));
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((item) => item.id !== id));
  }
}

export const noteRepo: NoteRepo = isTauri ? new SqliteNoteRepo() : new LocalNoteRepo();
