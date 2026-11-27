<script setup lang="ts">
import { computed, onActivated, onDeactivated, ref } from "vue";
import { CalendarDays, ChevronRight, History, ListTodo, Plus, Search, Trash2 } from "lucide-vue-next";
import TodoComposer from "./components/TodoComposer.vue";
import TodoHistoryItem from "./components/TodoHistoryItem.vue";
import TodoItem from "./components/TodoItem.vue";
import TodoStats from "./components/TodoStats.vue";
import { formatDateLabel, formatToday, shortDate, shiftDate, todayStr } from "./domain";
import { useTodoStore } from "./store";

const store = useTodoStore();
const searchInput = ref<HTMLInputElement | null>(null);
const composer = ref<InstanceType<typeof TodoComposer> | null>(null);

const quickDates = computed(() => store.historyDates.slice(0, 7));

const emptyState = computed(() => {
  if (!store.total) return { title: "这里还没有待办", hint: "写下第一件要做的事，按回车添加" };
  if (store.query.trim()) return { title: "没有匹配的待办", hint: "试试其他关键词" };
  return { title: "待办都完成了", hint: "完成的任务已移入下方「完成记录」" };
});

const historyEmpty = computed(() =>
  store.historyDayCount
    ? { title: "没有匹配的完成记录", hint: "试试其他关键词" }
    : { title: "这一天没有完成记录", hint: "用上方日历切换到其他日期看看" },
);

function chipLabel(date: string): string {
  const today = todayStr();
  if (date === today) return "今天";
  if (date === shiftDate(today, -1)) return "昨天";
  return shortDate(date);
}

function focusTitle(): void {
  composer.value?.focusTitle();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target instanceof HTMLElement && (event.target.isContentEditable ||
    event.target.closest("input, textarea, select"))) return;

  if (event.key === "/") {
    event.preventDefault();
    searchInput.value?.focus();
  } else if (event.key.toLowerCase() === "n") {
    event.preventDefault();
    focusTitle();
  }
}

onActivated(() => {
  void store.init();
  document.addEventListener("keydown", onKeydown);
});
onDeactivated(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="todo-view">
    <div class="topbar">
      <div class="topbar-inner">
        <div class="breadcrumb">
          <span>工位</span><ChevronRight aria-hidden="true" /><strong>待办清单</strong>
        </div>
        <label class="search">
          <Search aria-hidden="true" />
          <input
            id="todo-search"
            ref="searchInput"
            v-model="store.query"
            type="search"
            aria-label="搜索待办"
            placeholder="搜索待办…"
            autocomplete="off"
          />
          <kbd aria-hidden="true">/</kbd>
        </label>
      </div>
    </div>

    <div class="todo-scroll">
      <div class="content">
        <header class="heading">
          <div>
            <p class="date-line">
              <CalendarDays aria-hidden="true" /><time :datetime="todayStr()">{{ formatToday() }}</time>
            </p>
            <h1>待办清单</h1>
          </div>
          <button class="primary" type="button" aria-keyshortcuts="N" @click="focusTitle">
            <Plus aria-hidden="true" />新建待办 <kbd aria-hidden="true">N</kbd>
          </button>
        </header>

        <TodoStats />
        <TodoComposer ref="composer" />

        <section class="list-panel" aria-labelledby="list-heading">
          <header class="list-header">
            <div class="panel-heading">
              <h2 id="list-heading">进行中<span class="panel-count">{{ store.pendingCount }}</span></h2>
              <p class="panel-hint">只显示未完成的任务，勾选后会移入下方「完成记录」</p>
            </div>
          </header>

          <div class="columns" aria-hidden="true">
            <span>任务名称</span><span>优先级</span><span>截止日期</span><span>操作</span>
          </div>

          <div class="task-list">
            <div v-if="!store.initialized" class="empty" role="status">正在加载…</div>
            <div v-else-if="!store.visible.length" class="empty">
              <ListTodo aria-hidden="true" />
              <strong>{{ emptyState.title }}</strong>
              <span>{{ emptyState.hint }}</span>
            </div>
            <div v-else role="list" aria-label="未完成的任务">
              <TodoItem
                v-for="todo in store.visible"
                :key="todo.id"
                :todo="todo"
                @toggle="store.toggle(todo.id)"
                @remove="store.remove(todo.id)"
                @rename="store.rename(todo.id, $event)"
              />
            </div>
          </div>

          <footer class="list-footer">
            <span aria-live="polite">
              {{ store.query.trim() ? `匹配 ${store.visible.length} 项 · ` : "" }}共 {{ store.pendingCount }} 项待完成
            </span>
            <span>双击标题可重命名 <kbd>Enter</kbd> 添加</span>
          </footer>
        </section>

        <section class="list-panel history-panel" aria-labelledby="history-heading">
          <header class="list-header">
            <div class="panel-heading">
              <h2 id="history-heading">完成记录</h2>
              <p class="panel-hint">选择日期，查看当天完成的任务</p>
            </div>
            <label class="date-picker">
              <CalendarDays aria-hidden="true" />
              <input
                v-model="store.historyDate"
                type="date"
                :max="todayStr()"
                aria-label="选择要查看的完成日期"
              />
            </label>
          </header>

          <div class="history-toolbar">
            <div v-if="quickDates.length" class="date-chips" role="group" aria-label="有完成记录的日期">
              <button
                v-for="item in quickDates"
                :key="item.date"
                class="chip"
                type="button"
                :aria-pressed="store.historyDate === item.date"
                :title="formatDateLabel(item.date)"
                @click="store.setHistoryDate(item.date)"
              >
                {{ chipLabel(item.date) }} <span>{{ item.count }}</span>
              </button>
            </div>
            <span v-else class="panel-hint">还没有任何完成记录</span>
            <button class="clear" type="button" :disabled="!store.doneCount" @click="store.clearCompleted()">
              <Trash2 aria-hidden="true" />清空完成记录
            </button>
          </div>

          <p class="history-summary">
            <strong>{{ formatDateLabel(store.historyDate) }}</strong>
            <span>完成 {{ store.historyDayCount }} 项</span>
          </p>

          <div class="history-list">
            <div v-if="!store.historyItems.length" class="empty">
              <History aria-hidden="true" />
              <strong>{{ historyEmpty.title }}</strong>
              <span>{{ historyEmpty.hint }}</span>
            </div>
            <div v-else role="list" :aria-label="formatDateLabel(store.historyDate) + '完成的任务'">
              <TodoHistoryItem
                v-for="todo in store.historyItems"
                :key="todo.id"
                :todo="todo"
                @restore="store.toggle(todo.id)"
                @remove="store.remove(todo.id)"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style src="./todo.css"></style>
