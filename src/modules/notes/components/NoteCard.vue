<script setup lang="ts">
import { nextTick, ref } from "vue";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNoteTime, NOTE_COLORS, NOTE_COLOR_MAP } from "../domain";
import type { NewNoteInput, Note } from "../types";

const props = defineProps<{ note: Note }>();
const emit = defineEmits<{
  remove: [];
  togglePin: [];
  save: [input: NewNoteInput];
}>();

const editing = ref(false);
const draft = ref<NewNoteInput>({ title: "", content: "", color: "violet" });
const titleInput = ref<InstanceType<typeof Input> | null>(null);

async function startEdit(): Promise<void> {
  if (editing.value) return;
  draft.value = {
    title: props.note.title,
    content: props.note.content,
    color: props.note.color,
  };
  editing.value = true;
  await nextTick();
  (titleInput.value?.$el as HTMLInputElement | undefined)?.focus();
}

function save(): void {
  if (!editing.value) return;
  editing.value = false;
  emit("save", { ...draft.value });
}

function onEditorKeydown(event: KeyboardEvent): void {
  if (event.isComposing) return;
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    save();
  } else if (event.key === "Escape") {
    event.preventDefault();
    editing.value = false;
  }
}
</script>

<template>
  <article
    class="group flex min-h-[210px] flex-col rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md"
    :class="NOTE_COLOR_MAP[note.color].card"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 items-center gap-2">
        <span
          class="size-2.5 shrink-0 rounded-full"
          :class="NOTE_COLOR_MAP[note.color].accent"
          aria-hidden="true"
        />
        <Input
          v-if="editing"
          ref="titleInput"
          v-model="draft.title"
          class="h-7 border-0 bg-white/60 px-1.5 text-[13px] font-bold shadow-none focus-visible:ring-1 dark:bg-black/10"
          aria-label="便签标题"
          @keydown="onEditorKeydown"
        />
        <h3 v-else class="truncate text-[13px] font-bold tracking-[-.01em]" :title="note.title">
          {{ note.title }}
        </h3>
      </div>

      <div class="flex shrink-0 gap-0.5">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="size-7 text-muted-foreground"
              :aria-label="note.pinned ? '取消置顶：' + note.title : '置顶：' + note.title"
              @click="emit('togglePin')"
            >
              <PinOff v-if="note.pinned" class="size-3.5" aria-hidden="true" />
              <Pin v-else class="size-3.5" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ note.pinned ? "取消置顶" : "置顶" }}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="size-7 text-muted-foreground"
              :disabled="editing"
              :aria-label="'编辑：' + note.title"
              @click="startEdit"
            >
              <Pencil class="size-3.5" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>编辑</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="size-7 text-muted-foreground hover:bg-[#ffebe7] hover:text-[#9b3d36]"
              :aria-label="'删除：' + note.title"
              @click="emit('remove')"
            >
              <Trash2 class="size-3.5" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>删除</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <template v-if="editing">
      <textarea
        v-model="draft.content"
        rows="6"
        aria-label="便签内容"
        class="mt-3 w-full resize-none rounded-xl border border-input/70 bg-white/60 p-2.5 text-[12.5px] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-black/10"
        @keydown="onEditorKeydown"
      />

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-1.5" role="group" aria-label="便签颜色">
          <button
            v-for="option in NOTE_COLORS"
            :key="option.value"
            type="button"
            class="size-4 rounded-full transition-transform hover:scale-110"
            :class="[
              option.swatch,
              draft.color === option.value && 'ring-2 ring-primary ring-offset-1',
            ]"
            :aria-label="option.label"
            :aria-pressed="draft.color === option.value"
            :title="option.label"
            @click="draft.color = option.value"
          />
        </div>

        <div class="flex items-center gap-1">
          <Button variant="ghost" size="sm" class="h-7 px-2 text-[11px]" @click="editing = false">
            取消
          </Button>
          <Button size="sm" class="h-7 px-3 text-[11px]" @click="save">保存</Button>
        </div>
      </div>
    </template>

    <p
      v-else
      class="mt-3 line-clamp-7 whitespace-pre-wrap text-[12.5px] leading-relaxed opacity-80"
    >
      {{ note.content || "这条便签还没有内容" }}
    </p>

    <footer class="mt-auto flex items-center justify-between gap-2 pt-4 text-[10.5px] text-muted-foreground">
      <span>{{ formatNoteTime(note.updatedAt) }}更新</span>
      <span v-if="note.pinned" class="inline-flex items-center gap-1">
        <Pin class="size-3" aria-hidden="true" />已置顶
      </span>
    </footer>
  </article>
</template>
