<script setup lang="ts">
import { computed, ref } from "vue";
import type { HTMLAttributes } from "vue";
import { CalendarDays, X } from "lucide-vue-next";
import { getLocalTimeZone, parseDate, today, type DateValue } from "@internationalized/date";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { shortDate } from "../domain";

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    placeholder?: string;
    max?: string | null;
    min?: string | null;
    clearable?: boolean;
    align?: "start" | "center" | "end";
    class?: HTMLAttributes["class"];
  }>(),
  { placeholder: "选择日期", max: null, min: null, clearable: false, align: "start" },
);

const emit = defineEmits<{ "update:modelValue": [value: string | null] }>();

const open = ref(false);

function parse(value: string | null): DateValue | undefined {
  if (!value) return undefined;
  try {
    return parseDate(value);
  } catch {
    return undefined;
  }
}

const selected = computed(() => parse(props.modelValue));
const maxValue = computed(() => parse(props.max));
const minValue = computed(() => parse(props.min));
const label = computed(() => (props.modelValue ? shortDate(props.modelValue) : props.placeholder));
const initialMonth = computed(() => selected.value ?? today(getLocalTimeZone()));

function onSelect(value: DateValue | undefined): void {
  emit("update:modelValue", value ? value.toString() : null);
  open.value = false;
}
</script>

<template>
  <div :class="cn('flex min-w-0 items-center gap-1', props.class)">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="outline"
          size="sm"
          :class="
            cn(
              'h-9 min-w-0 flex-1 justify-start gap-1.5 border-border bg-secondary px-2.5 text-xs font-normal shadow-none hover:bg-accent/60',
              !modelValue && 'text-muted-foreground',
            )
          "
        >
          <CalendarDays class="size-3.5 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ label }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" :align="align">
        <Calendar
          :default-placeholder="initialMonth"
          :model-value="selected"
          :max-value="maxValue"
          :min-value="minValue"
          locale="zh-CN"
          @update:model-value="onSelect"
        />
      </PopoverContent>
    </Popover>

    <Button
      v-if="clearable && modelValue"
      type="button"
      variant="ghost"
      size="icon"
      class="size-7 shrink-0 text-muted-foreground hover:bg-[#fff1ee] hover:text-[#9e392d]"
      aria-label="清除日期"
      title="清除日期"
      @click="emit('update:modelValue', null)"
    >
      <X class="size-3.5" aria-hidden="true" />
    </Button>
  </div>
</template>
