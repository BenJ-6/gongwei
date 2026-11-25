import type { Priority, Todo, TodoFilter } from "./types";

const DAY_MS = 86_400_000;

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "高",
  normal: "普通",
  low: "低",
};

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** 本地日期字符串 YYYY-MM-DD */
export function todayStr(base = new Date()): string {
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

export function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return todayStr(date);
}

/** 两个 YYYY-MM-DD 相差天数（按 UTC 计算，避免夏令时误差） */
function diffDays(target: string, base: string): number {
  const [ty, tm, td] = target.split("-").map(Number);
  const [by, bm, bd] = base.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(by, bm - 1, bd)) / DAY_MS);
}

export type DueTone = "over" | "today" | "soon" | "normal";

export interface DueInfo {
  text: string;
  tone: DueTone;
}

export function dueInfo(due: string | null): DueInfo | null {
  if (!due) return null;

  const diff = diffDays(due, todayStr());
  if (diff < 0) return { text: `逾期 ${Math.abs(diff)} 天`, tone: "over" };
  if (diff === 0) return { text: "今天到期", tone: "today" };
  if (diff === 1) return { text: "明天到期", tone: "soon" };
  if (diff === 2) return { text: "后天到期", tone: "soon" };
  if (diff <= 7) return { text: `${diff} 天后`, tone: "normal" };

  const [, month, day] = due.split("-").map(Number);
  return { text: `${month} 月 ${day} 日`, tone: "normal" };
}

export function isUrgent(todo: Todo): boolean {
  if (todo.done || !todo.due) return false;
  return todo.due <= todayStr();
}

export function filterTodos(list: Todo[], filter: TodoFilter, query: string): Todo[] {
  const keyword = query.trim().toLowerCase();
  return list.filter((todo) => {
    if (filter === "active" && todo.done) return false;
    if (filter === "done" && !todo.done) return false;
    if (!keyword) return true;
    return todo.title.toLowerCase().includes(keyword);
  });
}

export function sortTodos(list: Todo[]): Todo[] {
  return [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (PRIORITY_WEIGHT[a.priority] !== PRIORITY_WEIGHT[b.priority]) {
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    if (a.due && b.due && a.due !== b.due) return a.due < b.due ? -1 : 1;
    if (a.due && !b.due) return -1;
    if (!a.due && b.due) return 1;
    return b.createdAt - a.createdAt;
  });
}

export function formatToday(base = new Date()): string {
  const week = ["日", "一", "二", "三", "四", "五", "六"][base.getDay()];
  return `${base.getFullYear()} 年 ${base.getMonth() + 1} 月 ${base.getDate()} 日 · 星期${week}`;
}
