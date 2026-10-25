# Vincent 的博客

基于 **TanStack Start + React + TypeScript + Vite** 的个人博客。首页展示按日期倒序排列的文章，详情页通过 `/posts/$slug` 路由进行服务端渲染，正文由 `react-markdown` 渲染本地 Markdown。包含两篇中文示例文章、响应式页头/页脚和中文 404 页面。

## 环境与安装

使用 **npm**，提交 `package-lock.json` 固定依赖。需要 Node.js **22.12+**，推荐 Node.js **24 LTS**（CI 使用 24）。

```bash
npm ci
```

## 本地开发

```bash
npm run dev
```

默认打开 <http://localhost:3000>。如果端口被占用，以终端输出的地址为准。

- 首页：`/`
- 示例文章：`/posts/hello-blog`、`/posts/writing-as-thinking`
- 404 验证：`/posts/not-found` 或其他不存在的路径

## 类型检查与构建

```bash
npm run typecheck
npm run build
npm run preview
```

`typecheck` 会先生成类型安全的路由树，再运行 TypeScript 检查。`build` 生成 `dist/` 下的客户端及服务端产物，`preview` 用于在本地预览构建结果，以终端输出的地址为准。部署平台与生产运行适配留待后续确定。

GitHub Actions 在 PR 和 `main` 推送时执行依赖安装、类型检查与构建。

## 写一篇文章

1. 在 `src/content/` 添加 `.md` 文件，正文从二级标题开始（页面会显示文章主标题）。
2. 在 `src/lib/posts.ts` 中以 `?raw` 导入文件，并添加文章信息：唯一的 `slug`、标题、`YYYY-MM-DD` 日期、分类、摘要和正文。
3. 保存后首页自动按日期倒序展示，详情页地址为 `/posts/<slug>`。

支持常用 Markdown 标题、列表、链接、引用和代码块。不执行 Markdown 内的 HTML 或脚本，无需数据库或 CMS。

```text
src/
  content/              # 中文 Markdown 示例
  lib/posts.ts          # 文章信息与日期格式化
  routes/__root.tsx     # 共享布局、页面元信息与 404
  routes/index.tsx      # 首页文章列表
  routes/posts.$slug.tsx # 文章详情
  router.tsx            # TanStack Router 配置
  routeTree.gen.ts      # 自动生成，请勿手改
  styles.css            # 响应式基础样式
```

## 脚手架来源

按 [TanStack Start 官方入门文档](https://tanstack.com/start/latest/docs/framework/react/getting-started) 使用官方 CLI 初始化。先检查了 `npm create @tanstack/start@latest -- --help`，其提示旧包已弃用并推荐 `@tanstack/cli`，因此实际运行：

```bash
npx --yes @tanstack/cli@latest create blog \
  --framework React --build-tool vite --package-manager npm \
  --blank --no-toolchain --no-git --no-intent --no-install \
  --non-interactive --target-dir /tmp/issue-1-tanstack-blog-scaffold
```

为保留已有 worktree 的 Git 信息，先在临时目录生成，再将应用源文件与必要配置复制到本仓库；随后安装依赖并添加博客页面。未启用部署适配、后台或额外集成。
