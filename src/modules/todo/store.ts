import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { uid } from "@/lib/id";
import { dateOf, matchQuery, sortTodos, todayStr } from "./domain";
import { todoRepo } from "./repo";
import type { NewTodoInput, Todo } from "./types";

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
  const query = ref("");
  const historyDate = ref(todayStr());

  const total = computed(() => todos.value.length);
  const doneCount = computed(() => todos.value.filter((todo) => todo.done).length);
  const pendingCount = computed(() => total.value - doneCount.value);
  const visible = computed(() =>
    matchQuery(sortTodos(todos.value.filter((todo) => !todo.done)), query.value),
  );

  /** 有完成记录的日期，按时间倒序，附带当天完成数量 */
  const historyDates = computed(() => {
    const map = new Map<string, number>();
    for (const todo of todos.value) {
      if (!todo.done || !todo.completedAt) continue;
      const date = dateOf(todo.completedAt);
      map.set(date, (map.get(date) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, count]) => ({ date, count }));
  });

  const historyDayTodos = computed(() =>
    todos.value
      .filter((todo) => todo.done && todo.completedAt && dateOf(todo.completedAt) === historyDate.value)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
  );
  const historyDayCount = computed(() => historyDayTodos.value.length);
  const historyItems = computed(() => matchQuery(historyDayTodos.value, query.value));

  async function init(): Promise<void> {
    if (initialized.value || loading.value) return;
    loading.value = true;
    try {
      todos.value = await todoRepo.list();
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

  function setHistoryDate(date: string): void {
    historyDate.value = date || todayStr();
  }

  return {
    todos,
    loading,
    initialized,
    query,
    historyDate,
    total,
    doneCount,
    pendingCount,
    visible,
    historyDates,
    historyDayCount,
    historyItems,
    init,
    add,
    toggle,
    rename,
    remove,
    clearCompleted,
    setHistoryDate,
  };
});
