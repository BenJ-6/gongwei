<script setup lang="ts">
import { computed, ref } from "vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import TitleBar from "@/components/layout/TitleBar.vue";
import { modules } from "@/modules/registry";

const activeKey = ref("todo");
const activeModule = computed(
  () => modules.find((item) => item.key === activeKey.value) ?? modules[0],
);
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <TitleBar />

    <div
      class="grid min-h-0 flex-1 grid-cols-[232px_minmax(0,1fr)] overflow-hidden max-[900px]:grid-cols-[68px_minmax(0,1fr)]"
    >
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
