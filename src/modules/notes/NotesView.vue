<script setup lang="ts">
import { computed, onActivated, onDeactivated, ref } from "vue";
import { ChevronRight, NotebookPen, Search } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { TooltipProvider } from "@/components/ui/tooltip";
import NoteCard from "./components/NoteCard.vue";
import NoteComposer from "./components/NoteComposer.vue";
import { useNoteStore } from "./store";

const store = useNoteStore();
const searchInput = ref<InstanceType<typeof Input> | null>(null);
const composer = ref<InstanceType<typeof NoteComposer> | null>(null);

const emptyState = computed(() => {
  if (!store.total) return { title: "这里还没有便签", hint: "写下第一条想法，按回车添加" };
  if (store.query.trim()) return { title: "没有匹配的便签", hint: "试试其他关键词" };
  return { title: "便签列表为空", hint: "添加一条新的便签吧" };
});

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
            <strong class="font-semibold text-foreground">笔记便签</strong>
          </div>

          <div class="relative w-60 max-sm:w-[51%] max-sm:max-w-[210px]">
            <Search
              class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="note-search"
              ref="searchInput"
              v-model="store.query"
              type="search"
              aria-label="搜索便签"
              placeholder="搜索便签…"
              autocomplete="off"
              class="h-8.5 bg-card pr-9 pl-8 text-xs"
            />
            <Kbd class="absolute top-1/2 right-1.5 -translate-y-1/2 max-sm:hidden">/</Kbd>
          </div>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
        <div class="mx-auto w-full max-w-[1160px] px-9 pt-7 pb-6 max-sm:px-3.5 max-sm:pt-5">
          <NoteComposer ref="composer" />

          <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="flex items-center gap-2 text-[19px] font-bold tracking-[-.025em]">
              全部便签
              <Badge
                class="h-5 min-w-5 rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground"
              >
                {{ store.total }}
              </Badge>
            </h2>
            <span class="text-[11px] text-muted-foreground">
              已置顶 {{ store.pinnedCount }} 条 · 点击图钉可置顶 / 取消
            </span>
          </div>

          <div
            v-if="!store.initialized"
            class="grid place-items-center rounded-[20px] border bg-card py-14 text-xs text-muted-foreground"
          >
            正在加载…
          </div>

          <div
            v-else-if="!store.visible.length"
            class="grid justify-items-center gap-1.5 rounded-[20px] border bg-card px-3 py-14 text-center text-xs text-muted-foreground"
          >
            <NotebookPen class="size-6 text-primary" aria-hidden="true" />
            <strong class="text-sm font-semibold text-foreground">{{ emptyState.title }}</strong>
            <span>{{ emptyState.hint }}</span>
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <NoteCard
              v-for="note in store.visible"
              :key="note.id"
              :note="note"
              @remove="store.remove(note.id)"
              @toggle-pin="store.togglePin(note.id)"
              @save="store.update(note.id, $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </TooltipProvider>
</template>
