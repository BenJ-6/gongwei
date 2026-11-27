<script setup lang="ts">
import { computed } from "vue";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-vue-next";
import { PRIORITY_LABEL, timeOf } from "../domain";
import type { Todo } from "../types";

const props = defineProps<{ todo: Todo }>();
const emit = defineEmits<{
  restore: [];
  remove: [];
}>();

const priorityLabel = computed(() =>
  props.todo.priority === "normal"
    ? PRIORITY_LABEL.normal
    : PRIORITY_LABEL[props.todo.priority] + "优先级",
);
const finishedAt = computed(() => (props.todo.completedAt ? timeOf(props.todo.completedAt) : ""));
</script>

<template>
  <div class="history-row" role="listitem">
    <span class="history-check"><CheckCircle2 aria-hidden="true" /></span>
    <div class="history-name">
      <span class="history-title" :title="todo.title">{{ todo.title }}</span>
      <span class="pill" :class="todo.priority">{{ priorityLabel }}</span>
    </div>
    <time v-if="finishedAt" class="history-time" :datetime="new Date(todo.completedAt ?? 0).toISOString()">
      {{ finishedAt }} 完成
    </time>
    <span v-else class="history-time">—</span>
    <div class="actions">
      <button
        class="icon-button"
        type="button"
        title="恢复为待办"
        :aria-label="'恢复为待办：' + todo.title"
        @click="emit('restore')"
      >
        <RotateCcw aria-hidden="true" />
      </button>
      <button
        class="icon-button delete"
        type="button"
        title="删除记录"
        :aria-label="'删除记录：' + todo.title"
        @click="emit('remove')"
      >
        <Trash2 aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
