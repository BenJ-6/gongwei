<script setup lang="ts">
import { computed } from "vue";
import { moduleGroups, modules } from "@/modules/registry";
import type { WorkbenchModule } from "@/modules/types";
import { cn } from "@/lib/utils";

const active = defineModel<string>({ required: true });

const groups = computed(() =>
  moduleGroups
    .map((group) => ({
      group,
      list: modules.filter((item) => item.group === group),
    }))
    .filter((entry) => entry.list.length > 0),
);

const badgeCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {};
  for (const item of modules) {
    counts[item.key] = item.badge?.() ?? 0;
  }
  return counts;
});

function select(item: WorkbenchModule): void {
  if (!item.disabled) active.value = item.key;
}
</script>

<template>
  <aside
    class="flex h-full min-h-0 flex-col gap-5 overflow-hidden border-r border-sidebar-border bg-sidebar px-3 pt-3 pb-3 text-sidebar-foreground"
  >
    <nav class="flex flex-col gap-4">
      <div v-for="entry in groups" :key="entry.group">
        <div
          class="px-2.5 pb-2 text-[11px] tracking-[0.12em] text-white/25 uppercase max-[900px]:hidden"
        >
          {{ entry.group }}
        </div>

        <button
          v-for="item in entry.list"
          :key="item.key"
          type="button"
          :disabled="item.disabled"
          :title="item.disabled ? `${item.name}（即将上线）` : item.name"
          :class="
            cn(
              'flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] transition-colors',
              active === item.key
                ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                : 'hover:bg-white/5 hover:text-white/90',
              item.disabled &&
                'cursor-not-allowed opacity-35 hover:bg-transparent hover:text-sidebar-foreground',
            )
          "
          @click="select(item)"
        >
          <component :is="item.icon" class="size-[17px] shrink-0" />
          <span class="max-[900px]:hidden">{{ item.name }}</span>
          <span
            v-if="badgeCounts[item.key] > 0"
            class="ml-auto rounded-full bg-primary px-1.5 text-[11px] leading-4 font-semibold text-primary-foreground max-[900px]:hidden"
          >
            {{ badgeCounts[item.key] }}
          </span>
        </button>
      </div>
    </nav>

    <div class="mt-auto flex items-center gap-2.5 border-t border-sidebar-border px-2 pt-3">
      <div
        class="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-semibold text-white/80"
      >
        GW
      </div>
      <div class="max-[900px]:hidden">
        <div class="text-[12.5px] text-white/80">我的工位</div>
        <div class="text-[11px] text-white/30">数据保存在本机</div>
      </div>
    </div>
  </aside>
</template>
