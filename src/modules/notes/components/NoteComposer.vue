<script setup lang="ts">
import { ref } from "vue";
import { CornerDownLeft, NotebookPen } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NOTE_COLORS } from "../domain";
import { useNoteStore } from "../store";
import type { NoteColor } from "../types";

const store = useNoteStore();
const titleInput = ref<InstanceType<typeof Input> | null>(null);
const title = ref("");
const content = ref("");
const color = ref<NoteColor>("violet");

function focusTitle(): void {
  const element = titleInput.value?.$el as HTMLInputElement | undefined;
  element?.focus();
}

function onContentKeydown(event: KeyboardEvent): void {
  if (event.isComposing || !(event.ctrlKey || event.metaKey) || event.key !== "Enter") return;
  event.preventDefault();
  void submit();
}

async function submit(): Promise<void> {
  const value = title.value.trim();
  const body = content.value.trim();
  if (!value && !body) {
    focusTitle();
    return;
  }

  const adding = store.add({ title: value, content: body, color: color.value });
  const keyword = store.query.trim().toLowerCase();
  if (
    keyword &&
    !value.toLowerCase().includes(keyword) &&
    !body.toLowerCase().includes(keyword)
  ) {
    store.query = "";
  }

  title.value = "";
  content.value = "";
  color.value = "violet";
  focusTitle();
  await adding;
}

defineExpose({ focusTitle });
</script>

<template>
  <Card class="mb-4 rounded-[20px] py-0 shadow-[var(--shadow-card)]">
    <CardContent class="p-3.5">
      <form class="space-y-2.5" aria-label="添加便签" @submit.prevent="submit">
        <div class="flex min-w-0 items-center gap-2">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-[10px] bg-accent/70 text-accent-foreground/80"
          >
            <NotebookPen class="size-4.5" aria-hidden="true" />
          </span>
          <Input
            id="note-title"
            ref="titleInput"
            v-model="title"
            aria-label="便签标题"
            placeholder="给便签起个标题…"
            autocomplete="off"
            class="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
          />
        </div>

        <textarea
          v-model="content"
          aria-label="便签内容"
          placeholder="写点什么…"
          rows="3"
          class="min-h-[72px] w-full resize-y rounded-xl border border-input/70 bg-secondary/50 px-3 py-2 text-[12.5px] leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          @keydown="onContentKeydown"
        />

        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5" role="group" aria-label="便签颜色">
            <button
              v-for="option in NOTE_COLORS"
              :key="option.value"
              type="button"
              class="size-5 rounded-full transition-transform hover:scale-110"
              :class="[
                option.swatch,
                color === option.value && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
              ]"
              :aria-label="option.label"
              :aria-pressed="color === option.value"
              :title="option.label"
              @click="color = option.value"
            />
          </div>

          <span class="hidden text-[11px] text-muted-foreground sm:inline">Ctrl + Enter 快速添加</span>

          <Button type="submit" size="sm" class="h-8 gap-1.5 px-3 text-xs">
            添加便签<CornerDownLeft class="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
