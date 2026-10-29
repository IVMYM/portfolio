# 刘源 / Yuan Liu

个人开发者作品集。简体中文 / English，默认中文。静态站点，可部署到 GitHub Pages。

Personal developer portfolio. Simplified Chinese and English, Chinese by default. Static site, ready for GitHub Pages.

## 中文

### 本地预览

```bash
npm ci
npm run dev
```

浏览器打开终端里给出的本地地址。生产构建：

```bash
npm run build
npm run preview
```

`npm run build` 会先检查 `content/site.json`，再把站点输出到 `dist/`。

### 改内容

全站文案在一个文件里：`content/site.json`。

- 每种可见文字都是 `{ "zh": "…", "en": "…" }`，两种语言都要写。
- `projects` 的顺序就是首页卡片的顺序。当前 8 个代表作不要随便改 `id`，详情页地址是 `#/work/<id>`。
- `kind` 为 `case` 表示任职期间的案例，`personal` 表示个人项目。
- 公司项目只写问题、架构和个人职责，不要贴代码。
- 只有确认是本人公开的个人仓库时才加 `links`。目前公开链接是 `r2-relay`。PhotoSync 与 TrustSQL 不要加仓库地址。
- 不要写入客户名称、雇主名称、内网地址、主机名、工号，或公司代码仓库。
- 不知道的数字和结果就留空，不要补。

新增一个项目时，复制 `projects` 里任意一项，换一个未占用的 `id`，中英文都填上，然后运行 `npm run check`。

### 联系邮箱

`contact.email` 现在是 `TODO`。换成真实邮箱后，页面上的邮件链接和 TODO 提示会一起更新。在换成真实地址之前，不要把占位文字改成一个假邮箱。

### 语言和主题

页头可以切换中文 / EN，以及浅色 / 深色。选择会记在浏览器本地。第一次打开时语言是中文，颜色跟随系统。

### 字体

拉丁字母使用随仓库安装的 Newsreader、Outfit、IBM Plex Mono。中文使用按站点用字裁过的 Noto Sans SC / Noto Serif SC，文件在 `src/fonts/`。这样不依赖外部字体服务。

改了大量中文之后，如果个别新字没有显示，在本机安装 `fonttools`（`pip install fonttools brotli`）后运行：

```bash
npm run fonts
```

脚本会按当前文案重新裁字。没有安装字体工具时，构建仍使用已经提交的字体文件，缺字会回退到系统中文字体。

### 启用 GitHub Pages

1. 打开仓库的 Settings → Pages。
2. Build and deployment 的 Source 选择 **GitHub Actions**。
3. 推送到 `main` 后，`.github/workflows/pages.yml` 会安装依赖、检查文案、构建并发布。
4. 站点地址形如 `https://<用户名>.github.io/portfolio/`。
5. 构建使用相对路径，所以放在项目站点或用户站点下都可以。

仓库需要允许 Actions 创建 `github-pages` 环境。第一次发布若失败，先到 Settings → Pages 把 Source 设为 GitHub Actions，再重新跑该工作流。

## English

### Preview locally

```bash
npm ci
npm run dev
```

Open the local address printed in the terminal. For a production build:

```bash
npm run build
npm run preview
```

`npm run build` checks `content/site.json`, then writes the site to `dist/`.

### Edit the content

All copy lives in one file: `content/site.json`.

- Every visible string is `{ "zh": "…", "en": "…" }`. Fill both languages.
- `projects` order is the homepage order. Keep the current eight ids stable; a detail page lives at `#/work/<id>`.
- `kind: "case"` is work done at a software company. `kind: "personal"` is a personal project.
- Company projects describe the problem, the architecture, and what you did. Do not paste code.
- Add `links` only for a public personal repository you are sure is yours. The public link today is `r2-relay`. Do not add a repository URL for PhotoSync or TrustSQL.
- Do not add client names, the employer’s name, internal addresses, hostnames, an employee id, or company source repositories.
- If a number or result is unknown, leave it out.

To add a project, duplicate any object in `projects`, give it an unused `id`, fill both languages, and run `npm run check`.

### Contact email

`contact.email` is `TODO`. Replace it with a real address and the mailto link and the TODO notice update together. Until then, do not invent an address.

### Language and theme

The header switches 中文 / EN and light / dark. The choice is stored in the browser. The first visit is Chinese, and the theme follows the system.

### Fonts

Latin text uses Newsreader, Outfit, and IBM Plex Mono from the installed packages. Chinese uses a subset of Noto Sans SC and Noto Serif SC in `src/fonts/`, so the site does not call an external font host.

After a large Chinese edit, if a new character is missing, install `fonttools` (`pip install fonttools brotli`) and run:

```bash
npm run fonts
```

That rebuilds the subset from the current copy. Without the font tools, the build keeps the committed font files and missing glyphs fall back to a system CJK font.

### Turn on GitHub Pages

1. Open Settings → Pages for this repository.
2. Under Build and deployment, set Source to **GitHub Actions**.
3. A push to `main` runs `.github/workflows/pages.yml`, which installs, checks the copy, builds, and deploys.
4. The site will be at `https://<user>.github.io/portfolio/`.
5. Asset paths are relative, so the same build works for a project site or a user site.

The repository must allow Actions to use the `github-pages` environment. If the first run fails, set Pages source to GitHub Actions, then rerun the workflow.
