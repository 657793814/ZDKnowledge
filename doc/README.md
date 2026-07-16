# KnowledgePower 知识动力 — 项目文档

## 管理员账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| **管理员** | `admin` | `admin123` | 全部权限（AI 配置、用户管理、知识管理） |
| 普通用户 | `student1` | `test123` | 仅做题、看统计、错题本 |
| 测试用户 | `test` | `test123` | 同上 |

> 首次启动后，通过 `POST /auth/login` 或用前端登录页即可登录。
> 管理员可在「用户管理」页创建新用户或修改角色。

## 测试 API（curl）

```bash
# 登录获取 token
curl -s http://localhost:3001/auth/login -X POST \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

# 用 token 访问受保护接口
TOKEN="上面返回的token"
curl -s http://localhost:3001/admin/ai-config -H "Authorization: Bearer $TOKEN"
```

## 启动命令

```bash
# 1️⃣ 启动后端（开发）
cd node-server && npx tsx src/index.ts

# 2️⃣ 启动前端（开发）
cd web && npm run dev

# 3️⃣ 桌面端打包（生产）
bash scripts/build-node.sh
```

> 打包产物位于 `src-tauri/target/release/bundle/dmg/知识动力_0.1.0_aarch64.dmg`（~18MB）

## 打包流程说明

`scripts/build-node.sh` 自动执行以下步骤：

| 步骤 | 动作 | 产物 |
|------|------|------|
| [1/3] | Vite 构建前端 | `web/dist/`（~2.9MB）|
| [2/3] | esbuild 打包后端 + 最小化 node_modules | `src-tauri/backend/`（~34MB）|
| [3/3] | cargo tauri build → .dmg | `.../bundle/dmg/*.dmg`（~18MB）|

**后端资源优化：** 打包时只安装运行时 3 个依赖（`@prisma/client`、`bcryptjs`、`better-sqlite3`），删除 prisma CLI 和其他数据库的 WASM 引擎，最终 backend 从 318MB 降至 34MB。

## 技术栈

- **前端:** React + TypeScript + Vite + Ant Design
- **后端:** Express + Prisma + SQLite
- **桌面壳:** Tauri v2 (Rust)，Node 子进程模式
- **AI:** Ollama / OpenAI 兼容 API
- **向量库:** Milvus (RAG 知识库)
