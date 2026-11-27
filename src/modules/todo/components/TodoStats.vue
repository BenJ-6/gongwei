<script setup lang="ts">
import { computed } from "vue";
import { Bell, Clock, TrendingUp } from "lucide-vue-next";
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
  <section class="overview" aria-label="任务概览">
    <article class="overview-card progress-card">
      <div>
        <h2 class="metric-label"><TrendingUp aria-hidden="true" />整体完成度</h2>
        <p class="metric-number"><span>{{ store.doneCount }}</span><small>/ {{ store.total }} 项</small></p>
        <p class="metric-note">已完成待办</p>
      </div>
      <div
        class="ring"
        :style="{ '--progress': store.percent + '%' }"
        role="progressbar"
        aria-label="整体完成度"
        :aria-valuenow="store.percent"
      >
        <span>{{ store.percent }}%</span>
      </div>
    </article>

    <article class="overview-card stat pending">
      <span class="metric-icon"><Clock aria-hidden="true" /></span>
      <h2 class="metric-label">待处理</h2>
      <p class="metric-number"><span>{{ store.pendingCount }}</span><small>项</small></p>
      <p class="metric-note">高优先级 {{ breakdown.high }} 项</p>
    </article>

    <article class="overview-card stat urgent">
      <span class="metric-icon"><Bell aria-hidden="true" /></span>
      <h2 class="metric-label">需要关注</h2>
      <p class="metric-number"><span>{{ store.urgentCount }}</span><small>项</small></p>
      <p class="metric-note">今天到期 {{ breakdown.dueToday }} · 已逾期 {{ store.urgentCount - breakdown.dueToday }}</p>
    </article>
  </section>
</template>
