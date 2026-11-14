# GitHub Actions 服务器部署

向 `main` 推送后，GitHub Actions 的 `Deploy` 工作流依次安装依赖、执行完整 ESLint、静态生成、检查页面、上传服务器并验证正式域名。也可在 Actions 页面使用 **Run workflow** 手动部署当前 `main`。

文章、图片和主题代码在同一仓库，无需 Shirone 以前的内容仓库触发流程。只有检查和构建全部成功才会上传；上传完成后才切换正式站点。部署串行执行，不会主动取消正在发布的任务。

## 仓库 Secrets

在 GitHub 仓库的 **Settings → Secrets and variables → Actions → Repository secrets** 配置：

| 名称 | 内容 |
| --- | --- |
| `DEPLOY_HOST` | 服务器地址，目前为 `106.15.102.169` |
| `DEPLOY_USER` | SSH 用户，目前为 `sirens` |
| `DEPLOY_SSH_KEY` | 已获服务器授权的部署私钥全文，沿用原 Shirone 部署密钥 |
| `DEPLOY_KNOWN_HOSTS` | 已核验的服务器 SSH 公钥记录，供严格主机校验 |

私钥只写入任务运行器的临时 SSH 文件，不进入源码或构建产物；任务结束时移除。SSH 端口沿用 `22`。服务器需要 Bash、rsync、flock、realpath，以及 `sirens` 对 `/var/www/blog` 的写权限。

## 构建和访问路径

固定 Node.js `26.13.0`，pnpm 版本从 `package.json` 的 `packageManager` 读取，使用锁文件安装。第三方 Actions 固定到具体提交，升级时同步更新 SHA 和版本注释。

构建命令为 `env -u GITHUB_ACTIONS pnpm generate`：仅在这个子进程中取消主题的平台检测，让 Nuxt 沿用普通服务器的目录形式输出，例如 `archive/index.html`。`CI` 仍开启，无需改动主题预渲染配置，也无需修改现有 Nginx 的 `try_files $uri $uri/ /index.html`。

构建后检查首页、归档、友链和 `redirects.json` 中迁入文章的 HTML 文件。旧文章的 `permalink`、Umami 网站 ID、Twikoo 配置继续使用仓库当前配置。

## 服务器目录与回退

Nginx 根目录仍是 `/var/www/blog/dist`。辅助脚本 `.github/scripts/deploy-remote.sh` 管理以下目录：

| 目录 | 用途 |
| --- | --- |
| `/var/www/blog/.blog-v3/releases/<运行ID>-<重试次数>/` | 每次完整上传的静态站点 |
| `/var/www/blog/.blog-v3/backups/initial-<运行ID>-<重试次数>/` | 第一次切换时保留的原 Shirone 站点 |
| `/var/www/blog/.blog-v3/deployments/` | 记录每次切换前的版本位置 |
| `/var/www/blog/dist` | 指向当前站点的符号链接，首次部署前为原目录 |

上传使用 rsync，仅同步本次新建的版本目录。第一次发布将原 `dist` 目录移入备份，再切换链接；后续发布通过原子替换符号链接切换，不需要重启 Nginx。

切换后访问正式域名的 `deploy-version.txt`，核对内容与本次提交 SHA 一致。验证失败时工作流标记失败，并自动切回上一个版本。若 SSH 或服务器本身不可用，自动回退也可能失败，此时需在 Actions 日志中检查回退步骤。

需要手动回退时，从失败运行日志取得运行 ID 和提交 SHA，在仓库目录执行：

```bash
ssh sirens@106.15.102.169 "bash -s -- rollback <运行ID>-<重试次数> <40位提交SHA>" < .github/scripts/deploy-remote.sh
```

脚本只允许回退当前仍在运行的那个版本，防止误覆盖后续部署。最早的原站备份和各次构建暂不自动删除；根据磁盘使用情况手动清理已确认不再使用的版本，保留当前版本及所需回退版本。

旧 Shirone 的 `Deploy` 工作流应保持停用，避免两个仓库同时部署到同一路径。首次推送前，确认 GitHub Secrets 已配置；首次运行完成后检查 Actions 结果及正式首页、旧文章、评论、Umami。
