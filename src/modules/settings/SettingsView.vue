<script setup lang="ts">
import { computed, type Component } from "vue";
import { Check, ChevronRight, Monitor, Moon, Palette, Sun } from "lucide-vue-next";
import { useTheme, type ThemeAccent, type ThemeMode } from "@/lib/theme";

const { mode, accent } = useTheme();

const modeOptions: { value: ThemeMode; label: string; icon: Component }[] = [
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
  { value: "system", label: "系统", icon: Monitor },
];

const accentOptions: { value: ThemeAccent; label: string; color: string }[] = [
  { value: "violet", label: "紫色", color: "var(--swatch-violet)" },
  { value: "blue", label: "蓝色", color: "var(--swatch-blue)" },
  { value: "mint", label: "薄荷", color: "var(--swatch-mint)" },
  { value: "amber", label: "琥珀", color: "var(--swatch-amber)" },
];

const currentModeLabel = computed(
  () => modeOptions.find((item) => item.value === mode.value)?.label ?? "系统",
);
</script>

<template>
  <div class="flex h-full min-h-0 flex-col text-sm">
    <div class="h-16 shrink-0 border-b bg-sidebar max-sm:h-14">
      <div class="mx-auto flex h-full w-full max-w-[1160px] items-center px-9 max-sm:px-3.5">
        <div class="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
          <span>工位</span>
          <ChevronRight class="size-3.5" aria-hidden="true" />
          <strong class="font-semibold text-foreground">系统设置</strong>
        </div>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
      <div class="mx-auto w-full max-w-[760px] px-9 pt-7 pb-6 max-sm:px-3.5 max-sm:pt-5">
        <section class="rounded-[20px] border bg-card p-5 shadow-[var(--shadow-card)]">
          <header class="flex items-start gap-3 border-b border-border pb-4">
            <span
              class="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"
            >
              <Palette :size="17" aria-hidden="true" />
            </span>
            <div class="min-w-0">
              <h1 class="text-[18px] font-bold tracking-[-.025em]">外观</h1>
              <p class="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                设置主题模式与强调色，更改会立即生效并保存在本机。
              </p>
            </div>
          </header>

          <div class="pt-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-[13px] font-semibold">主题模式</h2>
                <p class="mt-0.5 text-[11px] text-muted-foreground">
                  跟随系统时会随系统深浅色自动切换。
                </p>
              </div>
              <span class="text-[11px] whitespace-nowrap text-muted-foreground">
                当前：{{ currentModeLabel }}
              </span>
            </div>

            <div class="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="主题模式">
              <button
                v-for="item in modeOptions"
                :key="item.value"
                type="button"
                role="radio"
                class="flex h-11 items-center justify-center gap-2 rounded-xl border text-[12.5px] font-medium transition-colors"
                :class="
                  mode === item.value
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                "
                :aria-checked="mode === item.value"
                @click="mode = item.value"
              >
                <component :is="item.icon" :size="14" aria-hidden="true" />
                {{ item.label }}
              </button>
            </div>
          </div>

          <div class="my-5 h-px bg-border" />

          <div>
            <h2 class="text-[13px] font-semibold">强调色</h2>
            <p class="mt-0.5 text-[11px] text-muted-foreground">
              用于按钮、焦点与选中状态，不会影响便签自身的颜色。
            </p>

            <div class="mt-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label="强调色">
              <button
                v-for="item in accentOptions"
                :key="item.value"
                type="button"
                role="radio"
                class="flex h-9 items-center gap-2 rounded-full border px-3 text-[12px] font-medium transition-colors"
                :class="
                  accent === item.value
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                "
                :aria-checked="accent === item.value"
                @click="accent = item.value"
              >
                <span
                  class="size-3.5 rounded-full"
                  :style="{ backgroundColor: item.color }"
                  aria-hidden="true"
                />
                {{ item.label }}
                <Check v-if="accent === item.value" :size="12" aria-hidden="true" />
              </button>
            </div>
          </div>

          <p class="mt-5 text-[11px] text-muted-foreground">
            这些设置只影响本机显示，不会同步到服务器。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
