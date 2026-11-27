<script setup lang="ts">
import { computed } from "vue";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PRIORITY_LABEL, timeOf } from "../domain";
import type { Priority, Todo } from "../types";

const props = defineProps<{ todo: Todo }>();
const emit = defineEmits<{
  restore: [];
  remove: [];
}>();

const PRIORITY_CLASS: Record<Priority, string> = {
  high: "bg-priority-high text-priority-high-foreground",
  normal: "bg-priority-normal text-priority-normal-foreground",
  low: "bg-priority-low text-priority-low-foreground",
};

const priorityLabel = computed(() =>
  props.todo.priority === "normal"
    ? PRIORITY_LABEL.normal
    : PRIORITY_LABEL[props.todo.priority] + "优先级",
);
const finishedAt = computed(() => (props.todo.completedAt ? timeOf(props.todo.completedAt) : ""));
</script>

<template>
  <div
    class="grid grid-cols-[18px_minmax(0,1fr)_auto_64px] items-center gap-3 px-5 py-1.5 transition-colors hover:bg-accent/30 max-sm:grid-cols-[16px_minmax(0,1fr)_auto] max-sm:gap-x-2 max-sm:px-3"
    role="listitem"
  >
    <span class="grid place-items-center text-success max-sm:row-span-2">
      <CheckCircle2 class="size-4" aria-hidden="true" />
    </span>

    <div class="flex min-w-0 items-center gap-2 max-sm:col-start-2">
      <span
        class="min-w-0 text-[13px] leading-relaxed font-semibold break-words text-muted-foreground line-through decoration-line-through"
        :title="todo.title"
      >
        {{ todo.title }}
      </span>
      <Badge variant="secondary" :class="PRIORITY_CLASS[todo.priority]">{{ priorityLabel }}</Badge>
    </div>

    <time
      v-if="finishedAt"
      class="text-[11px] whitespace-nowrap tabular-nums text-muted-foreground max-sm:col-start-2 max-sm:row-start-2 max-sm:text-[10px]"
      :datetime="new Date(todo.completedAt ?? 0).toISOString()"
    >
      {{ finishedAt }} 完成
    </time>
    <span v-else class="text-[11px] text-muted-foreground max-sm:col-start-2 max-sm:row-start-2">—</span>

    <div class="flex justify-end gap-0.5 max-sm:col-start-3 max-sm:row-span-2 max-sm:row-start-1">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="size-7 text-muted-foreground"
            :aria-label="'恢复为待办：' + todo.title"
            @click="emit('restore')"
          >
            <RotateCcw class="size-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>恢复为待办</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="size-7 text-muted-foreground hover:bg-danger-hover hover:text-danger-hover-foreground"
            :aria-label="'删除记录：' + todo.title"
            @click="emit('remove')"
          >
            <Trash2 class="size-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>删除记录</TooltipContent>
      </Tooltip>
    </div>
  </div>
</template>
