import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { uid } from "@/lib/id";
import { matchNotes, sortNotes } from "./domain";
import { noteRepo } from "./repo";
import type { NewNoteInput, Note } from "./types";

async function persist(task: () => Promise<void>): Promise<void> {
  try {
    await task();
  } catch (error) {
    console.error("[notes] 数据持久化失败", error);
  }
}

function titleFromContent(content: string): string {
  const firstLine = content.split(/\r?\n/, 1)[0].trim();
  if (!firstLine) return "未命名便签";
  return firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine;
}

export const useNoteStore = defineStore("notes", () => {
  const notes = ref<Note[]>([]);
  const loading = ref(false);
  const initialized = ref(false);
  const query = ref("");

  const total = computed(() => notes.value.length);
  const pinnedCount = computed(() => notes.value.filter((note) => note.pinned).length);
  const visible = computed(() => matchNotes(sortNotes(notes.value), query.value));

  async function init(): Promise<void> {
    if (initialized.value || loading.value) return;
    loading.value = true;
    try {
      notes.value = await noteRepo.list();
    } catch (error) {
      console.error("[notes] 初始化失败", error);
    } finally {
      initialized.value = true;
      loading.value = false;
    }
  }

  async function add(input: NewNoteInput): Promise<void> {
    const title = input.title.trim();
    const content = input.content.trim();
    if (!title && !content) return;

    const now = Date.now();
    const note: Note = {
      id: uid(),
      title: title || titleFromContent(content),
      content,
      color: input.color,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };

    notes.value = [note, ...notes.value];
    await persist(() => noteRepo.create(note));
  }

  async function update(id: string, input: NewNoteInput): Promise<void> {
    const current = notes.value.find((note) => note.id === id);
    if (!current) return;

    const title = input.title.trim();
    const content = input.content.trim();
    if (!title && !content) return;

    const next: Note = {
      ...current,
      title: title || titleFromContent(content),
      content,
      color: input.color,
      updatedAt: Date.now(),
    };

    notes.value = notes.value.map((note) => (note.id === id ? next : note));
    await persist(() => noteRepo.update(next));
  }

  async function togglePin(id: string): Promise<void> {
    const current = notes.value.find((note) => note.id === id);
    if (!current) return;

    const next: Note = { ...current, pinned: !current.pinned, updatedAt: Date.now() };
    notes.value = notes.value.map((note) => (note.id === id ? next : note));
    await persist(() => noteRepo.update(next));
  }

  async function remove(id: string): Promise<void> {
    notes.value = notes.value.filter((note) => note.id !== id);
    await persist(() => noteRepo.remove(id));
  }

  return {
    notes,
    loading,
    initialized,
    query,
    total,
    pinnedCount,
    visible,
    init,
    add,
    update,
    togglePin,
    remove,
  };
});
