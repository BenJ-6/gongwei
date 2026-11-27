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
    card: "border-[#e6d9ff] bg-[#f6f1ff] dark:border-[#4a3a68] dark:bg-[#302447]",
    accent: "bg-[#8d63e8]",
    swatch: "bg-[#8d63e8]",
  },
  {
    value: "amber",
    label: "琥珀",
    card: "border-[#f4e3b8] bg-[#fff9eb] dark:border-[#5a4828] dark:bg-[#3a3020]",
    accent: "bg-[#dda53c]",
    swatch: "bg-[#dda53c]",
  },
  {
    value: "mint",
    label: "薄荷",
    card: "border-[#cfe9d8] bg-[#eff9f3] dark:border-[#355c49] dark:bg-[#23382f]",
    accent: "bg-[#4fa97a]",
    swatch: "bg-[#4fa97a]",
  },
  {
    value: "rose",
    label: "玫红",
    card: "border-[#f3d6de] bg-[#fff2f5] dark:border-[#63404c] dark:bg-[#3d2830]",
    accent: "bg-[#dc7b96]",
    swatch: "bg-[#dc7b96]",
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
