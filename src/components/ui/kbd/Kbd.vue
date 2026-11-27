<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <kbd
    :class="
      cn(
        'pointer-events-none inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-border bg-card px-1 font-sans text-[10px] font-medium text-muted-foreground select-none',
        props.class,
      )
    "
  >
    <slot />
  </kbd>
</template>
