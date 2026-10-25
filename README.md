# Vincent 的博客

基于 **TanStack Start + React + TypeScript + Vite** 的个人博客。生产采用 **SSG 静态导出：静态文件 + Caddy `file_server`**，不依赖 srvx 或 Node 常驻进程。首页和每篇 `/posts/$slug` 详情页都在构建时生成完整 HTML，正文由 `react-markdown` 渲染本地 Markdown；浏览器加载后保留 React 和 TanStack Router 的交互导航。包含两篇中文示例文章、响应式页头/页脚和中文 404 页面。

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

## 测试与生产构建

```bash
npm test
npm run typecheck
npm run build
```

**生产构建命令为 `npm ci && npm run build`，唯一部署目录为 `dist/client/`**。`build` 执行 TanStack Start 预渲染，然后自动运行 `test:static` 验收产物；任一预渲染或验收失败都会使构建失败。

```text
dist/client/
  index.html                         # 完整首页
  posts/hello-blog/index.html         # 完整文章，含中文 Markdown 正文
  posts/writing-as-thinking/index.html
  404.html                           # 中文错误页
  assets/                            # JS、CSS 等浏览器资源
```

配置依据 [TanStack Start 官方 Static Prerendering 文档](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)：`prerender.enabled` 开启预渲染，`autoSubfolderIndex` 输出目录下的 `index.html`，`crawlLinks` 从首页发现所有文章详情页，`failOnError` 阻止不完整发布。动态参数路由不会自动枚举，所有文章必须继续出现在首页链接中；产物测试会从 `src/content/**/*.md` 独立核对每个 slug。`/404` 专门用于构建 `404.html`，与 Router 的未找到页面共用组件。未启用 SPA shell 或将未知 URL 回退到首页。

Start 在构建过程中仍会生成 `dist/server/` 并临时运行服务端渲染器，这是生成静态 HTML 的构建步骤。**只发布 `dist/client/`，不要运行或上传 `dist/server/`**。文章加载器使用打包的本地内容，不需要运行时 API、数据库或 server functions。新增或修改 Markdown 后须重新构建并发布静态文件。域名未指定，因此不生成带占位域名的 sitemap。

`typecheck` 会先生成类型安全的路由树，再运行 TypeScript 检查。

`npm test` 使用 Vitest 验证实际 content 目录的自动收集，以及元信息解析、必填字段、真实日历日期、重复 slug、空正文与排序；另用内存 Router 验证 Markdown 内外链、相对路径和查询参数/片段的渲染。`npm run test:static` 可独立复验已有构建：仅通过文件服务器读取 `dist/client/`，核对每篇文章的 HTML 标题和完整正文、直接访问/尾斜杠/查询参数、首页链接与 JS/CSS、未知 URL 的中文 HTTP 404。

GitHub Actions 在 PR 和 `main` 推送时执行依赖安装、单元测试、类型检查、构建及静态产物验收，成功后上传 **`blog-static` artifact**，内容仅为 `dist/client/`。checkout/setup-node 使用运行于 Node 24 的 v5，项目构建也使用 Node 24。CI 不执行服务器部署。

`@tanstack/router-cli` 固定为当前锁文件中的 `1.167.46`，避免路由生成器随 caret 范围漂移；升级时与 Router/Start 一起复核路由生成、测试、类型检查和构建。

## 本地预览静态站

```bash
npm run build
npm run preview
```

打开 <http://127.0.0.1:4173>，也可直接打开或刷新 `/posts/hello-blog`、`/posts/writing-as-thinking`。`preview` 使用开发依赖 `http-server` **只提供 `dist/client/` 文件**，不启动 Start/srvx；关闭 JavaScript 仍能阅读首页和文章正文。未知路径返回 `404.html` 且保持 HTTP 404。此 Node 文件服务器只用于本地预览和 CI 检查，生产使用 Caddy。

若 4173 已占用，可另选端口：`npm exec -- http-server dist/client -a 127.0.0.1 -p 4174 -c-1 -d false`。

## Caddy 静态托管

把 `dist/client/` 的内容放到运维选择的站点目录即可。下面是本地或运维参考用的 Caddyfile（路径和端口按环境调整）：

```caddyfile
:8080 {
    root * /srv/blog
    encode zstd gzip
    file_server

    handle_errors 404 {
        rewrite * /404.html
        file_server
    }
}
```

Caddy 按目录索引提供 `/posts/<slug>/index.html`，无尾斜杠的文章地址会规范化到带尾斜杠地址；直接访问和刷新均得到真实静态 HTML。`handle_errors` 提供中文错误页并保留 404 状态，不配置 `reverse_proxy` 或 SPA 首页回退。生产主机无需 Node、npm、源码或 `node_modules`。

本仓库仅提供静态产物与配置示例；实际服务器、域名/TLS、发布与回滚策略由运维确定，本 PR 不执行上线操作。

## 写一篇文章

1. 在 `src/content/` 添加 `.md` 文件（支持子目录）。文件名去掉扩展名就是 slug，须由小写字母、数字和单个连字符组成，且所有子目录内不能重名，例如 `my-first-post.md`。
2. 文件顶部填写 YAML frontmatter，日期建议加引号；正文从二级标题开始（页面会显示文章主标题）：

   ```markdown
   ---
   title: 第一篇文章
   date: '2026-10-25'
   category: 开发手记
   description: 一句话摘要。
   ---

   ## 正文标题

   写下内容。
   ```

3. 无需编辑 registry 或手写预渲染路径：Vite 自动扫描 `src/content/**/*.md`，首页按日期倒序展示（同日按 slug 排序），详情页地址为 `/posts/<slug>`。标题、日期、分类、摘要和正文均不可为空；无效日期或重复 slug 会报出文件路径，`npm test` 会校验实际文章。发布前运行 `npm run build`，新增文章会随首页链接自动导出，并由产物测试核对。

站内链接推荐使用 `/posts/<slug>` 或 `/`（不是 `.md` 文件路径），统一通过 TanStack Router `Link` 导航，也支持相对路径、查询参数与片段。外部 URL、`mailto:`、协议相对 URL 和纯页内 `#anchor` 保留原生链接行为。

支持常用 Markdown 标题、列表、链接、引用和代码块。不执行 Markdown 内的 HTML 或脚本，无需数据库或 CMS。

```text
src/
  content/              # 含 frontmatter 的中文 Markdown
  components/markdown-link.tsx # Markdown 内链导航
  lib/posts.ts          # 自动收集文章与日期格式化
  lib/parse-posts.ts    # frontmatter 解析、校验与排序
  routes/__root.tsx     # 共享布局、页面元信息与 404
  routes/404.tsx        # 构建用错误页，输出 404.html
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
