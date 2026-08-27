# Dashboard 文档自动截图

用 Playwright 登录本地 `dashboard-ce`，按文档步骤截图，并覆盖写入 `website/docs/.../images/`。

当前场景覆盖控制台 **人工智能 → 推理** 菜单：部署 / 模板 / 模型文件 / 镜像 / 基准测试。

## 前置条件

1. 本地已启动 dashboard-ce：

```bash
cd dashboard-ce
yarn serve
# 默认 http://localhost:8081（见 dashboard-ce/dev.server.config.js）
```

2. 后端代理可用，账号能登录，且环境中最好已有至少 1 条可编辑的推理模板（用于「修改」截图）。

## 安装

在 `website` 根目录：

```bash
yarn screenshots:install
```

## 配置账号

```bash
cp scripts/screenshots/.env.example scripts/screenshots/.env
```

编辑 `.env`：

```env
DASHBOARD_URL=http://localhost:8081
DASHBOARD_USERNAME=your-user
DASHBOARD_PASSWORD=your-password
# DASHBOARD_DOMAIN=default   # 可选
# DASHBOARD_LOGIN_MODE=api   # 有验证码时强制走 API 登录
# HEADED=1                   # 有界面调试
```

`.env` 与 `.auth/` 不会入库。

## 运行

```bash
# website 根目录 — 单个场景
yarn screenshots:llm-sku

# 推理菜单全部场景（部署 / 模板 / 模型文件 / 镜像 / 基准测试）
yarn screenshots:llm-inference
```

或：

```bash
yarn --cwd scripts/screenshots capture llm-deployment
yarn --cwd scripts/screenshots capture llm-inference
```

成功后会覆盖写入 `docs/aicloud/guides/llm-inference/images/` 下对应 PNG。

## 登录说明

- 默认 `DASHBOARD_LOGIN_MODE=auto`：若服务端开启验证码（`/api/v1/auth/regions` 的 `captcha`），直接走 `POST /api/v1/auth/login`；否则先尝试表单登录。
- API 登录前会清空浏览器 cookie。原因：打开登录页会请求 `/v1/auth/captcha` 写入 session；带着该 session 却不提交 4 位验证码会报 `wrong captcha length!`。无 captcha session 时后端会跳过校验。
- 也可手动设 `DASHBOARD_LOGIN_MODE=api`。
- 登录态缓存到 `scripts/screenshots/.auth/user.json`，下次复用；失效会自动重登。
- 截图默认覆盖整页视口（顶栏 + 左侧二级菜单 `.level-2-wrap` + 主内容），便于文档对照入口路径。
- 默认以 `deviceScaleFactor=2`（`SCREENSHOT_DPR`）截图，PNG 更清晰；需要 3x 可设 `SCREENSHOT_DPR=3`。

## 快速开始相关图

```bash
yarn screenshots:llm-quickstart
# 仅补拍 HAMI 显存验证（实例终端 nvidia-smi）
yarn --cwd scripts/screenshots tsx capture-hami-verify.ts
```

会覆盖 ModelScope 导入、部署创建/就绪、API Key、chat 测试、AI 网关接入、HAMI 显存验证等 quickstart 用图（2880×1800 PNG）。

## 扩展新页面

1. 在 `manifest.ts` 增加 `shotId → docs/.../images/xxx.png`
2. 新增 `scenarios/<name>.ts`，实现截图步骤
3. 在 `scenarios/index.ts` 注册
4. 在 `website/package.json` 增加便捷脚本（可选）

## 目录

```
scripts/screenshots/
  capture.ts              # CLI 入口
  manifest.ts             # 截图输出路径
  playwright.config.ts    # viewport 等默认值
  scenarios/              # 按文档页拆分的场景
  src/auth.ts             # 登录
  src/shot.ts             # 截图 helper
  src/env.ts              # 环境变量
```
