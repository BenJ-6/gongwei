<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { CheckboxIndicator, CheckboxRoot } from "reka-ui";
import { Check } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = defineProps<{
  modelValue?: boolean | "indeterminate";
  disabled?: boolean;
  id?: string;
  class?: HTMLAttributes["class"];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean | "indeterminate"];
}>();
</script>

<template>
  <CheckboxRoot
    :id="props.id"
    :model-value="props.modelValue"
    :disabled="props.disabled"
    :class="
      cn(
        'peer size-[18px] shrink-0 rounded-[6px] border-[1.5px] border-input bg-card outline-none transition-colors',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @update:model-value="emit('update:modelValue', $event)"
  >
    <CheckboxIndicator class="grid h-full w-full place-items-center">
      <Check class="size-3" :stroke-width="3.4" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
