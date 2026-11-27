# Tauri + Vue + TypeScript

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 发布

推送 `v*` 标签后，[release.yml](.github/workflows/release.yml) 会在 `windows-latest` 上构建安装包并创建**草稿** Release。

```powershell
# 1. 同步版本号 → 校验 → 类型检查 + cargo test → 本地提交
bun run release:bump          # 默认 patch：0.1.0 → 0.1.1
bun run release:bump minor    # 0.1.1 → 0.2.0
bun run release:bump 0.2.3    # 指定版本

# 2. 校验版本号与标签一致 → 打标签 → 推送，触发流水线
bun run release:tag
```

- `release:bump` 要求工作区干净，同步四处版本号（`package.json`、`Cargo.toml`、`Cargo.lock`、`tauri.conf.json`），提交信息为 `chore: release vX.Y.Z`。
- `release:tag` 从 `package.json` 推导标签，校验三处版本号一致且标签未被占用，然后推送分支与标签。
- 常用选项：`--dry-run` 预览、`-y` 跳过确认；`release:bump` 支持 `--no-test`，`release:tag` 支持 `--no-push`。

手动发版：把三处版本号改成同一个版本 → `bun run version:check` → `git tag v0.1.1 && git push origin v0.1.1`。

推送后到 Actions 页面审批环境部署，构建完成再到 Releases 页面把草稿 Release **手动发布**。

### 首次配置

在仓库 Settings → Environments 新建环境 `release`：Required reviewers 勾选自己，Deployment branches and tags 选 “Selected branches and tags” 并添加 **Tag** 规则 `v*`（下拉框注意切到 Tag）。该环境用于发布审批，无需额外 Secrets（`GITHUB_TOKEN` 由 Actions 提供）。

### 注意事项

- 产物名中的中文会被 GitHub 改名，因此 [release.yml](.github/workflows/release.yml) 用 `releaseAssetNamePattern: "[mainBinaryName]_[version]_[arch][setup][ext]"` 生成 ASCII 资产名，如 `gongwei_0.1.1_x64-setup.exe`。
- 流水线使用 `tauri-action@v1`：v0 会用 ASCII 化后的资产名反查下载地址，遇到中文产物名会匹配失败。
- 应用内自动更新尚未接入；如需该功能，需追加 `tauri-plugin-updater`、`bundle.createUpdaterArtifacts` 与 `plugins.updater`（含签名公钥），并在 `release` 环境配置签名私钥 Secrets。

