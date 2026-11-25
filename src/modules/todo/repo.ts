import type Database from "@tauri-apps/plugin-sql";
import { isTauri } from "@/lib/env";
import type { Todo } from "./types";

export interface TodoRepo {
  list(): Promise<Todo[]>;
  create(todo: Todo): Promise<void>;
  update(todo: Todo): Promise<void>;
  remove(id: string): Promise<void>;
  clearCompleted(): Promise<void>;
}

const DB_URL = "sqlite:workbench.db";
const LOCAL_KEY = "gongwei:todos:v1";

interface TodoRow {
  id: string;
  title: string;
  done: number;
  priority: Todo["priority"];
  due: string | null;
  created_at: number;
  updated_at: number;
  completed_at: number | null;
  sort_order: number;
}

const COLUMNS =
  "id, title, done, priority, due, created_at, updated_at, completed_at, sort_order";

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done),
    priority: row.priority,
    due: row.due ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? null,
    sortOrder: row.sort_order,
  };
}

class SqliteTodoRepo implements TodoRepo {
  private db: Database | null = null;

  private async conn(): Promise<Database> {
    if (!this.db) {
      const { default: SqlDatabase } = await import("@tauri-apps/plugin-sql");
      this.db = await SqlDatabase.load(DB_URL);
    }
    return this.db;
  }

  async list(): Promise<Todo[]> {
    const db = await this.conn();
    const rows = await db.select<TodoRow[]>(
      `SELECT ${COLUMNS} FROM todos ORDER BY sort_order ASC, created_at DESC`,
    );
    return rows.map(toTodo);
  }

  async create(todo: Todo): Promise<void> {
    const db = await this.conn();
    await db.execute(
      `INSERT INTO todos (${COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        todo.id,
        todo.title,
        todo.done ? 1 : 0,
        todo.priority,
        todo.due,
        todo.createdAt,
        todo.updatedAt,
        todo.completedAt,
        todo.sortOrder,
      ],
    );
  }

  async update(todo: Todo): Promise<void> {
    const db = await this.conn();
    await db.execute(
      `UPDATE todos
         SET title = $2, done = $3, priority = $4, due = $5,
             updated_at = $6, completed_at = $7, sort_order = $8
       WHERE id = $1`,
      [
        todo.id,
        todo.title,
        todo.done ? 1 : 0,
        todo.priority,
        todo.due,
        todo.updatedAt,
        todo.completedAt,
        todo.sortOrder,
      ],
    );
  }

  async remove(id: string): Promise<void> {
    const db = await this.conn();
    await db.execute("DELETE FROM todos WHERE id = $1", [id]);
  }

  async clearCompleted(): Promise<void> {
    const db = await this.conn();
    await db.execute("DELETE FROM todos WHERE done = 1");
  }
}

/** 浏览器直开时的降级实现，方便纯前端调试 */
class LocalTodoRepo implements TodoRepo {
  private read(): Todo[] {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? (JSON.parse(raw) as Todo[]) : [];
    } catch {
      return [];
    }
  }

  private write(list: Todo[]): void {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  }

  async list(): Promise<Todo[]> {
    return this.read();
  }

  async create(todo: Todo): Promise<void> {
    this.write([todo, ...this.read()]);
  }

  async update(todo: Todo): Promise<void> {
    this.write(this.read().map((item) => (item.id === todo.id ? todo : item)));
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((item) => item.id !== id));
  }

  async clearCompleted(): Promise<void> {
    this.write(this.read().filter((item) => !item.done));
  }
}

export const todoRepo: TodoRepo = isTauri ? new SqliteTodoRepo() : new LocalTodoRepo();
