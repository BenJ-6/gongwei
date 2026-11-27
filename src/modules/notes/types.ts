export type NoteColor = "violet" | "amber" | "mint" | "rose";

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NewNoteInput {
  title: string;
  content: string;
  color: NoteColor;
}
