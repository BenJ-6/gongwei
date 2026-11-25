import { defineAsyncComponent } from "vue";
import { CalendarDays, ListTodo, NotebookPen, Settings2 } from "lucide-vue-next";
import type { WorkbenchModule } from "./types";
import { useTodoStore } from "./todo/store";

export const modules: WorkbenchModule[] = [
  {
    key: "todo",
    name: "待办清单",
    group: "日常",
    icon: ListTodo,
    component: defineAsyncComponent(() => import("./todo/TodoView.vue")),
    badge: () => useTodoStore().pendingCount,
  },
  { key: "schedule", name: "日程安排", group: "日常", icon: CalendarDays, disabled: true },
  { key: "notes", name: "笔记便签", group: "日常", icon: NotebookPen, disabled: true },
  { key: "settings", name: "设置", group: "工具", icon: Settings2, disabled: true },
];

export const moduleGroups = ["日常", "工具"];
