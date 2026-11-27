<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { CalendarDays, Pencil, Trash2 } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { dueInfo, PRIORITY_LABEL, type DueTone } from "../domain";
import type { Priority, Todo } from "../types";

const props = defineProps<{ todo: Todo }>();
const emit = defineEmits<{
  toggle: [];
  remove: [];
  rename: [title: string];
}>();

const PRIORITY_CLASS: Record<Priority, string> = {
  high: "bg-priority-high text-priority-high-foreground",
  normal: "bg-priority-normal text-priority-normal-foreground",
  low: "bg-priority-low text-priority-low-foreground",
};

const DUE_CLASS: Record<DueTone, string> = {
  over: "text-due-over",
  today: "text-due-today",
  soon: "text-muted-foreground",
  normal: "text-muted-foreground",
};

const editing = ref(false);
const draft = ref("");
const editInput = ref<InstanceType<typeof Input> | null>(null);
const editButton = ref<InstanceType<typeof Button> | null>(null);
const due = computed(() => dueInfo(props.todo.due));
const priorityLabel = computed(() =>
  props.todo.priority === "normal"
    ? PRIORITY_LABEL.normal
    : PRIORITY_LABEL[props.todo.priority] + "优先级",
);

async function startEdit(): Promise<void> {
  if (editing.value) return;
  draft.value = props.todo.title;
  editing.value = true;
  await nextTick();
  (editInput.value?.$el as HTMLInputElement | undefined)?.focus();
  (editInput.value?.$el as HTMLInputElement | undefined)?.select();
}

function finishEdit(save: boolean): void {
  if (!editing.value) return;
  editing.value = false;
  if (save) emit("rename", draft.value);
}

async function onEditKeydown(event: KeyboardEvent): Promise<void> {
  if (event.isComposing || (event.key !== "Enter" && event.key !== "Escape")) return;
  event.preventDefault();
  finishEdit(event.key === "Enter");
  await nextTick();
  (editButton.value?.$el as HTMLElement | undefined)?.focus();
}
</script>

<template>
  <div
    class="grid grid-cols-[minmax(0,1fr)_minmax(84px,.24fr)_minmax(96px,.29fr)_64px] items-center gap-3 px-5 py-1.5 transition-colors hover:bg-accent/30 max-sm:grid-cols-[auto_minmax(0,1fr)_auto] max-sm:gap-x-2 max-sm:px-3"
    :class="{ 'opacity-55': todo.done }"
    role="listitem"
  >
    <div class="flex min-w-0 items-center gap-2.5 max-sm:col-span-2">
      <Checkbox
        :model-value="todo.done"
        :aria-label="(todo.done ? '恢复待办：' : '完成待办：') + todo.title"
        @update:model-value="emit('toggle')"
      />

      <Input
        v-if="editing"
        ref="editInput"
        v-model="draft"
        class="h-7 px-2 text-[13px]"
        aria-label="重命名待办"
        @blur="finishEdit(true)"
        @keydown="onEditKeydown"
      />
      <span
        v-else
        class="min-w-0 cursor-text text-[13px] leading-relaxed font-semibold break-words"
        :class="{ 'text-muted-foreground line-through decoration-line-through': todo.done }"
        title="双击重命名"
        @dblclick="startEdit"
      >
        {{ todo.title }}
      </span>
    </div>

    <Badge
      variant="secondary"
      :class="
        ['max-sm:col-start-1 max-sm:row-start-2 max-sm:ml-7', PRIORITY_CLASS[todo.priority]]
      "
    >
      {{ priorityLabel }}
    </Badge>

    <span
      v-if="due"
      class="inline-flex items-center gap-1.5 text-[11px] whitespace-nowrap max-sm:col-start-2 max-sm:row-start-2"
      :class="DUE_CLASS[due.tone]"
      :title="todo.due ?? undefined"
    >
      <CalendarDays class="size-3.5 shrink-0" aria-hidden="true" />{{ due.text }}
    </span>
    <span v-else class="text-[11px] text-muted-foreground max-sm:col-start-2 max-sm:row-start-2" title="无截止日期">
      —
    </span>

    <div class="flex justify-end gap-0.5 max-sm:col-start-3 max-sm:row-span-2 max-sm:row-start-1">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            ref="editButton"
            variant="ghost"
            size="icon"
            class="size-7 text-muted-foreground"
            :aria-label="'重命名：' + todo.title"
            @click="startEdit"
          >
            <Pencil class="size-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>重命名</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="size-7 text-muted-foreground hover:bg-danger-hover hover:text-danger-hover-foreground"
            :aria-label="'删除：' + todo.title"
            @click="emit('remove')"
          >
            <Trash2 class="size-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>删除</TooltipContent>
      </Tooltip>
    </div>
  </div>
</template>
