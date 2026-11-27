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
  /** 是否出现在主导航分组中，默认 true */
  showInNav?: boolean;
}
