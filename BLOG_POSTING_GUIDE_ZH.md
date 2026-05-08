## 第 0 步：本站文章页设计规则

当前文章页是“Archive / Case File”风格：顶部像档案封面，正文区域优先保证长文阅读，媒体内容作为正文证据材料出现。写文章时建议遵守这些规则。

### 0.1 推荐文章信息完整度

每篇正式文章尽量写完整：

```yaml
---
title: 一句明确、有辨识度的标题
published: 2026-05-08
updated: 2026-05-08
description: 文章页标题下方和首页卡片会用到的短摘要，建议 40～90 字。
image: ./cover.jpg
tags: [Astro, 设计, 个人站]
category: 技术
draft: true
lang: zh_CN
---
```

发布前把 `draft` 改成 `false`。

### 0.2 封面图不是必填

文章页兼容有封面和无封面：

- 有封面：适合长文、项目复盘、视觉展示、动画观后感。
- 无封面：适合短笔记、技术记录、命令备忘、纯文字随笔。

如果没有合适的封面，不要硬塞图。留空即可：

```yaml
image: ''
```

### 0.3 正文结构建议

文章主体仍然以文字为中心。推荐结构：

```md
开头先用 1～3 段说明这篇文章解决什么问题、为什么写。

## 背景

## 过程

## 关键细节

## 结论
```

不要为了版式强行凑小节。短文可以只有 1～2 个二级标题。

### 0.4 图片写法

推荐把图片放在文章目录里：

```text
src/content/posts/my-post/
├── index.md
├── cover.jpg
└── step-1.png
```

正文引用：

```md
![截图说明](./step-1.png)
```

图片会自动获得圆角、边框和轻阴影。图片很多时，正文里要穿插解释，不要连续堆图。

### 0.5 视频和外部嵌入

可以直接使用 iframe，例如 YouTube / Bilibili：

```html
<iframe
  width="100%"
  height="468"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube video player"
  frameborder="0"
  allowfullscreen>
</iframe>
```

文章页会把 iframe 按 16:9 响应式处理。视频前后最好各有一段文字解释“为什么放这个视频”。

### 0.6 代码块和表格

代码块适合放：

```md
```bash
pnpm dev --host 127.0.0.1 --port 3000
```
```

表格适合对比信息，但不要写太宽。移动端会横向滚动。

### 0.7 分类和标签建议

分类保持少而稳定，例如：

```yaml
category: 技术
category: 日志
category: 动画
category: 设计
```

标签描述细节，例如：

```yaml
tags: [Astro, Tailwind, VPS]
tags: [番剧, 观后感, 京阿尼]
tags: [个人站, UI, Redesign]
```

---

## 第 1 步：写草稿和添加文章内容

### 1.1 文章放在哪里

所有博客文章都放在：

```text
src/content/posts/
```

推荐每篇文章用一个独立目录：

```text
src/content/posts/
└── my-first-post/
    ├── index.md
    ├── cover.jpg
    └── image-1.png
```

这样做的好处是：

- 文章正文和图片放在一起，不容易乱。
- 文章封面可以直接写相对路径。
- 以后迁移或删除一篇文章时，只需要处理一个目录。

也可以直接写单个 Markdown 文件：

```text
src/content/posts/my-first-post.md
```

但如果文章里会放图片，优先用目录形式。

---

### 1.2 用命令创建一篇新文章

项目里已经有新建文章脚本。

在项目根目录执行：

```bash
pnpm new-post my-first-post/index.md
```

它会创建：

```text
src/content/posts/my-first-post/index.md
```

生成后的模板大概是：

```md
---
title: my-first-post/index.md
published: 2026-05-07
description: ''
image: ''
tags: []
category: ''
draft: false
lang: ''
---
```

你通常需要手动改成更像正式文章的样子。

---

### 1.3 推荐的文章模板

新文章建议直接用这个模板：

```md
---
title: 我的第一篇文章
published: 2026-05-07
description: 这是一段会显示在首页文章卡片上的摘要。
image: ./cover.jpg
tags: [生活, 随笔, 博客]
category: 日志
draft: true
lang: zh_CN
---

这里开始写正文。

## 第一节

正文内容。

![文章内图片](./image-1.png)
```

先保持：

```yaml
draft: true
```

等确认可以发布后，再改成：

```yaml
draft: false
```

---

### 1.4 frontmatter 每个字段是什么意思

文章开头两条 `---` 中间的部分叫 frontmatter。

它控制文章标题、时间、分类、标签、封面图、是否发布等信息。

```yaml
---
title: 我的第一篇文章
published: 2026-05-07
updated: 2026-05-08
description: 这是一段摘要。
image: ./cover.jpg
tags: [生活, 随笔, 博客]
category: 日志
draft: true
lang: zh_CN
---
```

字段说明：

| 字段 | 必填 | 作用 |
|---|---:|---|
| `title` | 是 | 文章标题。首页卡片和文章页顶部都会显示。 |
| `published` | 是 | 发布时间。影响文章排序，越新的文章越靠前。 |
| `updated` | 否 | 更新时间。文章页会显示更新时间；首页卡片目前隐藏更新时间。 |
| `description` | 否 | 首页文章卡片摘要。为空时会从正文自动截取摘要。 |
| `image` | 否 | 文章封面图。首页卡片右侧图片和文章页顶部封面都用它。 |
| `tags` | 否 | 标签，可以有多个。显示在 `#` 图标后面。 |
| `category` | 否 | 分类，只能写一个。显示在书本图标后面。 |
| `draft` | 否 | 是否草稿。`true` 表示正式构建时不发布。 |
| `lang` | 否 | 文章语言，中文通常写 `zh_CN`。 |

---

### 1.5 首页文章卡片上的信息是怎么来的

你截图里的文章卡片信息来自这些字段。

```text
Draft Example
2022-07-01    Examples    Markdown / Blogging / Demo
This article is currently...
72 字 | 1 分钟
```

对应关系如下：

| 卡片位置 | 来源 |
|---|---|
| 标题 `Draft Example` | `title` |
| 日历图标后的日期 | `published` |
| 书本图标后的 `Examples` | `category` |
| `#` 图标后的 `Markdown / Blogging / Demo` | `tags` |
| 摘要文字 | 优先使用 `description`；没有就自动取正文摘要 |
| `72 字` | 自动统计正文字数 |
| `1 分钟` | 自动估算阅读时间 |
| 右侧箭头按钮 | 没有 `image` 时显示进入按钮 |
| 右侧封面图 | 有 `image` 时显示封面图 |

所以，如果你想让首页卡片右侧出现图片，只需要给文章设置：

```yaml
image: ./cover.jpg
```

并把图片放在同一个文章目录下：

```text
src/content/posts/my-first-post/
├── index.md
└── cover.jpg
```

---

### 1.6 分类和标签的显示逻辑

#### 分类 category

每篇文章只有一个分类：

```yaml
category: 日志
```

显示位置：

- 首页文章卡片中，书本图标后面。
- 文章详情页的元信息区域。
- 左侧侧栏的 Categories 区域。
- `/archive/?category=日志` 归档筛选中。

如果不写分类或写空字符串：

```yaml
category: ''
```

它会被当成未分类。

#### 标签 tags

每篇文章可以有多个标签：

```yaml
tags: [生活, 随笔, 博客]
```

显示位置：

- 首页文章卡片中，`#` 图标后面。
- 多个标签之间用 `/` 分隔。
- 文章详情页的元信息区域。
- 左侧侧栏的 Tags 区域。
- `/archive/?tag=生活` 归档筛选中。

如果不想写标签：

```yaml
tags: []
```

#### 建议规则

分类用来表达大方向：

```yaml
category: 日志
category: 技术
category: 动画
category: 阅读
```

标签用来表达细节：

```yaml
tags: [Astro, 部署, VPS]
tags: [生活, 随笔, 五月]
tags: [动画, 观后感, 京阿尼]
```

不要把分类写得太碎。分类少一点，标签多一点，会更好维护。

---

### 1.7 草稿怎么写

草稿只需要设置：

```yaml
draft: true
```

完整例子：

```md
---
title: 还没写完的文章
published: 2026-05-07
description: 这篇还没写完。
image: ./cover.jpg
tags: [草稿, 随笔]
category: 日志
draft: true
lang: zh_CN
---

这里先随便写。
```

本地开发时，草稿可以看到，方便你预览。

正式构建时，`draft: true` 的文章不会发布到网站里。

发布前改成：

```yaml
draft: false
```

---

### 1.8 正文里怎么加图片

推荐文章目录结构：

```text
src/content/posts/my-first-post/
├── index.md
├── cover.jpg
├── image-1.png
└── image-2.jpg
```

正文里这样引用：

```md
![图片说明](./image-1.png)
```

再来一张：

```md
![另一张图片](./image-2.jpg)
```

封面图和正文图片可以是同一张，也可以不同。

封面图：

```yaml
image: ./cover.jpg
```

正文图：

```md
![正文里的图片](./image-1.png)
```

---

### 1.9 图片也可以放在 public 目录

如果你想让图片变成固定公开路径，可以放到：

```text
public/images/posts/
```

例如：

```text
public/images/posts/my-cover.jpg
```

文章里写：

```yaml
image: /images/posts/my-cover.jpg
```

正文里写：

```md
![图片说明](/images/posts/my-cover.jpg)
```

但普通文章更推荐把图片放在文章自己的目录里。

---

### 1.10 本地预览文章

启动本地开发服务：

```bash
pnpm dev --host 127.0.0.1 --port 3000
```

浏览器打开：

```text
http://127.0.0.1:3000/
```

检查三件事：

1. 首页文章卡片是否显示正常。
2. 点进文章详情页是否正常。
3. 图片、分类、标签是否正常。

如果文章还是草稿：

```yaml
draft: true
```

本地能看到是正常的。

正式发布前记得改成：

```yaml
draft: false
```

---

### 1.11 发布前检查

发布前建议跑：

```bash
pnpm build
```

如果构建通过，再发布。

如果构建失败，优先检查：

- frontmatter 有没有写错。
- 日期是不是合法格式，比如 `2026-05-07`。
- `tags` 是不是数组格式，比如 `[生活, 随笔]`。
- 图片路径是否存在。
- `draft` 是否是 `true` 或 `false`，不要写成字符串。

---

## 第 2 步：更新 VPS 上的文章

这一部分讲你已经把网站部署在 VPS 上之后，后续想更新文章时怎么做。

这里有两种工作流。

推荐使用第一种。

---

### 2.1 推荐工作流：本地写文章，Git 推送，VPS 拉取构建

这个方式最稳。

流程是：

```text
本地写文章 → 本地预览 → git commit → git push → VPS git pull → pnpm build → 重载网站服务
```

---

### 2.2 本地写文章

在本地项目里新增文章：

```bash
pnpm new-post my-new-post/index.md
```

编辑：

```text
src/content/posts/my-new-post/index.md
```

如果有图片，放到同一个目录：

```text
src/content/posts/my-new-post/
├── index.md
├── cover.jpg
└── image-1.png
```

文章写完后，本地预览：

```bash
pnpm dev --host 127.0.0.1 --port 3000
```

确认没问题后，发布前把：

```yaml
draft: true
```

改成：

```yaml
draft: false
```

然后构建检查：

```bash
pnpm build
```

---

### 2.3 提交到 Git

确认只提交你要发布的文章和图片。

查看改动：

```bash
git status
```

添加文章目录：

```bash
git add src/content/posts/my-new-post
```

如果还改了别的必要文件，也一起添加。

提交：

```bash
git commit -m "Add new blog post"
```

推送：

```bash
git push
```

---

### 2.4 在 VPS 上更新代码

SSH 登录 VPS：

```bash
ssh 用户名@服务器IP
```

进入网站项目目录。

示例：

```bash
cd /var/www/fuwari
```

拉取最新代码：

```bash
git pull
```

安装依赖通常不需要每次都跑。

如果 `package.json` 或 `pnpm-lock.yaml` 变了，再跑：

```bash
pnpm install --frozen-lockfile
```

构建网站：

```bash
pnpm build
```

构建成功后，会生成：

```text
dist/
```

你的 Nginx 或静态服务应该指向这个 `dist/` 目录，或者指向你部署脚本复制过去的目录。

---

### 2.5 重载网站服务

如果你的 Nginx 直接指向项目的 `dist/` 目录，通常构建完成后刷新网页就能看到更新。

如果你有单独复制部署目录，示例：

```bash
rsync -a --delete dist/ /var/www/html/
```

然后重载 Nginx：

```bash
sudo systemctl reload nginx
```

如果你用的是某个 Node 静态服务或进程管理器，需要按你的服务方式重启。

例如 PM2：

```bash
pm2 restart fuwari
```

---

### 2.6 快速更新清单

每次发文章可以按这个顺序做。

本地：

```bash
pnpm new-post my-new-post/index.md
pnpm dev --host 127.0.0.1 --port 3000
pnpm build
git status
git add src/content/posts/my-new-post
git commit -m "Add new blog post"
git push
```

VPS：

```bash
cd /var/www/fuwari
git pull
pnpm build
sudo systemctl reload nginx
```

如果你的部署目录不是 Nginx 直接读 `dist/`，就在 `pnpm build` 后加复制命令：

```bash
rsync -a --delete dist/ /var/www/html/
```

---

### 2.7 另一种工作流：直接在 VPS 上写文章

不推荐，但可以。

流程：

```text
SSH 到 VPS → 直接编辑 src/content/posts → pnpm build → 重载服务
```

示例：

```bash
ssh 用户名@服务器IP
cd /var/www/fuwari
pnpm new-post my-new-post/index.md
nano src/content/posts/my-new-post/index.md
pnpm build
sudo systemctl reload nginx
```

缺点：

- 不方便预览和改图。
- 容易忘记提交 Git。
- VPS 上直接改文件，后续和本地仓库可能冲突。

如果你临时这样做，建议最后也提交：

```bash
git status
git add src/content/posts/my-new-post
git commit -m "Add new blog post"
git push
```

---

## 最推荐的固定习惯

### 写文章时

1. 每篇文章一个目录。
2. `index.md` 放正文。
3. 图片放同目录。
4. 封面写 `image: ./cover.jpg`。
5. 没写完就 `draft: true`。
6. 写完发布前改 `draft: false`。

### 分类和标签

1. `category` 只写一个大类。
2. `tags` 写多个细节关键词。
3. 不要频繁创造重复含义的分类。
4. 标签可以自由一点，但也不要太碎。

### 发布时

1. 本地先 `pnpm build`。
2. Git 提交并推送。
3. VPS 拉取。
4. VPS 构建。
5. 重载服务。

---

## 最小完整示例

目录：

```text
src/content/posts/vps-blog-update/
├── index.md
├── cover.jpg
└── deploy-flow.png
```

`index.md`：

```md
---
title: 我是如何更新 VPS 上的个人博客的
published: 2026-05-07
description: 记录一次从本地写文章到 VPS 发布的完整流程。
image: ./cover.jpg
tags: [VPS, Astro, 部署]
category: 技术
draft: true
lang: zh_CN
---

这篇文章记录我的博客更新流程。

## 本地写作

先在本地写文章，然后预览。

![部署流程](./deploy-flow.png)

## VPS 发布

确认构建通过后，再推送到服务器。
```

发布时只改一行：

```yaml
draft: false
```

然后走更新流程即可。
