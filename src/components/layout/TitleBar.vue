<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { getCurrentWindow, type Window } from "@tauri-apps/api/window";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { Copy, Minus, Square, X } from "lucide-vue-next";
import { isTauri } from "@/lib/env";

const appWindow: Window | null = isTauri ? getCurrentWindow() : null;
const maximized = ref(false);
let unlisten: UnlistenFn | undefined;

onMounted(async () => {
  if (!appWindow) return;
  maximized.value = await appWindow.isMaximized();
  unlisten = await appWindow.onResized(() => {
    void appWindow.isMaximized().then((value) => {
      maximized.value = value;
    });
  });
});

onUnmounted(() => {
  unlisten?.();
});

async function minimize(): Promise<void> {
  await appWindow?.minimize();
}

async function toggleMaximize(): Promise<void> {
  await appWindow?.toggleMaximize();
}

async function close(): Promise<void> {
  await appWindow?.close();
}
</script>

<template>
  <header v-if="appWindow" class="flex h-8 shrink-0 select-none border-b bg-sidebar" data-tauri-drag-region>
    <div class="flex flex-1 items-stretch" data-tauri-drag-region>
      <div class="flex-1" data-tauri-drag-region />

      <div class="flex items-stretch">
        <button
          type="button"
          class="grid w-[46px] place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="最小化"
          aria-label="最小化"
          @click="minimize"
        >
          <Minus class="pointer-events-none size-4" />
        </button>

        <button
          type="button"
          class="grid w-[46px] place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          :title="maximized ? '还原' : '最大化'"
          :aria-label="maximized ? '还原' : '最大化'"
          @click="toggleMaximize"
        >
          <Copy v-if="maximized" class="pointer-events-none size-3.5" />
          <Square v-else class="pointer-events-none size-3" />
        </button>

        <button
          type="button"
          class="grid w-[46px] place-items-center text-muted-foreground transition-colors hover:bg-[#e81123] hover:text-white"
          title="关闭"
          aria-label="关闭"
          @click="close"
        >
          <X class="pointer-events-none size-4" />
        </button>
      </div>
    </div>
  </header>
</template>
