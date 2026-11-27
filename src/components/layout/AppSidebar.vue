<script setup lang="ts">
import { computed, ref } from "vue";
import { Info, LayoutGrid } from "lucide-vue-next";
import AboutDialog from "@/components/AboutDialog.vue";
import { APP_VERSION } from "@/lib/appInfo";
import { useUpdate } from "@/lib/update";
import { moduleGroups, modules } from "@/modules/registry";

const active = defineModel<string>({ required: true });

const groups = moduleGroups
  .map((group) => ({ group, items: modules.filter((item) => item.group === group) }))
  .filter(({ items }) => items.length > 0);

const badgeCounts = computed(() =>
  Object.fromEntries(modules.map((item) => [item.key, item.badge?.() ?? 0])),
);

const { hasUpdate } = useUpdate();
const aboutOpen = ref(false);
</script>

<template>
  <aside class="sidebar" aria-label="工位导航">
    <div class="brand">
      <div class="brand-mark"><LayoutGrid aria-hidden="true" /></div>
      <div class="brand-text"><strong>工位</strong><small>GONGWEI</small></div>
    </div>

    <nav aria-label="工作台模块">
      <div v-for="entry in groups" :key="entry.group" class="nav-group">
        <p class="nav-label">{{ entry.group }}</p>
        <button
          v-for="item in entry.items"
          :key="item.key"
          class="nav-link"
          :class="{ current: active === item.key }"
          type="button"
          :disabled="item.disabled"
          :aria-current="active === item.key ? 'page' : undefined"
          :aria-label="item.disabled ? item.name + '（待开放）' : item.name"
          :title="item.disabled ? item.name + '（待开放）' : item.name"
          @click="active = item.key"
        >
          <component :is="item.icon" class="size-[17px] shrink-0" aria-hidden="true" />
          <span>{{ item.name }}</span>
          <small v-if="item.disabled">待开放</small>
          <span v-else-if="item.badge" class="nav-count">{{ badgeCounts[item.key] }}</span>
        </button>
      </div>
    </nav>

    <div class="sidebar-footer">
      <span class="version">v{{ APP_VERSION }}</span>
      <button type="button" class="about-link" @click="aboutOpen = true">
        <Info class="size-[13px]" aria-hidden="true" />
        <span class="about-label">关于</span>
        <span v-if="hasUpdate" class="update-dot" aria-hidden="true" />
      </button>
    </div>

    <AboutDialog :open="aboutOpen" @close="aboutOpen = false" />
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
  padding: 26px 16px 20px;
  background: var(--sidebar);
  border-right: 1px solid var(--sidebar-border);
}

.brand { display: flex; align-items: center; gap: 11px; margin: 0 8px 41px; }
.brand-mark {
  display: grid;
  flex: none;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  color: var(--sidebar-primary-foreground);
  background: var(--sidebar-primary);
  box-shadow: 0 4px 10px #653ae43d;
}
.brand-mark svg { width: 22px; height: 22px; stroke-width: 1.7; }
.brand strong { display: block; font-size: 19px; line-height: 1.2; letter-spacing: .06em; }
.brand small { font-size: 10px; font-weight: 650; letter-spacing: .14em; color: var(--sidebar-foreground); }

.nav-group + .nav-group { margin-top: 23px; }
.nav-label { margin: 0 10px 9px; color: var(--sidebar-foreground); font-size: 11px; }
.nav-link {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 42px;
  gap: 9px;
  padding: 0 10px;
  margin: 3px 0;
  border-radius: 10px;
  text-align: left;
  color: var(--sidebar-foreground);
  font-size: 13px;
}
.nav-link:not(:disabled):hover { background: var(--secondary); }
.nav-link.current { color: var(--sidebar-accent-foreground); background: var(--sidebar-accent); font-weight: 700; }
.nav-link.current:hover { background: color-mix(in srgb, var(--sidebar-accent) 85%, var(--sidebar-primary)); }
.nav-link svg { stroke-width: 1.7; }
.nav-link small, .nav-count { margin-left: auto; white-space: nowrap; font-size: 10px; }
.nav-count { min-width: 23px; padding: 2px 4px; text-align: center; border-radius: 6px; background: var(--card); }

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  margin-top: auto;
  padding: 11px 4px 0;
  border-top: 1px solid var(--sidebar-border);
}
.version { padding: 0 6px; color: var(--sidebar-foreground); font-size: 11.5px; }
.about-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  color: var(--sidebar-foreground);
  font-size: 11.5px;
  font-weight: 500;
}
.about-link:hover { color: var(--foreground); background: var(--secondary); }
.about-link svg { stroke-width: 1.8; }
.update-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 2px var(--sidebar);
}

@media (max-width: 1050px) {
  .sidebar { padding-inline: 12px; }
}

@media (max-width: 850px) {
  .sidebar { padding: 20px 9px 16px; align-items: center; }
  .sidebar nav { width: 100%; }
  .brand { margin: 0 0 23px; }
  .brand-text, .nav-label, .nav-link span, .nav-link small, .version, .about-label {
    display: none;
  }
  .nav-link { justify-content: center; padding: 0; }
  .sidebar-footer { justify-content: center; padding-inline: 0; }
}

@media (max-width: 620px) {
  .sidebar { display: none; }
}
</style>
