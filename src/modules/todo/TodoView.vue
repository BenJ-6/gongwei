<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { ListTodo, Search } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import TodoComposer from "./components/TodoComposer.vue";
import TodoItem from "./components/TodoItem.vue";
import TodoStats from "./components/TodoStats.vue";
import { formatToday } from "./domain";
import { useTodoStore } from "./store";
import type { Todo, TodoFilter } from "./types";

const store = useTodoStore();

const filters: Array<{ value: TodoFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "active", label: "进行中" },
  { value: "done", label: "已完成" },
];

const groups = computed<Array<{ title: string; items: Todo[] }>>(() => {
  const list = store.visible;
  if (store.filter !== "all") return [{ title: "", items: list }];

  const active = list.filter((item) => !item.done);
  const done = list.filter((item) => item.done);
  const result: Array<{ title: string; items: Todo[] }> = [];
  if (active.length) result.push({ title: "进行中", items: active });
  if (done.length) result.push({ title: "已完成", items: done });
  return result;
});

const hasVisible = computed(() => store.visible.length > 0);
const isInitialLoading = computed(() => store.loading && !store.initialized);

function focusSearch(): void {
  (document.getElementById("todo-search") as HTMLInputElement | null)?.focus();
}

function focusTitle(): void {
  (document.getElementById("todo-title") as HTMLInputElement | null)?.focus();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const target = event.target as HTMLElement | null;
  const tag = target?.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return;

  if (event.key === "/") {
    event.preventDefault();
    focusSearch();
  } else if (event.key === "n") {
    event.preventDefault();
    focusTitle();
  }
}

onMounted(() => {
  void store.init();
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <header class="flex items-start gap-4 px-8 pt-7 pb-4">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">待办清单</h1>
        <p class="mt-1 text-xs text-muted-foreground">{{ formatToday() }}</p>
      </div>
      <div class="relative ml-auto">
        <Search
          class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="todo-search"
          v-model="store.query"
          placeholder="搜索待办…"
          autocomplete="off"
          class="h-9 w-56 pl-8"
        />
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto px-8 pb-7">
      <TodoStats />
      <TodoComposer class="mt-4" />

      <div class="mb-2 flex items-center gap-1">
        <button
          v-for="item in filters"
          :key="item.value"
          type="button"
          :class="
            cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
              store.filter === item.value
                ? 'bg-accent font-semibold text-accent-foreground'
                : 'text-muted-foreground hover:bg-secondary',
            )
          "
          @click="store.setFilter(item.value)"
        >
          {{ item.label }}
          <span
            :class="
              cn(
                'min-w-4 rounded-full bg-card px-1.5 text-center text-[11px] leading-4 tabular-nums',
                store.filter === item.value
                  ? 'text-accent-foreground'
                  : 'text-muted-foreground',
              )
            "
          >
            {{ store.counts[item.value] }}
          </span>
        </button>

        <button
          type="button"
          class="ml-auto rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
          :disabled="!store.doneCount"
          @click="store.clearCompleted()"
        >
          清除已完成
        </button>
      </div>

      <section class="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div
          v-if="isInitialLoading"
          class="py-16 text-center text-sm text-muted-foreground"
        >
          正在加载…
        </div>

        <div v-else-if="!hasVisible" class="px-5 py-14 text-center">
          <div
            class="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-secondary text-muted-foreground/60"
          >
            <ListTodo class="size-6" />
          </div>
          <div class="text-sm text-secondary-foreground/80">
            {{ store.total ? "没有匹配的待办" : "这里还没有待办" }}
          </div>
          <div class="mt-1 text-xs text-muted-foreground">
            {{
              store.total
                ? "换一个关键词或筛选条件试试"
                : "在上方输入框写下第一件事，按回车创建"
            }}
          </div>
        </div>

        <template v-else>
          <template v-for="group in groups" :key="group.title || 'list'">
            <div
              v-if="group.title"
              class="px-4 pt-3 pb-1.5 text-[11.5px] font-semibold tracking-wide text-muted-foreground"
            >
              {{ group.title }}
            </div>
            <TodoItem
              v-for="todo in group.items"
              :key="todo.id"
              :todo="todo"
              @toggle="store.toggle(todo.id)"
              @remove="store.remove(todo.id)"
              @rename="store.rename(todo.id, $event)"
            />
          </template>
        </template>
      </section>

      <div class="flex items-center gap-2 px-1 pt-3 text-xs text-muted-foreground">
        <span>共 {{ store.total }} 项</span>
        <span class="ml-auto">双击标题可重命名</span>
        <span class="rounded border px-1 py-px text-[11px] text-foreground/70">Enter</span>
        <span>添加</span>
      </div>
    </div>
  </div>
</template>
