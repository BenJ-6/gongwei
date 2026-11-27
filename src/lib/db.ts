import { invoke } from "@tauri-apps/api/core";

let dbUrlPromise: Promise<string> | null = null;

/** 获取 Rust 侧计算好的 Local 数据库 URL，进程内只调用一次。 */
export function getDbUrl(): Promise<string> {
  if (!dbUrlPromise) {
    dbUrlPromise = invoke<string>("db_url").catch((error) => {
      dbUrlPromise = null;
      throw error;
    });
  }
  return dbUrlPromise;
}
