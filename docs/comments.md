# 评论与邮箱头像

## 维护入口

| 内容 | 维护位置 |
| --- | --- |
| 上传头像、邮箱绑定 | [WeAvatar](https://weavatar.com/user/avatar) |
| 站点作者头像的公开图片地址 | `blog.config.ts` → `author.avatar` |
| 公开联系邮箱 | `blog.config.ts` → `author.email` |
| 评论框提示文字 | `app/app.config.ts` → `component.comment.placeholder` |
| Twikoo 服务地址 | `blog.config.ts` → `twikoo.envId` |
| 评论头像来源、邮件通知等服务配置 | Twikoo 后台 |

作者头像与评论头像用途不同：作者头像是站点配置中的固定公开图片地址；评论头像由 Twikoo 根据评论者填写的邮箱获取。绑定头像的邮箱可以与 `author.email` 不同，不要为了关联头像覆盖公开联系方式。

评论框中的“网址”应填写个人主页，例如 `https://blog.syrena.cn/`，不要填写头像地址。头像 URL 也不能放进 `twikoo.envId`。

## 当前接入方式

- Twikoo 2.0.9 的脚本和服务地址都在 `blog.config.ts` 中配置。
- `component.comment.placeholder` 会直接传给 Twikoo 的 `init({ placeholder })`；设为 `undefined` 时使用后台 `COMMENT_PLACEHOLDER`。
- Twikoo 默认可使用 WeAvatar。若后台设置了其他 `GRAVATAR_CDN`，以后台实际配置为准。
- 普通邮箱通常走邮箱头像服务；纯数字 QQ 邮箱可能优先使用 QQ 头像，因此不能保证所有 QQ 邮箱都展示 WeAvatar 图片。
- 邮箱能否收到回复通知取决于 Twikoo 后台邮件配置，前端提示语不会自动开启邮件服务。

## 验收

```powershell
pnpm exec eslint blog.config.ts app/app.config.ts app/components/post/Comment.vue app/types/index.ts
pnpm generate
```

然后用 `pnpm dev` 或 `pnpm preview` 打开友链页和任一文章页，检查：

1. 侧栏显示 Syrena 的 WeAvatar 头像。
2. 评论框显示两行自定义提示，输入正文后提示消失。
3. 填入已绑定 WeAvatar 的邮箱后，头像预览能正常加载。
4. 友链页和文章页的评论框都能初始化，窄屏和深色模式下没有新增溢出。

验证时不要向正式 Twikoo 后台发送无意义测试评论。
