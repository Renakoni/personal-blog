---
name: Publishing Console
category: Tooling
status: PLANNED
role: Content Workflow / Admin UI
description: 为个人站准备的发布控制台方向：先管理 Blog、Notes、Projects 的写作与预览，再逐步接入 GitHub API 发布链路。
tags: [CMS, GitHub API, Publishing, 规划中]
link: /projects/
icon: material-symbols:edit-note-outline-rounded
image: ""
draft: false
---

Publishing Console 是后台写作系统方向，目标是把文章、笔记和项目内容统一派发给主站读取。

```warning
title: 只读边界
主站不接管后台编辑逻辑，只负责看懂最终发布内容。
```

```proof
title: 派发约定
Blog 和 Notes 继续使用 src/content/posts/<slug>/index.md，Projects 使用 src/content/projects/*.md。
```

```tabs
Admin = write / preview / publish
Main = read / render / index
Future = project content dispatch
```

```video
src: https://www.youtube.com/embed/VIDEO_ID
note: 视频注记
```
