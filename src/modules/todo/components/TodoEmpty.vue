<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
  hint?: string;
}>();
</script>

<template>
  <div class="grid justify-items-center gap-1.5 px-3 py-9 text-center text-xs text-muted-foreground">
    <component :is="icon" class="size-6 text-primary" aria-hidden="true" />
    <strong class="text-sm font-semibold text-foreground">{{ title }}</strong>
    <span v-if="hint">{{ hint }}</span>
  </div>
</template>
