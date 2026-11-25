export type Priority = "high" | "normal" | "low";

export type TodoFilter = "all" | "active" | "done";

export interface Todo {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  /** 本地日期 YYYY-MM-DD，无截止日期为 null */
  due: string | null;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  sortOrder: number;
}

export interface NewTodoInput {
  title: string;
  priority: Priority;
  due: string | null;
}
