<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { CalendarDays, Pencil, Trash2 } from "lucide-vue-next";
import { dueInfo, PRIORITY_LABEL } from "../domain";
import type { Todo } from "../types";

const props = defineProps<{ todo: Todo }>();
const emit = defineEmits<{
  toggle: [];
  remove: [];
  rename: [title: string];
}>();

const editing = ref(false);
const draft = ref("");
const editInput = ref<HTMLInputElement | null>(null);
const editButton = ref<HTMLButtonElement | null>(null);
const due = computed(() => dueInfo(props.todo.due));
const priorityLabel = computed(() =>
  props.todo.priority === "normal"
    ? PRIORITY_LABEL.normal
    : PRIORITY_LABEL[props.todo.priority] + "优先级",
);

async function startEdit(): Promise<void> {
  if (editing.value) return;
  draft.value = props.todo.title;
  editing.value = true;
  await nextTick();
  editInput.value?.focus();
  editInput.value?.select();
}

function finishEdit(save: boolean): void {
  if (!editing.value) return;
  editing.value = false;
  if (save) emit("rename", draft.value);
}

async function onEditKeydown(event: KeyboardEvent): Promise<void> {
  if (event.isComposing || (event.key !== "Enter" && event.key !== "Escape")) return;
  event.preventDefault();
  finishEdit(event.key === "Enter");
  await nextTick();
  editButton.value?.focus();
}
</script>

<template>
  <div class="task-row" :class="{ done: todo.done }" role="listitem">
    <div class="task-name">
      <input
        class="toggle"
        type="checkbox"
        :checked="todo.done"
        :aria-label="(todo.done ? '恢复待办：' : '完成待办：') + todo.title"
        @change="emit('toggle')"
      />
      <input
        v-if="editing"
        ref="editInput"
        v-model="draft"
        class="rename-input"
        aria-label="重命名待办"
        @blur="finishEdit(true)"
        @keydown="onEditKeydown"
      />
      <span v-else class="task-title" title="双击重命名" @dblclick="startEdit">{{ todo.title }}</span>
    </div>

    <span class="pill" :class="todo.priority">{{ priorityLabel }}</span>

    <span v-if="due" class="due-label" :class="{ [due.tone]: !todo.done }" :title="todo.due ?? undefined">
      <CalendarDays aria-hidden="true" />{{ due.text }}
    </span>
    <span v-else class="due-label" title="无截止日期">—</span>

    <div class="actions">
      <button ref="editButton" class="icon-button" type="button" title="重命名" :aria-label="'重命名：' + todo.title" @click="startEdit">
        <Pencil aria-hidden="true" />
      </button>
      <button class="icon-button delete" type="button" title="删除" :aria-label="'删除：' + todo.title" @click="emit('remove')">
        <Trash2 aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
