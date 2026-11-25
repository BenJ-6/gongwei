<script setup lang="ts">
import { useTodoStore } from "../store";

const store = useTodoStore();
</script>

<template>
  <section class="grid grid-cols-[1.15fr_1fr_1fr] gap-3 max-[1040px]:grid-cols-1">
    <div class="flex items-center gap-4 rounded-xl border bg-card px-[18px] py-4 shadow-sm">
      <div
        class="grid size-[62px] shrink-0 place-items-center rounded-full"
        :style="{
          background: `conic-gradient(var(--primary) ${store.percent}%, var(--border) 0)`,
        }"
      >
        <span
          class="grid size-12 place-items-center rounded-full bg-card text-[13px] font-semibold tabular-nums"
        >
          {{ store.percent }}%
        </span>
      </div>
      <div>
        <div class="text-[13px] text-muted-foreground">整体完成度</div>
        <div class="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums">
          {{ store.doneCount
          }}<span class="ml-1 text-xs font-medium text-muted-foreground"
            >/ {{ store.total }} 项</span
          >
        </div>
      </div>
    </div>

    <div
      class="flex flex-col justify-center gap-1.5 rounded-xl border bg-card px-[18px] py-4 shadow-sm"
    >
      <div class="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <span class="size-1.5 rounded-full bg-amber-500" />待处理
      </div>
      <div class="text-[22px] font-semibold tracking-tight tabular-nums">
        {{ store.pendingCount
        }}<span class="ml-1 text-xs font-medium text-muted-foreground">项</span>
      </div>
    </div>

    <div
      class="flex flex-col justify-center gap-1.5 rounded-xl border bg-card px-[18px] py-4 shadow-sm"
    >
      <div class="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <span class="size-1.5 rounded-full bg-destructive" />今天到期 / 已逾期
      </div>
      <div class="text-[22px] font-semibold tracking-tight tabular-nums">
        {{ store.urgentCount
        }}<span class="ml-1 text-xs font-medium text-muted-foreground">项</span>
      </div>
    </div>
  </section>
</template>
