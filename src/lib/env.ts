/** 是否运行在 Tauri 容器内（浏览器直接打开时为 false） */
export const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
