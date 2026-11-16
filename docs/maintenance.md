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

列表和轮播封面使用 `nuxt.config.ts` 的 `image.presets.postThumbnail`，输出 640px 宽的 WebP 缩略图，并在两个组件中固定 `densities="1"` 避免全局倍图配置放大尺寸。首页仅在静态生成时通过同一预设登记全部文章封面，使后续分页和分类筛选也有可用的缩略图。正文和文章页头部继续使用原有图片路径；验收时应检查后续分页的图片也能正常加载。

修改后至少执行完整校验与生产构建：

```powershell
pnpm exec eslint . --max-warnings 0
pnpm generate
```

部署前再检查 `git diff --check` 与 `git status --short`，确认没有误删上游内容。正式提交和推送另行进行。
