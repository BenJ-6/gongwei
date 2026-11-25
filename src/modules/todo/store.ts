import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { uid } from "@/lib/id";
import { addDays, filterTodos, isUrgent, sortTodos, todayStr } from "./domain";
import { todoRepo } from "./repo";
import type { NewTodoInput, Todo, TodoFilter } from "./types";

const SEED_FLAG = "gongwei:seeded:v1";

function seedTodos(): Todo[] {
  const now = Date.now();
  const items: Array<Omit<Todo, "id" | "createdAt" | "updatedAt" | "completedAt" | "sortOrder">> = [
    { title: "梳理工位第一版的功能范围", done: false, priority: "high", due: todayStr() },
    { title: "整理待办清单的交互细节（增删改查 / 筛选）", done: false, priority: "normal", due: addDays(2) },
    { title: "确认本地存储方案（SQLite）", done: false, priority: "normal", due: null },
    { title: "画一版主界面配色与布局", done: true, priority: "low", due: null },
  ];

  return items.map((item, index) => ({
    ...item,
    id: uid(),
    createdAt: now - index * 1000,
    updatedAt: now - index * 1000,
    completedAt: item.done ? now - index * 1000 : null,
    sortOrder: now - index,
  }));
}

async function persist(task: () => Promise<void>): Promise<void> {
  try {
    await task();
  } catch (error) {
    console.error("[todo] 数据持久化失败", error);
  }
}

export const useTodoStore = defineStore("todo", () => {
  const todos = ref<Todo[]>([]);
  const loading = ref(false);
  const initialized = ref(false);
  const filter = ref<TodoFilter>("all");
  const query = ref("");

  const total = computed(() => todos.value.length);
  const doneCount = computed(() => todos.value.filter((todo) => todo.done).length);
  const pendingCount = computed(() => total.value - doneCount.value);
  const percent = computed(() =>
    total.value ? Math.round((doneCount.value / total.value) * 100) : 0,
  );
  const urgentCount = computed(() => todos.value.filter(isUrgent).length);
  const counts = computed(() => ({
    all: total.value,
    active: pendingCount.value,
    done: doneCount.value,
  }));
  const visible = computed(() => sortTodos(filterTodos(todos.value, filter.value, query.value)));

  async function init(): Promise<void> {
    if (initialized.value || loading.value) return;
    loading.value = true;
    try {
      todos.value = await todoRepo.list();
      if (!todos.value.length && !localStorage.getItem(SEED_FLAG)) {
        localStorage.setItem(SEED_FLAG, "1");
        for (const todo of seedTodos()) {
          await todoRepo.create(todo);
        }
        todos.value = await todoRepo.list();
      }
    } catch (error) {
      console.error("[todo] 初始化失败", error);
    } finally {
      initialized.value = true;
      loading.value = false;
    }
  }

  async function add(input: NewTodoInput): Promise<void> {
    const title = input.title.trim();
    if (!title) return;

    const now = Date.now();
    const todo: Todo = {
      id: uid(),
      title,
      done: false,
      priority: input.priority,
      due: input.due || null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      sortOrder: now,
    };

    todos.value = [todo, ...todos.value];
    await persist(() => todoRepo.create(todo));
  }

  async function toggle(id: string): Promise<void> {
    const current = todos.value.find((todo) => todo.id === id);
    if (!current) return;

    const now = Date.now();
    const next: Todo = {
      ...current,
      done: !current.done,
      completedAt: current.done ? null : now,
      updatedAt: now,
    };

    todos.value = todos.value.map((todo) => (todo.id === id ? next : todo));
    await persist(() => todoRepo.update(next));
  }

  async function rename(id: string, title: string): Promise<void> {
    const value = title.trim();
    const current = todos.value.find((todo) => todo.id === id);
    if (!current || !value || value === current.title) return;

    const next: Todo = { ...current, title: value, updatedAt: Date.now() };
    todos.value = todos.value.map((todo) => (todo.id === id ? next : todo));
    await persist(() => todoRepo.update(next));
  }

  async function remove(id: string): Promise<void> {
    todos.value = todos.value.filter((todo) => todo.id !== id);
    await persist(() => todoRepo.remove(id));
  }

  async function clearCompleted(): Promise<void> {
    if (!doneCount.value) return;
    todos.value = todos.value.filter((todo) => !todo.done);
    await persist(() => todoRepo.clearCompleted());
  }

  function setFilter(next: TodoFilter): void {
    filter.value = next;
  }

  return {
    todos,
    loading,
    initialized,
    filter,
    query,
    total,
    doneCount,
    pendingCount,
    percent,
    urgentCount,
    counts,
    visible,
    init,
    add,
    toggle,
    rename,
    remove,
    clearCompleted,
    setFilter,
  };
});
