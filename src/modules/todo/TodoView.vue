<script setup lang="ts">
import { computed, onActivated, onDeactivated, ref } from "vue";
import { CalendarDays, ChevronRight, History, ListTodo, Plus, Search, Trash2 } from "lucide-vue-next";
import { getLocalTimeZone, parseDate, today, type DateValue } from "@internationalized/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { TooltipProvider } from "@/components/ui/tooltip";
import TodoComposer from "./components/TodoComposer.vue";
import TodoEmpty from "./components/TodoEmpty.vue";
import TodoHistoryItem from "./components/TodoHistoryItem.vue";
import TodoItem from "./components/TodoItem.vue";
import { formatDateLabel, formatToday, shortDate, shiftDate, todayStr } from "./domain";
import { useTodoStore } from "./store";

const store = useTodoStore();
const searchInput = ref<InstanceType<typeof Input> | null>(null);
const composer = ref<InstanceType<typeof TodoComposer> | null>(null);

const quickDates = computed(() => store.historyDates.slice(0, 7));
const maxDate = today(getLocalTimeZone());
const historyDateValue = computed(() => parseDate(store.historyDate));

function selectHistoryDate(value: DateValue | undefined): void {
  if (value) store.setHistoryDate(value.toString());
}

const emptyState = computed(() => {
  if (!store.total) return { title: "这里还没有待办", hint: "写下第一件要做的事，按回车添加" };
  if (store.query.trim()) return { title: "没有匹配的待办", hint: "试试其他关键词" };
  return { title: "待办都完成了", hint: "完成的任务已移入下方「完成记录」" };
});

const historyEmpty = computed(() =>
  store.historyDayCount
    ? { title: "没有匹配的完成记录", hint: "试试其他关键词" }
    : { title: "这一天没有完成记录", hint: "换个日期看看" },
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

function focusSearch(): void {
  (searchInput.value?.$el as HTMLInputElement | undefined)?.focus();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target instanceof HTMLElement && (event.target.isContentEditable ||
    event.target.closest("input, textarea, select"))) return;

  if (event.key === "/") {
    event.preventDefault();
    focusSearch();
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
  <TooltipProvider :delay-duration="300">
    <div class="flex h-full min-h-0 flex-col text-sm">
      <div class="h-16 shrink-0 border-b bg-sidebar max-sm:h-14">
        <div class="mx-auto flex h-full w-full max-w-[1160px] items-center justify-between gap-3 px-9 max-sm:px-3.5">
          <div class="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
            <span>工位</span>
            <ChevronRight class="size-3.5" aria-hidden="true" />
            <strong class="font-semibold text-foreground">待办清单</strong>
          </div>

          <div class="relative w-60 max-sm:w-[51%] max-sm:max-w-[210px]">
            <Search
              class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="todo-search"
              ref="searchInput"
              v-model="store.query"
              type="search"
              aria-label="搜索待办"
              placeholder="搜索待办…"
              autocomplete="off"
              class="h-8.5 bg-card pr-9 pl-8 text-xs"
            />
            <Kbd class="absolute top-1/2 right-1.5 -translate-y-1/2 max-sm:hidden">/</Kbd>
          </div>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
        <div class="mx-auto w-full max-w-[1160px] px-9 pt-7 pb-6 max-sm:px-3.5 max-sm:pt-5">
          <TodoComposer ref="composer" />

          <Card class="gap-0 overflow-hidden rounded-[20px] py-0 shadow-[0_5px_20px_#321b5507]">
            <CardHeader class="px-5 pt-4 pb-3">
              <CardTitle class="flex items-center gap-2 text-[19px] font-bold tracking-[-.025em]">
                进行中
                <Badge
                  class="h-5 min-w-5 rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground"
                >
                  {{ store.pendingCount }}
                </Badge>
              </CardTitle>
              <CardDescription class="mt-1 text-[11px]">只显示未完成的任务，勾选后会移入下方「完成记录」</CardDescription>
            </CardHeader>

            <div
              class="grid grid-cols-[minmax(0,1fr)_minmax(84px,.24fr)_minmax(96px,.29fr)_64px] items-center gap-3 border-y bg-[#faf8fd] px-5 py-2 text-[11px] text-muted-foreground max-sm:hidden"
              aria-hidden="true"
            >
              <span>任务名称</span><span>优先级</span><span>截止日期</span><span class="text-center">操作</span>
            </div>

            <CardContent class="p-0">
              <TodoEmpty v-if="!store.initialized" :icon="ListTodo" title="正在加载…" />
              <TodoEmpty
                v-else-if="!store.visible.length"
                :icon="ListTodo"
                :title="emptyState.title"
                :hint="emptyState.hint"
              />
              <div v-else class="divide-y divide-border/70" role="list" aria-label="未完成的任务">
                <TodoItem
                  v-for="todo in store.visible"
                  :key="todo.id"
                  :todo="todo"
                  @toggle="store.toggle(todo.id)"
                  @remove="store.remove(todo.id)"
                  @rename="store.rename(todo.id, $event)"
                />
              </div>
            </CardContent>

            <CardFooter class="justify-between gap-2 border-t px-5 py-2.5 text-[11px] text-muted-foreground">
              <span aria-live="polite">
                {{ store.query.trim() ? `匹配 ${store.visible.length} 项 · ` : "" }}共 {{ store.pendingCount }} 项待完成
              </span>
              <span class="max-sm:hidden">双击标题可重命名 <Kbd class="mx-1">Enter</Kbd> 添加</span>
            </CardFooter>
          </Card>

          <Card
            class="mt-4 grid gap-0 overflow-hidden rounded-[20px] py-0 shadow-[0_5px_20px_#321b5507] lg:grid-cols-[268px_minmax(0,1fr)]"
            aria-labelledby="history-heading"
          >
            <aside class="flex min-w-0 flex-col gap-3 border-b p-4 lg:border-r lg:border-b-0">
              <div>
                <h2 id="history-heading" class="text-[19px] font-bold tracking-[-.025em]">完成记录</h2>
                <p class="mt-1 text-[11px] text-muted-foreground">点击日历中的日期，查看当天完成的任务</p>
              </div>

              <Calendar
                :model-value="historyDateValue"
                :max-value="maxDate"
                locale="zh-CN"
                class="w-fit max-w-full self-center p-0"
                @update:model-value="selectHistoryDate"
              />

              <div v-if="quickDates.length" class="flex flex-wrap gap-1.5" role="group" aria-label="有完成记录的日期">
                <Button
                  v-for="item in quickDates"
                  :key="item.date"
                  size="sm"
                  :variant="store.historyDate === item.date ? 'secondary' : 'outline'"
                  class="h-7 gap-1.5 rounded-full px-2.5 text-[11px] font-semibold shadow-none"
                  :class="
                    store.historyDate === item.date
                      ? 'border-[#c3aef5] bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  "
                  :aria-pressed="store.historyDate === item.date"
                  :title="formatDateLabel(item.date)"
                  @click="store.setHistoryDate(item.date)"
                >
                  {{ chipLabel(item.date) }}
                  <span class="text-[10px] opacity-70">{{ item.count }}</span>
                </Button>
              </div>
              <span v-else class="text-[11px] text-muted-foreground">还没有任何完成记录</span>
            </aside>

            <section class="flex min-w-0 flex-col" :aria-label="formatDateLabel(store.historyDate) + '完成的任务'">
              <header
                class="flex flex-wrap items-center justify-between gap-2 border-b bg-[#faf8fd] px-5 py-2.5"
              >
                <div class="flex flex-wrap items-baseline gap-2">
                  <strong class="text-xs font-semibold text-foreground">{{ formatDateLabel(store.historyDate) }}</strong>
                  <span class="text-[11px] text-muted-foreground">完成 {{ store.historyDayCount }} 项</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:bg-[#fff1ee] hover:text-[#9e392d]"
                  :disabled="!store.doneCount"
                  @click="store.clearCompleted()"
                >
                  <Trash2 class="size-3.5" aria-hidden="true" />清空完成记录
                </Button>
              </header>

              <div class="flex min-h-[240px] flex-1 flex-col">
                <TodoEmpty
                  v-if="!store.historyItems.length"
                  :icon="History"
                  :title="historyEmpty.title"
                  :hint="historyEmpty.hint"
                />
                <div v-else class="divide-y divide-border/70" role="list">
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
          </Card>
        </div>
      </div>
    </div>
  </TooltipProvider>
</template>
