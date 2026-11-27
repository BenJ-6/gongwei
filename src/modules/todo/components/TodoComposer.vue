<script setup lang="ts">
import { ref } from "vue";
import { CalendarDays, CornerDownLeft, Flag, Plus } from "lucide-vue-next";
import { useTodoStore } from "../store";
import type { Priority } from "../types";

const store = useTodoStore();
const titleInput = ref<HTMLInputElement | null>(null);
const title = ref("");
const priority = ref<Priority>("normal");
const due = ref("");

function focusTitle(): void {
  titleInput.value?.focus();
}

async function submit(): Promise<void> {
  const value = title.value.trim();
  if (!value) {
    focusTitle();
    return;
  }

  const adding = store.add({ title: value, priority: priority.value, due: due.value || null });
  if (store.query.trim() && !value.toLowerCase().includes(store.query.trim().toLowerCase())) {
    store.query = "";
  }
  title.value = "";
  due.value = "";
  priority.value = "normal";
  focusTitle();
  await adding;
}

defineExpose({ focusTitle });
</script>

<template>
  <form class="composer" aria-label="添加待办" @submit.prevent="submit">
    <label class="task-entry">
      <span class="entry-icon"><Plus aria-hidden="true" /></span>
      <input
        id="todo-title"
        ref="titleInput"
        v-model="title"
        aria-label="待办标题"
        placeholder="写下一件要做的事…"
        autocomplete="off"
      />
    </label>

    <label class="field">
      <Flag aria-hidden="true" />
      <select v-model="priority" aria-label="优先级">
        <option value="high">高优先级</option>
        <option value="normal">普通</option>
        <option value="low">低优先级</option>
      </select>
    </label>

    <label class="field">
      <CalendarDays aria-hidden="true" />
      <input v-model="due" type="date" aria-label="截止日期" title="截止日期（可选）" />
    </label>

    <button class="primary" type="submit">添加 <CornerDownLeft aria-hidden="true" /></button>
  </form>
</template>
