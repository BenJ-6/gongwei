<script setup lang="ts">
import { ref } from "vue";
import { CornerDownLeft, Flag, ListPlus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TodoDatePicker from "./TodoDatePicker.vue";
import { useTodoStore } from "../store";
import type { Priority } from "../types";

const store = useTodoStore();
const titleInput = ref<InstanceType<typeof Input> | null>(null);
const title = ref("");
const priority = ref<Priority>("normal");
const due = ref<string | null>(null);

const priorities: { value: Priority; label: string }[] = [
  { value: "high", label: "高优先级" },
  { value: "normal", label: "普通" },
  { value: "low", label: "低优先级" },
];

function focusTitle(): void {
  const element = titleInput.value?.$el as HTMLInputElement | undefined;
  element?.focus();
}

async function submit(): Promise<void> {
  const value = title.value.trim();
  if (!value) {
    focusTitle();
    return;
  }

  const adding = store.add({ title: value, priority: priority.value, due: due.value ?? null });
  if (store.query.trim() && !value.toLowerCase().includes(store.query.trim().toLowerCase())) {
    store.query = "";
  }
  title.value = "";
  due.value = null;
  priority.value = "normal";
  focusTitle();
  await adding;
}

defineExpose({ focusTitle });
</script>

<template>
  <Card class="mb-4 rounded-2xl py-0 shadow-sm">
    <CardContent class="p-2.5">
      <form
        class="grid grid-cols-2 items-center gap-2 md:grid-cols-[minmax(0,1fr)_130px_184px_auto]"
        aria-label="添加待办"
        @submit.prevent="submit"
      >
        <label class="col-span-2 flex min-w-0 items-center gap-2 px-1 md:col-span-1">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-[10px] bg-accent/70 text-accent-foreground/80"
          >
            <ListPlus class="size-4.5" aria-hidden="true" />
          </span>
          <Input
            id="todo-title"
            ref="titleInput"
            v-model="title"
            aria-label="待办标题"
            placeholder="写下一件要做的事…"
            autocomplete="off"
            class="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
          />
        </label>

        <Select v-model="priority">
          <SelectTrigger class="h-9 w-full gap-1.5 border-border bg-secondary px-2.5 text-xs font-normal shadow-none" aria-label="优先级">
            <Flag class="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="item in priorities" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <TodoDatePicker v-model="due" placeholder="截止日期" clearable class="w-full" />

        <Button type="submit" class="col-span-2 h-9 gap-1.5 px-3.5 text-[13px] md:col-span-1">
          添加<CornerDownLeft class="size-3.5" aria-hidden="true" />
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
