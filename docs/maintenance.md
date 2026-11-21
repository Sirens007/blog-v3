# 站点维护入口

本仓库以原主题当前版本为基线维护，不再执行 `pnpm init-project`。文章与订阅数据按本站需求维护；`redirects.json` 仅保留本站需要的地址映射。

| 内容 | 维护位置 |
| --- | --- |
| 站点名称、作者、域名、备案基础数据 | `blog.config.ts` |
| Umami、Twikoo 脚本与服务地址 | `blog.config.ts` |
| 导航、页脚、潮间带 emoji | `app/app.config.ts` |
| 站点头像、评论框提示与邮箱头像说明 | [评论与邮箱头像](comments.md) |
| 文章与预览稿 | `content/posts/`、`content/previews/` |
| GitHub Actions 自动部署、服务器目录与回退 | [服务器部署](deployment.md) |

## 迁入文章的固定地址

从 Shirone 迁入的 41 篇文章继续使用原域名与 `/posts/<原目录>/<原文件名>/` 地址，大小写和尾斜杠以原站点地图为准。地址写在每篇 Markdown 的 `permalink` 中，文章和图片仍保存在当前年份目录，无需移动。

- `redirects.json` 将迁移预览阶段的 `/2025/...`、`/2026/...` 地址重定向到上述固定地址，状态码为 308；原作者的历史重定向已移除。
- Nuxt Content 的内部查询路径不带尾斜杠；迁入文章的链接、分享链接、Atom 和 canonical 使用 `permalink` 指定的公开地址，包括尾斜杠。
- Twikoo 显式使用文章 `permalink` 作为评论路径；Umami 保持原网站 ID，浏览器继续访问原文章路径。
- 未来新增文章仍按主题默认的 `/年份/文章名` 路径发布，无需添加 `permalink` 或重定向。本站没有设置全局尾斜杠规则，也没有更改主题默认的预渲染配置。上线时检查服务器不会将旧地址改写到其他路径。

仓库通过 `.gitattributes` 固定文本文件使用 LF，与 `.editorconfig` 保持一致；无需修改个人全局 Git 配置。

文章封面统一转换为 WebP，命名为各文章 `images/` 目录下的 `cover.webp`，并在 frontmatter 的 `image` 字段引用对应的 `/article-assets/年份/文章目录/images/cover.webp` 地址。转换时同步修改引用，保留原图尺寸、构图和文章固定地址。

列表和轮播封面使用 `nuxt.config.ts` 的 `image.presets.postThumbnail`，输出 640px 宽的 WebP 缩略图，并在两个组件中固定 `densities="1"` 避免全局倍图配置放大尺寸。首页仅在静态生成时通过同一预设登记全部文章封面，使后续分页和分类筛选也有可用的缩略图。正文和文章页头部继续使用原有图片路径；验收时应检查后续分页的图片也能正常加载。

## 新文章的 Markdown 与显示检查

新增或整理文章时保留正文、代码和章节编号。模仿 example 的标题显示效果应使用文章版式与 MDC 组件，而不是删除编号；`type: story` 提供居中的衬线标题与浅色圆形背景，`Quote` 的图标插槽可用于淡色大字叠在说明文字后面的效果。

每篇新文章都要先检查实际 MDC 解析结果，修复意外露出的 `**`、删除线、反引号和链接标记，检查代码块是否闭合。语气用的单个 `~` 可能误触发删除线，需要显示波浪号时写成 `\~`，真正的删除线使用 `~~文字~~`。需要展示这些标记本身时，放入行内代码或代码块。构建后再检查生成的 HTML，确保问题没有残留。全部表格的块、表头和单元格统一居中，各列使用 `:---:` 对齐标记；`check:article` 会检查列对齐，并需另行检查窄屏下的横向滚动。

```powershell
pnpm check:article content/posts/2026/http-https/index.md
pnpm generate
pnpm check:article --generated content/posts/2026/http-https/index.md
```

修改后至少执行完整校验与生产构建：

```powershell
pnpm exec eslint . --max-warnings 0
pnpm generate
```

部署前再检查 `git diff --check` 与 `git status --short`，确认没有误删上游内容。正式提交和推送另行进行。
