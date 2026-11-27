<script setup lang="ts">
import { computed } from "vue";
import { Bell, Clock, TrendingUp } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import { todayStr } from "../domain";
import { useTodoStore } from "../store";

const store = useTodoStore();
const breakdown = computed(() => {
  const today = todayStr();
  const counts = { high: 0, dueToday: 0 };
  for (const task of store.todos) {
    if (task.done) continue;
    if (task.priority === "high") counts.high++;
    if (task.due === today) counts.dueToday++;
  }
  return counts;
});
</script>

<template>
  <section class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,2.1fr)_repeat(2,minmax(0,1fr))]" aria-label="任务概览">
    <Card
      class="progress-card relative col-span-2 min-h-[150px] justify-center gap-0 overflow-hidden rounded-[20px] border-0 bg-gradient-to-br from-[#261747] via-[#412472] to-[#563499] py-0 text-white shadow-[0_12px_32px_-16px_#41247299] lg:col-span-1 lg:min-h-[168px]"
    >
      <CardContent class="relative z-10 flex h-full items-center justify-between gap-4 py-5">
        <div>
          <h2 class="flex items-center gap-2 text-[13px] font-semibold text-[#eee0ff]">
            <TrendingUp class="size-4" aria-hidden="true" />整体完成度
          </h2>
          <p class="mt-1 flex items-baseline gap-1.5 text-[45px] leading-none font-bold tracking-[-.055em] tabular-nums">
            <span>{{ store.doneCount }}</span>
            <small class="text-[13px] font-medium tracking-normal text-[#eadbfa]">/ {{ store.total }} 项</small>
          </p>
          <p class="mt-1.5 text-[11px] text-[#eadbfa]">已完成待办</p>
        </div>

        <div
          class="ring grid size-[108px] shrink-0 place-items-center rounded-full shadow-[0_0_0_9px_#cbb4ff23]"
          :style="{ '--progress': store.percent + '%' }"
          role="progressbar"
          aria-label="整体完成度"
          :aria-valuenow="store.percent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span class="z-10 text-[27px] font-bold tracking-[-.04em]">{{ store.percent }}%</span>
        </div>
      </CardContent>
    </Card>

    <Card class="min-h-[136px] justify-center gap-0 rounded-[20px] border-[#e9e0fa] bg-[#eee8fc] py-0 text-[#352058]">
      <CardContent class="flex flex-col items-start justify-center px-4 py-4 lg:px-6">
        <span class="mb-2 grid size-8.5 place-items-center rounded-[10px] bg-[#e1d3fc] text-[#6338bf]">
          <Clock class="size-4" aria-hidden="true" />
        </span>
        <h2 class="text-[13px] font-semibold">待处理</h2>
        <p class="mt-0.5 flex items-baseline gap-1.5 text-[36px] leading-tight font-bold tracking-tight tabular-nums">
          <span>{{ store.pendingCount }}</span><small class="text-xs font-medium">项</small>
        </p>
        <p class="mt-0.5 text-[11px] text-[#645479]">高优先级 {{ breakdown.high }} 项</p>
      </CardContent>
    </Card>

    <Card class="min-h-[136px] justify-center gap-0 rounded-[20px] border-[#f9e6df] bg-[#fff0eb] py-0 text-[#622b30]">
      <CardContent class="flex flex-col items-start justify-center px-4 py-4 lg:px-6">
        <span class="mb-2 grid size-8.5 place-items-center rounded-[10px] bg-[#ffe0d8] text-[#a6453c]">
          <Bell class="size-4" aria-hidden="true" />
        </span>
        <h2 class="text-[13px] font-semibold">需要关注</h2>
        <p class="mt-0.5 flex items-baseline gap-1.5 text-[36px] leading-tight font-bold tracking-tight tabular-nums">
          <span>{{ store.urgentCount }}</span><small class="text-xs font-medium">项</small>
        </p>
        <p class="mt-0.5 text-[11px] text-[#865252]">
          今天到期 {{ breakdown.dueToday }} · 已逾期 {{ store.urgentCount - breakdown.dueToday }}
        </p>
      </CardContent>
    </Card>
  </section>
</template>

<style scoped>
.ring {
  position: relative;
  background: conic-gradient(#e9fa9d var(--progress), #b799ec59 0);
}

.ring::before {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: #462a7c;
}

.progress-card::before {
  content: "";
  position: absolute;
  z-index: 0;
  top: 50%;
  right: -39px;
  width: 254px;
  aspect-ratio: 1;
  translate: 0 -50%;
  border: 1px solid #d5bdff42;
  border-radius: 50%;
  box-shadow: 0 0 0 24px #b894ff19, 0 0 0 49px #b894ff16, 0 0 0 74px #b894ff13;
}

.progress-card::after {
  content: "";
  position: absolute;
  z-index: 0;
  top: 22px;
  right: 24px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d6c3fd;
  box-shadow: -160px 107px 0 -1px #b29de4, -134px -4px 0 -1px #fff, -191px 30px 0 -1px #cbaaff;
}

@media (max-width: 640px) {
  .ring { width: 89px; }
}
</style>
