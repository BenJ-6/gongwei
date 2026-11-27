<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from "vue";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Github,
  Loader2,
  RefreshCw,
  RotateCcw,
  X,
} from "lucide-vue-next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { APP_LICENSE, APP_NAME, APP_VERSION, REPO_URL } from "@/lib/appInfo";
import { isTauri } from "@/lib/env";
import { useUpdate } from "@/lib/update";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { state, progressPercent, checkForUpdate, downloadUpdate, installUpdate } = useUpdate();

const supported = isTauri;
const downloading = computed(() => state.phase === "downloading");
const sizeText = computed(() => {
  if (!state.contentLength) {
    return state.downloaded ? formatSize(state.downloaded) : "";
  }
  return `${formatSize(state.downloaded)} / ${formatSize(state.contentLength)}`;
});
const checkedAtText = computed(() =>
  state.checkedAt
    ? new Date(state.checkedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    : "",
);

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function close(): void {
  emit("close");
}

async function openRepo(): Promise<void> {
  if (supported) {
    await openUrl(REPO_URL);
    return;
  }
  window.open(REPO_URL, "_blank", "noopener");
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    close();
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      window.addEventListener("keydown", onKeydown);
    } else {
      window.removeEventListener("keydown", onKeydown);
    }
  },
);

onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 grid place-items-center bg-black/35 p-6 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition
          appear
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-2 scale-[0.98] opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
        >
          <div
            class="w-full max-w-[440px] overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-2xl"
          >
            <div class="relative flex items-start gap-3 border-b border-border px-5 pt-5 pb-4">
              <img src="/gongwei.svg" alt="" width="40" height="40" class="rounded-[10px]" />
              <div class="min-w-0 flex-1">
                <h2 class="text-[15px] font-bold tracking-[-0.01em]">{{ APP_NAME }}</h2>
                <p class="mt-1 text-[11.5px] text-muted-foreground">
                  版本 v{{ APP_VERSION }} · {{ APP_LICENSE }}
                </p>
              </div>
              <button
                type="button"
                class="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="关闭"
                @click="close"
              >
                <X :size="15" />
              </button>
            </div>

            <div class="space-y-3.5 px-5 py-4">
              <p class="text-[12.5px] leading-[1.75] text-muted-foreground">
                本地优先的桌面工作台，待办与各类记录全部保存在这台电脑上，不会上传到任何服务器。
              </p>

              <div class="rounded-xl border border-border bg-secondary p-3.5">
                <div class="flex items-center justify-between gap-3">
                  <span class="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
                    <RefreshCw :size="14" class="text-primary" />
                    应用更新
                  </span>
                  <span
                    v-if="checkedAtText && state.phase === 'latest'"
                    class="text-[11px] text-muted-foreground"
                  >
                    {{ checkedAtText }} 检查
                  </span>
                </div>

                <div
                  v-if="state.phase === 'idle' || state.phase === 'checking'"
                  class="mt-2 flex items-center justify-between gap-3"
                >
                  <p class="text-[11.5px] leading-relaxed text-muted-foreground">
                    {{
                      supported
                        ? "从 GitHub Releases 获取最新版本。"
                        : "浏览器预览模式不支持应用内更新。"
                    }}
                  </p>
                  <button
                    type="button"
                    class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!supported || state.phase === 'checking'"
                    @click="checkForUpdate()"
                  >
                    <Loader2 v-if="state.phase === 'checking'" :size="13" class="animate-spin" />
                    {{ state.phase === "checking" ? "检查中" : "检查更新" }}
                  </button>
                </div>

                <div v-else-if="state.phase === 'latest'" class="mt-2 space-y-2">
                  <p class="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                    <CheckCircle2 :size="14" />
                    已是最新版本
                  </p>
                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
                    @click="checkForUpdate()"
                  >
                    <RefreshCw :size="13" />
                    重新检查
                  </button>
                </div>

                <div v-else-if="state.phase === 'available'" class="mt-2 space-y-2.5">
                  <div class="flex items-center justify-between gap-3">
                    <p class="text-[12.5px] font-semibold text-foreground">
                      发现新版本 v{{ state.version }}
                    </p>
                    <button
                      type="button"
                      class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      @click="downloadUpdate()"
                    >
                      <Download :size="13" />
                      下载更新
                    </button>
                  </div>
                  <div
                    v-if="state.notes"
                    class="max-h-32 overflow-y-auto rounded-lg bg-card px-2.5 py-2 text-[11.5px] whitespace-pre-line text-muted-foreground"
                  >
                    {{ state.notes }}
                  </div>
                </div>

                <div v-else-if="downloading" class="mt-2 space-y-2">
                  <div class="flex items-center justify-between text-[11.5px] text-muted-foreground">
                    <span>正在下载 v{{ state.version }}</span>
                    <span>{{ progressPercent }}% · {{ sizeText }}</span>
                  </div>
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      class="h-full rounded-full bg-primary transition-[width] duration-200"
                      :class="state.contentLength ? '' : 'animate-pulse'"
                      :style="{ width: state.contentLength ? `${progressPercent}%` : '100%' }"
                    />
                  </div>
                </div>

                <div v-else-if="state.phase === 'ready'" class="mt-2 space-y-2">
                  <p class="text-[12px] leading-relaxed text-muted-foreground">
                    v{{ state.version }} 已下载完成，安装时应用会自动退出并重新启动。
                  </p>
                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    @click="installUpdate()"
                  >
                    <RotateCcw :size="13" />
                    立即重启安装
                  </button>
                </div>

                <p
                  v-else-if="state.phase === 'installing'"
                  class="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground"
                >
                  <Loader2 :size="14" class="animate-spin" />
                  正在启动安装器，应用即将退出…
                </p>

                <div v-else class="mt-2 space-y-2">
                  <p class="flex items-start gap-1.5 text-[12px] leading-relaxed text-destructive">
                    <AlertCircle :size="14" class="mt-px shrink-0" />
                    <span>{{ state.error }}</span>
                  </p>
                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
                    @click="checkForUpdate()"
                  >
                    <RefreshCw :size="13" />
                    重试
                  </button>
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-[11.5px] text-muted-foreground"
            >
              <span>© 2026 Ben J. · 数据保存在本机</span>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                @click="openRepo"
              >
                <Github :size="14" />
                项目主页
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
