import type { Note, NoteColor } from "./types";

export interface NoteColorOption {
  value: NoteColor;
  label: string;
  card: string;
  accent: string;
  swatch: string;
}

export const NOTE_COLORS: NoteColorOption[] = [
  {
    value: "violet",
    label: "紫色",
    card: "border-note-violet-border bg-note-violet",
    accent: "bg-note-violet-accent",
    swatch: "bg-note-violet-accent",
  },
  {
    value: "amber",
    label: "琥珀",
    card: "border-note-amber-border bg-note-amber",
    accent: "bg-note-amber-accent",
    swatch: "bg-note-amber-accent",
  },
  {
    value: "mint",
    label: "薄荷",
    card: "border-note-mint-border bg-note-mint",
    accent: "bg-note-mint-accent",
    swatch: "bg-note-mint-accent",
  },
  {
    value: "rose",
    label: "玫红",
    card: "border-note-rose-border bg-note-rose",
    accent: "bg-note-rose-accent",
    swatch: "bg-note-rose-accent",
  },
];

export const NOTE_COLOR_MAP = Object.fromEntries(
  NOTE_COLORS.map((item) => [item.value, item]),
) as Record<NoteColor, NoteColorOption>;

export function matchNotes(list: Note[], query: string): Note[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return list;
  return list.filter(
    (note) =>
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword),
  );
}

export function sortNotes(list: Note[]): Note[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatNoteTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;

  const date = new Date(timestamp);
  const now = new Date();
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (date.toDateString() === now.toDateString()) return `今天 ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `昨天 ${time}`;

  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}
