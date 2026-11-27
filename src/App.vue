<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import TitleBar from "@/components/layout/TitleBar.vue";
import { isTauri } from "@/lib/env";
import { useUpdate } from "@/lib/update";
import { modules } from "@/modules/registry";

const activeKey = ref("todo");
const activeModule = computed(
  () => modules.find((item) => item.key === activeKey.value) ?? modules[0],
);

const { checkForUpdate } = useUpdate();

onMounted(() => {
  if (!isTauri) {
    return;
  }
  // 启动后静默检查一次，仅在侧边栏“关于”按钮上打一个提示点
  window.setTimeout(() => {
    void checkForUpdate({ silent: true });
  }, 4000);
});
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <TitleBar />

    <div class="workbench-shell">
      <AppSidebar v-model="activeKey" />

      <main class="flex min-w-0 flex-col overflow-hidden">
        <KeepAlive>
          <component
            :is="activeModule.component"
            v-if="activeModule.component"
            :key="activeModule.key"
          />
        </KeepAlive>
      </main>
    </div>
  </div>
</template>

<style scoped>
.workbench-shell {
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-columns: 208px minmax(0, 1fr);
  overflow: hidden;
}

@media (max-width: 1050px) {
  .workbench-shell { grid-template-columns: 180px minmax(0, 1fr); }
}

@media (max-width: 850px) {
  .workbench-shell { grid-template-columns: 65px minmax(0, 1fr); }
}

@media (max-width: 620px) {
  .workbench-shell { grid-template-columns: minmax(0, 1fr); }
}
</style>
