# 站点维护入口

本仓库以原主题当前版本为基线维护，不再执行 `pnpm init-project`，也不批量清空原有文章、预览稿、订阅数据或重定向。

| 内容 | 维护位置 |
| --- | --- |
| 站点名称、作者、域名、备案基础数据 | `blog.config.ts` |
| Umami、Twikoo 脚本与服务地址 | `blog.config.ts` |
| 导航、页脚、潮间带 emoji | `app/app.config.ts` |
| 站点头像、评论框提示与邮箱头像说明 | [评论与邮箱头像](comments.md) |
| 文章与预览稿 | `content/posts/`、`content/previews/` |

修改配置后至少执行：

```powershell
pnpm exec eslint blog.config.ts app/app.config.ts app/components/post/Comment.vue app/types/index.ts
pnpm generate
```

部署前再检查 `git diff --check` 与 `git status --short`，确认没有误删上游内容。正式提交和推送另行进行。
