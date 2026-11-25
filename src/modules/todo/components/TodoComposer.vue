<script setup lang="ts">
import { ref } from "vue";
import { CalendarDays, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTodoStore } from "../store";
import type { Priority } from "../types";

const store = useTodoStore();

const title = ref("");
const priority = ref<Priority>("normal");
const due = ref("");

const priorities: Array<{ value: Priority; label: string }> = [
  { value: "high", label: "高" },
  { value: "normal", label: "普通" },
  { value: "low", label: "低" },
];

function focusTitle(): void {
  document.getElementById("todo-title")?.focus();
}

async function submit(): Promise<void> {
  const value = title.value.trim();
  if (!value) {
    focusTitle();
    return;
  }

  await store.add({ title: value, priority: priority.value, due: due.value || null });
  title.value = "";
  due.value = "";
  priority.value = "normal";
  focusTitle();
}
</script>

<template>
  <form
    class="mb-3.5 flex items-center gap-1.5 rounded-xl border bg-card p-1.5 shadow-sm transition-[border-color,box-shadow] focus-within:border-ring/60 focus-within:ring-[3px] focus-within:ring-ring/15"
    @submit.prevent="submit"
  >
    <div class="grid size-[34px] shrink-0 place-items-center text-muted-foreground">
      <Plus class="size-4" />
    </div>

    <Input
      id="todo-title"
      v-model="title"
      placeholder="添加一条待办，回车即可创建…"
      autocomplete="off"
      class="h-[34px] border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
    />

    <div class="flex shrink-0 items-center gap-0.5 rounded-lg bg-secondary/70 p-0.5">
      <button
        v-for="item in priorities"
        :key="item.value"
        type="button"
        :class="
          cn(
            'rounded-md px-2.5 py-1 text-xs transition-colors',
            priority === item.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )
        "
        @click="priority = item.value"
      >
        {{ item.label }}
      </button>
    </div>

    <label
      class="flex shrink-0 items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1.5 text-xs text-muted-foreground focus-within:ring-2 focus-within:ring-ring/30"
    >
      <CalendarDays class="size-3.5" />
      <input
        v-model="due"
        type="date"
        class="w-[106px] bg-transparent text-xs text-foreground/80 outline-none"
      />
    </label>

    <Button type="submit" size="sm" class="h-[34px] px-4">添加</Button>
  </form>
</template>
