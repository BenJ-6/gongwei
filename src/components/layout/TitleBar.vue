<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { getCurrentWindow, type Window } from "@tauri-apps/api/window";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { Copy, Layers, Minus, Square, X } from "lucide-vue-next";
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
  <header class="flex h-9 shrink-0 select-none" data-tauri-drag-region>
    <div
      class="flex w-[232px] shrink-0 items-center gap-2 bg-sidebar px-3 max-[900px]:w-[68px] max-[900px]:justify-center"
      data-tauri-drag-region
    >
      <div
        class="pointer-events-none grid size-5 shrink-0 place-items-center rounded-md bg-linear-to-br from-indigo-500 to-violet-500 text-white"
      >
        <Layers class="size-3" />
      </div>
      <span
        class="pointer-events-none text-[13px] font-semibold tracking-wide text-white/90 max-[900px]:hidden"
      >
        工位
      </span>
      <span class="pointer-events-none ml-auto text-[10px] text-white/25 max-[900px]:hidden">
        v0.1
      </span>
    </div>

    <div class="flex flex-1 items-stretch" data-tauri-drag-region>
      <div class="flex-1" data-tauri-drag-region />

      <div v-if="appWindow" class="flex items-stretch">
        <button
          type="button"
          class="grid w-[46px] place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="最小化"
          @click="minimize"
        >
          <Minus class="pointer-events-none size-4" />
        </button>

        <button
          type="button"
          class="grid w-[46px] place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          :title="maximized ? '还原' : '最大化'"
          @click="toggleMaximize"
        >
          <Copy v-if="maximized" class="pointer-events-none size-3.5" />
          <Square v-else class="pointer-events-none size-3" />
        </button>

        <button
          type="button"
          class="grid w-[46px] place-items-center text-muted-foreground transition-colors hover:bg-[#e81123] hover:text-white"
          title="关闭"
          @click="close"
        >
          <X class="pointer-events-none size-4" />
        </button>
      </div>
    </div>
  </header>
</template>
