import type { Component } from "vue";

export interface WorkbenchModule {
  key: string;
  name: string;
  group: string;
  icon: Component;
  component?: Component;
  /** 侧栏角标数字，0 时不展示 */
  badge?: () => number;
  disabled?: boolean;
}
