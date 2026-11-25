<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { CalendarDays, Pencil, Trash2 } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { dueInfo, PRIORITY_LABEL, type DueTone } from "../domain";
import type { Priority, Todo } from "../types";

const props = defineProps<{ todo: Todo }>();

const emit = defineEmits<{
  toggle: [];
  remove: [];
  rename: [title: string];
}>();

const editing = ref(false);
const draft = ref("");
const editInput = ref<HTMLInputElement | null>(null);

const due = computed(() => dueInfo(props.todo.due));
const priorityLabel = computed(() =>
  props.todo.priority === "normal"
    ? "普通"
    : `${PRIORITY_LABEL[props.todo.priority]}优先级`,
);

const priorityClass: Record<Priority, string> = {
  high: "bg-red-50 text-red-600",
  normal: "bg-accent text-accent-foreground",
  low: "bg-secondary text-muted-foreground",
};

const toneClass: Record<DueTone, string> = {
  over: "bg-red-50 text-red-600",
  today: "bg-amber-50 text-amber-600",
  soon: "bg-accent text-accent-foreground",
  normal: "bg-secondary text-muted-foreground",
};

async function startEdit(): Promise<void> {
  if (editing.value) return;
  draft.value = props.todo.title;
  editing.value = true;
  await nextTick();
  editInput.value?.focus();
  editInput.value?.select();
}

function commit(): void {
  if (!editing.value) return;
  editing.value = false;
  emit("rename", draft.value);
}

function cancel(): void {
  editing.value = false;
}
</script>

<template>
  <div
    class="group flex items-start gap-3 border-t border-border/60 px-4 py-3 transition-colors first:border-t-0 hover:bg-muted/40"
  >
    <Checkbox
      class="mt-0.5"
      :model-value="todo.done"
      @update:model-value="emit('toggle')"
    />

    <div class="min-w-0 flex-1">
      <input
        v-if="editing"
        ref="editInput"
        v-model="draft"
        class="w-full rounded-md border border-ring bg-card px-1.5 py-0.5 text-sm outline-none ring-[3px] ring-ring/15"
        @blur="commit"
        @keydown.enter.prevent="commit"
        @keydown.esc="cancel"
      />
      <div
        v-else
        class="cursor-text text-sm leading-relaxed wrap-break-word"
        :class="todo.done && 'text-muted-foreground line-through decoration-border'"
        title="双击重命名"
        @dblclick="startEdit"
      >
        {{ todo.title }}
      </div>

      <div class="mt-1.5 flex flex-wrap items-center gap-2">
        <Badge :class="priorityClass[todo.priority]">{{ priorityLabel }}</Badge>
        <span
          v-if="due"
          class="inline-flex items-center gap-1 rounded-full px-1.5 text-[11px] leading-[18px]"
          :class="toneClass[due.tone]"
        >
          <CalendarDays class="size-3" />{{ due.text }}
        </span>
      </div>
    </div>

    <div
      class="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
    >
      <Button
        variant="ghost"
        size="icon"
        class="size-7 text-muted-foreground"
        title="重命名"
        @click="startEdit"
      >
        <Pencil class="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="size-7 text-muted-foreground hover:bg-red-50 hover:text-destructive"
        title="删除"
        @click="emit('remove')"
      >
        <Trash2 class="size-3.5" />
      </Button>
    </div>
  </div>
</template>
