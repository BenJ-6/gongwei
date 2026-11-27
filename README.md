# Tauri + Vue + TypeScript

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 构建安装包

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY="私钥内容或私钥文件路径"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD="私钥密码"
bun tauri build
```

产物位于 `src-tauri/target/release/bundle/`，只产出 NSIS（`bundle.targets` 为 `["nsis"]`），因为应用内更新以 NSIS 安装器为更新载体。

由于开启了 `bundle.createUpdaterArtifacts`，构建时会同时生成 `.exe.sig` 签名文件；**未提供签名私钥时构建会直接失败**。

## 应用内更新

入口在侧边栏左下的「关于」面板：显示当前版本，并提供「检查更新 → 下载更新 → 立即重启安装」的完整流程。应用启动 4 秒后会静默检查一次，有新版本时「关于」右上角出现一个小圆点。

### 密钥

本项目使用**个人通用的 Tauri 更新签名密钥**（多个 Tauri 项目共用同一把，不绑定具体项目）：

- 私钥：`C:\Users\Ben\.tauri\ben-tauri.key`（请离线备份，**不要提交到仓库**；丢失后已安装的用户将无法再收到更新）
- 公钥：这把密钥的公钥，已写入 [tauri.conf.json](src-tauri/tauri.conf.json) 的 `plugins.updater.pubkey`

本地构建时指向这把私钥：

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY="$env:USERPROFILE\.tauri\ben-tauri.key"
bun tauri build
```

重新生成密钥（必须在首次发布前完成，之后更换会导致已安装用户收不到更新）：

```powershell
bun tauri signer generate -w $env:USERPROFILE\.tauri\ben-tauri.key
```

生成后把 `.pub` 文件的内容整段填入 `plugins.updater.pubkey`（不能填文件路径），所有使用这把密钥的项目都要同步更新公钥。

### GitHub 首次配置

在仓库 Settings → Environments 新建环境 `release`：

- Required reviewers 勾选自己，Deployment branches and tags 选 “Selected branches and tags” 并添加 **Tag** 规则 `v*`（下拉框注意切到 Tag，不要选 Branch）。
- 在该环境下添加 Secrets：`TAURI_SIGNING_PRIVATE_KEY`（个人通用签名密钥的私钥文件全文）、`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`（该密钥无密码，可省略）。

> 密钥放在 Environment secrets 而不是 Repository secrets，是为了让发布必须经过审批，其他 workflow 也读不到私钥。

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

推送后到 Actions 页面审批环境部署，构建完成再到 Releases 页面把草稿 Release **手动发布**（不发布的话客户端拿不到更新）。

### 注意事项

- 产物名中的中文会被 GitHub 改名，因此 [release.yml](.github/workflows/release.yml) 用 `releaseAssetNamePattern: "[mainBinaryName]_[version]_[arch][setup][ext]"` 生成 ASCII 资产名，如 `gongwei_0.1.1_x64-setup.exe`。
- 流水线使用 `tauri-action@v1`：v0 会用 ASCII 化后的资产名反查下载地址，遇到中文产物名会匹配失败，`latest.json` 不会生成。
- 已安装用户依靠 Release 中的 `latest.json` 与 `.exe.sig` 更新，因此每次发布都要保留这两个资产。
- 仅支持由 NSIS 安装的实例；便携版或浏览器预览无法使用应用内更新。

